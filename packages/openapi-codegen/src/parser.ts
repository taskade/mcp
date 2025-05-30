import type { JSONSchema7 as IJsonSchema } from 'json-schema';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

import {
  convertOpenApiSchemaToJsonSchema,
  getResponseObject,
  isOperation,
  isParameterObject,
  isRequestBodyObject,
} from './openapi';

export type ParsedTool = {
  name: string;
  description: string;
  method: string;
  path: string;
  pathParamsSchema: IJsonSchema | null;
  queryParamsSchema: IJsonSchema | null;
  inputSchema: IJsonSchema;
  outputSchema: IJsonSchema;
};

export const parseOpenApi = (
  paths: OpenAPIV3_1.PathsObject | OpenAPIV3.PathsObject | OpenAPIV2.PathsObject,
): ParsedTool[] => {
  const tools: ParsedTool[] = [];

  Object.entries(paths).forEach(([path, value]) => {
    if (!value) {
      return;
    }

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

  return tools;
};
