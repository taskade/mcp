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

/**
 * Walks the schema and flattens `allOf` so it can be expressed as plain Zod.
 *
 * Why: Zod represents `allOf` as `z.intersection(...)`. When an `allOf` member
 * contains an `anyOf`/`oneOf` whose branches use `additionalProperties: false`
 * (i.e. `.strict()`), the intersection becomes unsatisfiable — sibling properties
 * coming from the other `allOf` member are rejected as unknown by the strict
 * branch, but are simultaneously required. We resolve this by distributing the
 * other members into each branch so each branch knows about every sibling key.
 */
export const normalizeAllOf = (schema: IJsonSchema): IJsonSchema => {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const next: IJsonSchema = { ...schema };

  if (next.properties) {
    const props: Record<string, IJsonSchema> = {};
    for (const [k, v] of Object.entries(next.properties)) {
      props[k] = normalizeAllOf(v as IJsonSchema);
    }
    next.properties = props;
  }
  if (next.items) {
    next.items = Array.isArray(next.items)
      ? next.items.map((i) => normalizeAllOf(i as IJsonSchema))
      : normalizeAllOf(next.items as IJsonSchema);
  }
  if (Array.isArray(next.anyOf)) {
    next.anyOf = next.anyOf.map((s) => normalizeAllOf(s as IJsonSchema));
  }
  if (Array.isArray(next.oneOf)) {
    next.oneOf = next.oneOf.map((s) => normalizeAllOf(s as IJsonSchema));
  }
  if (Array.isArray(next.allOf)) {
    next.allOf = next.allOf.map((s) => normalizeAllOf(s as IJsonSchema));
  }

  if (!Array.isArray(next.allOf) || next.allOf.length === 0) {
    return next;
  }

  const members = next.allOf as IJsonSchema[];

  // If any member has anyOf/oneOf, distribute the other members across each branch.
  const branchIdx = members.findIndex((m) => Array.isArray(m.anyOf) || Array.isArray(m.oneOf));

  if (branchIdx >= 0) {
    const branchMember = members[branchIdx];
    const branchKey: 'anyOf' | 'oneOf' = Array.isArray(branchMember.anyOf) ? 'anyOf' : 'oneOf';
    const branches = branchMember[branchKey] as IJsonSchema[];

    const others = members.filter((_, i) => i !== branchIdx);
    const branchSiblings: IJsonSchema = { ...branchMember };
    delete (branchSiblings as any)[branchKey];

    const distributed = branches.map((b) =>
      normalizeAllOf({ allOf: [...others, branchSiblings, b] }),
    );

    const result: IJsonSchema = { ...next };
    delete result.allOf;
    (result as any)[branchKey] = distributed;
    return result;
  }

  // All members are plain — merge them into one object schema.
  const merged = mergeObjectSchemas(members);
  const result: IJsonSchema = { ...next, ...merged };
  delete result.allOf;
  return result;
};

const mergeObjectSchemas = (schemas: IJsonSchema[]): IJsonSchema => {
  const properties: Record<string, IJsonSchema> = {};
  const required = new Set<string>();
  let additionalProperties: IJsonSchema['additionalProperties'] | undefined;
  let type: IJsonSchema['type'] = 'object';

  for (const s of schemas) {
    if (s.properties) {
      for (const [k, v] of Object.entries(s.properties)) {
        properties[k] = v as IJsonSchema;
      }
    }
    if (Array.isArray(s.required)) {
      s.required.forEach((r) => required.add(r));
    }
    if (s.additionalProperties !== undefined) {
      // false wins — if any branch is strict, the merged schema is strict.
      if (s.additionalProperties === false || additionalProperties === false) {
        additionalProperties = false;
      } else {
        additionalProperties = s.additionalProperties;
      }
    }
    if (s.type && s.type !== 'object') {
      type = s.type;
    }
  }

  const result: IJsonSchema = { type, properties };
  if (required.size > 0) {
    result.required = Array.from(required);
  }
  if (additionalProperties !== undefined) {
    result.additionalProperties = additionalProperties;
  }
  return result;
};
