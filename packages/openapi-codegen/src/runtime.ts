export type ToolCallOpenApiOperation = {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    input: Record<string, any>;
    pathParamKeys?: Array<string>;
    queryParamKeys?: Array<string>;
};

export type ToolCallOpenApiRequestConfig = {
    url: string;
    headers: Record<string, string>;
    body?: string | null | undefined;
    method: ToolCallOpenApiOperation['method'];
}

export type ExecuteToolCallOpenApiOperationCbPayload = ToolCallOpenApiRequestConfig & { operation: ToolCallOpenApiOperation  }

export type ExecuteToolCallOpenApiOperationCb = (payload: ExecuteToolCallOpenApiOperationCbPayload) => Promise<any>;

function toQueryParams(obj: Record<string, any>): string {
    const params = new URLSearchParams();

    for (const key in obj) {
        const value = obj[key];

        if (value == null) {
            continue;
        }

        if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
        } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
        } else {
            params.append(key, String(value));
        }
    }

    const str = params.toString();

    if (str === '') {
        return '';
    }

    return `?${str}`;
}


export const prepareToolCallOperation = (operation: ToolCallOpenApiOperation): ExecuteToolCallOpenApiOperationCbPayload  => {
    const queryParamKeys = new Set(operation.queryParamKeys ?? []);
    const pathParamKeys = new Set(operation.pathParamKeys ?? []);

    const queryParams: Record<string, string> = {};
    const pathParams: Record<string, string> = {};
    const body: Record<string, any> = {};
    const headers: HeadersInit = {};

    for (const [key, value] of Object.entries(operation.input)) {
        if (queryParamKeys.has(key)) {
            queryParams[key] = value;
        } else if (pathParamKeys.has(key)) {
            pathParams[key] = value;
        } else {
            body[key] = value;
        }
    }

    let resolvedPath = operation.path;

    for (const paramKey of pathParamKeys) {
        resolvedPath = resolvedPath.replace(
            `{${paramKey}}`,
            encodeURIComponent(pathParams[paramKey] ?? ''),
        );
    }

    if (Object.keys(body).length > 0) {
        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';
    }

    const url = `{resolvedPath}${toQueryParams(queryParams)}`;

    return {
        url,
        headers,
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
        method: operation.method,
        operation,
    }
}