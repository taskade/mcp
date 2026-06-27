import type { JSONSchema7 as IJsonSchema } from 'json-schema';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

import {
  convertOpenApiSchemaToJsonSchema,
  getResponseObject,
  isOperation,
  isParameterObject,
  isRequestBodyObject,
  normalizeAllOf,
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

/**
 * Derive a stable camelCase tool name from an operation's path when the spec omits
 * `operationId` — e.g. Taskade API v2's flat RPC routes (`POST /promptAgent`). Path
 * params (`{id}`) are dropped and remaining segments are camelCased
 * (`/media/{mediaId}/content` → `mediaContent`). Falls back to the HTTP method for a
 * root path. Specs that DO provide `operationId` (e.g. Taskade v1) are unaffected.
 */
export const deriveToolName = (method: string, path: string): string => {
  const words = path
    .split('/')
    .filter((segment) => segment && !segment.startsWith('{'))
    .join('-')
    .split(/[-_]/)
    .filter(Boolean);

  if (words.length === 0) {
    return method.toLowerCase();
  }

  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
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

            obj.properties![param.name] = normalizeAllOf(
              convertOpenApiSchemaToJsonSchema(param.schema),
            );

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
            const bodySchema = normalizeAllOf(
              convertOpenApiSchemaToJsonSchema(
                operation.requestBody.content['application/json'].schema,
              ),
            );

            // A request body marked `nullable: true` is rewritten by
            // convertOpenApiSchemaToJsonSchema to `type: ['object', 'null']`, so a strict
            // `=== 'object'` check would skip it and emit a parameterless tool (e.g. v2's
            // promptAgent). Accept an object type whether scalar or in a nullable union.
            const isObjectBody = Array.isArray(bodySchema.type)
              ? bodySchema.type.includes('object')
              : bodySchema.type === 'object';

            if (isObjectBody && bodySchema.properties) {
              for (const [name, propSchema] of Object.entries(bodySchema.properties)) {
                inputSchema.properties![name] = propSchema;
              }

              if (Array.isArray(bodySchema.required) && bodySchema.required.length > 0) {
                const merged = new Set([...(inputSchema.required ?? []), ...bodySchema.required]);
                inputSchema.required = Array.from(merged);
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
        name: operation.operationId ?? deriveToolName(method, path),
        method: method,
        path: path,
        description: operation.description ?? operation.summary ?? '',
        inputSchema,
        queryParamsSchema,
        pathParamsSchema,
        outputSchema: responseSchema,
      });
    });
  });

  return tools;
};
