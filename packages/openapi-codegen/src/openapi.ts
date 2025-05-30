import type { JSONSchema7 as IJsonSchema } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';

export const isOperation = (
  method: string,
  _operation: any,
): _operation is OpenAPIV3.OperationObject => {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase());
};

export const isParameterObject = (
  param: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject,
): param is OpenAPIV3.ParameterObject => {
  return !('$ref' in param);
};

export const isRequestBodyObject = (
  body: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject,
): body is OpenAPIV3.RequestBodyObject => {
  return !('$ref' in body);
};

export const getResponseObject = (
  response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject,
): OpenAPIV3.ResponseObject => {
  if ('$ref' in response) {
    throw new Error('Reference not supported');
  }

  return response;
};

export const convertOpenApiSchemaToJsonSchema = (
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
