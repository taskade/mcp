// Two fixes for schema shapes of the live v2 spec that the codegen reads wrong.
//
// inlineSchemaRelativeRefs: the spec writes some `$ref` values relative to their own
// schema, not to the document root: `#/properties/tasks/items/anyOf/0/properties/contentType`
// inside the `createTask` body, and `#/properties/data/...` inside
// `components.schemas.Field`. An OpenAPI parser reads every `#/` pointer from the
// document root, so the dereference throws "Missing $ref pointer". The fix replaces
// each such ref with a copy of the schema that it points to inside the same schema. It
// does not change a `#/components/` or `#/paths/` ref. It keeps a ref that it cannot
// resolve, so the parser still fails loudly on it.
//
// nullEnumToNull: the spec writes a JSON `null` (zod `z.null()`) as
// `{ enum: ['null'], nullable: true }`, for example `taskId` in the first `createTask`
// item. The codegen reads that as the string "null". The fix writes `{ nullable: true }`,
// which the codegen reads as JSON `null`.

const isSchemaRelativeRef = (ref: unknown): ref is string =>
  typeof ref === 'string' &&
  ref.startsWith('#/') &&
  !ref.startsWith('#/components/') &&
  !ref.startsWith('#/paths/');

const readPointer = (root: unknown, ref: string): unknown =>
  ref
    .slice(2)
    .split('/')
    .map((key) => key.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<any>(
      (node, key) => (node != null && typeof node === 'object' ? node[key] : undefined),
      root,
    );

const inlineInSchema = (root: unknown): unknown => {
  // The refs that the walk expands now. A ref that points to its own ancestor meets
  // itself inside its copy. The walk then writes an open schema (`{}`) there, so the
  // copy goes one level deep and the cycle stops.
  const expanding = new Set<string>();

  const visit = (node: unknown): unknown => {
    if (node == null || typeof node !== 'object') {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(visit);
    }
    const { $ref, ...rest } = node as Record<string, unknown>;
    if (isSchemaRelativeRef($ref)) {
      const target = readPointer(root, $ref);
      if (target === undefined) {
        return node;
      }
      if (expanding.has($ref)) {
        return {};
      }
      expanding.add($ref);
      const inlined = visit({ ...(target as object), ...rest });
      expanding.delete($ref);
      return inlined;
    }
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, visit(value)]));
  };

  return visit(root);
};

// Applies the fix to each schema root of the document: every entry of
// `components.schemas`, and every `schema` object of a parameter, a request body or a
// response.
export const inlineSchemaRelativeRefs = (doc: any) => {
  const walk = (node: unknown): unknown => {
    if (node == null || typeof node !== 'object') {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(walk);
    }
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        key === 'schema' && value != null && typeof value === 'object'
          ? inlineInSchema(value)
          : walk(value),
      ]),
    );
  };

  const schemas: Record<string, unknown> = doc.components?.schemas ?? {};
  return {
    ...doc,
    paths: walk(doc.paths ?? {}),
    components: {
      ...doc.components,
      schemas: Object.fromEntries(
        Object.entries(schemas).map(([name, schema]) => [name, inlineInSchema(schema)]),
      ),
    },
  };
};

export const nullEnumToNull = (node: any): any => {
  if (node == null || typeof node !== 'object') {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(nullEnumToNull);
  }
  const { enum: values, ...rest } = node;
  if (
    node.nullable === true &&
    node.type === undefined &&
    Array.isArray(values) &&
    values.length === 1 &&
    values[0] === 'null'
  ) {
    return rest;
  }
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, nullEnumToNull(value)]),
  );
};
