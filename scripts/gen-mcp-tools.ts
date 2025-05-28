import { dereference } from '@readme/openapi-parser';
import fs from 'fs';
import type { JSONSchema7 as IJsonSchema } from 'json-schema';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { OpenAPIV3 } from 'openapi-types';
import prettier from 'prettier';

import { ENABLED_TASKADE_ACTIONS } from '../src/constants';

const isOperation = (method: string, _operation: any): _operation is OpenAPIV3.OperationObject => {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase());
};
const isParameterObject = (
  param: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject,
): param is OpenAPIV3.ParameterObject => {
  return !('$ref' in param);
};

const isRequestBodyObject = (
  body: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject,
): body is OpenAPIV3.RequestBodyObject => {
  return !('$ref' in body);
};

const getResponseObject = (
  response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject,
): OpenAPIV3.ResponseObject => {
  if ('$ref' in response) {
    throw new Error('Reference not supported');
  }

  return response;
};

const convertOpenApiSchemaToJsonSchema = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
): IJsonSchema => {
  if ('$ref' in schema) {
    // Should already be dereferenced
    throw new Error('Reference not supported');
  }

  const jsonSchema: IJsonSchema = {};

  // Handle basic properties
  if (schema.type) {
    jsonSchema.type = schema.type;
  }

  if (schema.description) {
    jsonSchema.description = schema.description;
  }

  if (schema.default !== undefined) {
    jsonSchema.default = schema.default;
  }

  if (schema.example !== undefined) {
    jsonSchema.examples = [schema.example];
  }

  // Handle enum
  if (schema.enum) {
    jsonSchema.enum = schema.enum;
  }

  // Handle format
  if (schema.format) {
    jsonSchema.format = schema.format;
  }

  // Handle number/integer constraints
  if (schema.minimum !== undefined) {
    jsonSchema.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    jsonSchema.maximum = schema.maximum;
  }
  if (typeof schema.exclusiveMinimum === 'number') {
    jsonSchema.exclusiveMinimum = schema.exclusiveMinimum;
  }
  if (typeof schema.exclusiveMaximum === 'number') {
    jsonSchema.exclusiveMaximum = schema.exclusiveMaximum;
  }
  if (schema.multipleOf !== undefined) {
    jsonSchema.multipleOf = schema.multipleOf;
  }

  // Handle string constraints
  if (schema.minLength !== undefined) {
    jsonSchema.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    jsonSchema.maxLength = schema.maxLength;
  }
  if (schema.pattern) {
    jsonSchema.pattern = schema.pattern;
  }

  // Handle array
  if (schema.type === 'array' && schema.items) {
    jsonSchema.items = Array.isArray(schema.items)
      ? schema.items.map((item) => convertOpenApiSchemaToJsonSchema(item))
      : convertOpenApiSchemaToJsonSchema(schema.items);

    if (schema.minItems !== undefined) {
      jsonSchema.minItems = schema.minItems;
    }
    if (schema.maxItems !== undefined) {
      jsonSchema.maxItems = schema.maxItems;
    }
    if (schema.uniqueItems !== undefined) {
      jsonSchema.uniqueItems = schema.uniqueItems;
    }
  }

  // Handle object
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    jsonSchema.type = 'object';

    if (schema.properties) {
      jsonSchema.properties = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        jsonSchema.properties[key] = convertOpenApiSchemaToJsonSchema(value);
      }
    }

    if (schema.additionalProperties !== undefined) {
      jsonSchema.additionalProperties =
        typeof schema.additionalProperties === 'boolean'
          ? schema.additionalProperties
          : convertOpenApiSchemaToJsonSchema(schema.additionalProperties);
    }

    if (schema.required) {
      jsonSchema.required = schema.required;
    }

    if (schema.minProperties !== undefined) {
      jsonSchema.minProperties = schema.minProperties;
    }
    if (schema.maxProperties !== undefined) {
      jsonSchema.maxProperties = schema.maxProperties;
    }
  }

  // Handle allOf, anyOf, oneOf
  if (schema.allOf) {
    jsonSchema.allOf = schema.allOf.map((s) => convertOpenApiSchemaToJsonSchema(s));
  }
  if (schema.anyOf) {
    jsonSchema.anyOf = schema.anyOf.map((s) => convertOpenApiSchemaToJsonSchema(s));
  }
  if (schema.oneOf) {
    jsonSchema.oneOf = schema.oneOf.map((s) => convertOpenApiSchemaToJsonSchema(s));
  }
  if (schema.not) {
    jsonSchema.not = convertOpenApiSchemaToJsonSchema(schema.not);
  }

  // Handle nullable
  if (schema.nullable) {
    if (jsonSchema.type) {
      if (Array.isArray(jsonSchema.type)) {
        jsonSchema.type = [...jsonSchema.type, 'null'];
      } else {
        jsonSchema.type = [jsonSchema.type, 'null'];
      }
    } else {
      jsonSchema.type = 'null';
    }
  }

  return jsonSchema;
};

type ParsedTool = {
  name: string;
  description: string;
  method: string;
  path: string;
  pathParamsSchema: IJsonSchema | null;
  queryParamsSchema: IJsonSchema | null;
  inputSchema: IJsonSchema;
  outputSchema: IJsonSchema;
};

const generateToolInputFromParsedTool = (tool: ParsedTool) => {
  const mergedSchema = JSON.parse(JSON.stringify(tool.inputSchema));
  mergedSchema.properties = {
    ...mergedSchema.properties,
    ...tool.pathParamsSchema?.properties,
    ...tool.queryParamsSchema?.properties,
  };
  mergedSchema.required = [
    ...mergedSchema.required,
    ...(tool.pathParamsSchema?.required ?? []),
    ...(tool.queryParamsSchema?.required ?? []),
  ];

  return `${jsonSchemaToZod(mergedSchema)}.shape`;
};

try {
  const parsed = await dereference('taskade-public.yaml');
  const paths = parsed.paths ?? {};

  const tools: ParsedTool[] = [];

  Object.entries(paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([method, operation]) => {
      if (!isOperation(method, operation)) {
        return;
      }

      const inputSchema: IJsonSchema = {
        type: 'object',
        properties: {},
        required: [],
      };

      const pathParamsSchema: IJsonSchema = {
        type: 'object',
        properties: {},
        required: [],
      };

      const queryParamsSchema: IJsonSchema = {
        type: 'object',
        properties: {},
        required: [],
      };

      // Handle parameters (path, query, header, cookie)
      if (operation.parameters) {
        for (const param of operation.parameters) {
          if (isParameterObject(param) && param.schema) {
            let obj: IJsonSchema = inputSchema;

            if (param.in === 'path') {
              obj = pathParamsSchema;
            } else if (param.in === 'query') {
              obj = queryParamsSchema;
            }

            obj.properties![param.name] = convertOpenApiSchemaToJsonSchema(param.schema);

            if (param.required) {
              obj.required!.push(param.name);
            }
          }
        }
      }

      if (operation.requestBody) {
        if (isRequestBodyObject(operation.requestBody)) {
          if (
            operation.requestBody.content &&
            operation.requestBody.content['application/json'] &&
            operation.requestBody.content['application/json'].schema
          ) {
            const bodySchema = convertOpenApiSchemaToJsonSchema(
              operation.requestBody.content['application/json'].schema,
            );

            if (bodySchema.type === 'object' && bodySchema.properties) {
              for (const [name, propSchema] of Object.entries(bodySchema.properties)) {
                inputSchema.properties![name] = propSchema;
              }
            }
          }
        }
      }

      let responseSchema: IJsonSchema = {
        type: 'object',
        properties: {},
        required: [],
      };

      if (operation.responses) {
        for (const [status, response] of Object.entries(operation.responses)) {
          if (!status.startsWith('2')) {
            continue;
          }

          const responseObject = getResponseObject(response);

          const content = responseObject.content;

          if (content && content['application/json'] && content['application/json'].schema) {
            responseSchema = convertOpenApiSchemaToJsonSchema(content['application/json'].schema);
          }

          break;
        }
      }

      tools.push({
        name: operation.operationId!,
        method: method,
        path: path,
        description: operation.description!,
        inputSchema,
        queryParamsSchema,
        pathParamsSchema,
        outputSchema: responseSchema,
      });
    });
  });

  let output: string = `
  /**
   * This file is auto-generated by yarn generate:mcp-tools
   * DO NOT EDIT THIS FILE MANUALLY
   */
  
    import { z } from "zod";
    import { TaskadeMCPServer } from "./server";
    export const setupTools = (server: TaskadeMCPServer) => {
  `;

  tools.forEach((tool) => {
    if (!ENABLED_TASKADE_ACTIONS.includes(tool.name)) {
      return;
    }

    output += `
        server.tool("${tool.name}", "${tool.description}",  ${generateToolInputFromParsedTool(tool)}, async (args) => {
          const response = await server.callOperation({
            path: "${tool.path}",
            method: "${tool.method.toUpperCase()}",
            input: args,
            pathParamKeys: ${
              tool.pathParamsSchema
                ? `[${Object.keys(tool.pathParamsSchema.properties ?? {})
                    .map((r) => `"${r}"`)
                    .join(',')}]`
                : '[]'
            },
            queryParamKeys: ${
              tool.queryParamsSchema
                ? `[${Object.keys(tool.queryParamsSchema.properties ?? {})
                    .map((r) => `"${r}"`)
                    .join(',')}]`
                : '[]'
            },
          });


          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response),
              },
          ],
        }
        })
    `;
  });

  output += `
    }
  `;

  fs.writeFileSync(
    './src/tools.generated.ts',
    await prettier.format(output, { parser: 'typescript' }),
  );
} catch (error) {
  console.error(error);
}
