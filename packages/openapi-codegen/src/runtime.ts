import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

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

export type ExecuteToolCallOpenApiOperationCbPayload = ToolCallOpenApiRequestConfig & { operation: ToolCallOpenApiOperation }

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


export const prepareToolCallOperation = (operation: ToolCallOpenApiOperation): ExecuteToolCallOpenApiOperationCbPayload => {
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


export type OpenAPIToolRuntimeConfigOpts = {
    // basic configuration
    url?: string;
    fetch?: (...args: any[]) => Promise<any>;
    headers?: Record<string, string>;

    // custom implementation of the tool call
    executeToolCall?: ExecuteToolCallOpenApiOperationCb;
}

export class OpenAPIToolRuntimeConfig {
    config: OpenAPIToolRuntimeConfigOpts;

    constructor(config: OpenAPIToolRuntimeConfigOpts) {
        this.config = config;
    }

    private async defaultExecuteToolCall(payload: ExecuteToolCallOpenApiOperationCbPayload) {
        const response = await this.fetch(`${this.baseUrl}${payload.url}`, {
            method: payload.method,
            body: payload.body,
            headers: {
                ...payload.headers,
                ...this.config.headers
            }
        });

        return await response.json();
    }

    async executeToolCall(operation: ToolCallOpenApiOperation): Promise<CallToolResult> {
        const payload = prepareToolCallOperation(operation);

        try {
            const response = await this.config.executeToolCall?.(payload) ?? this.defaultExecuteToolCall(payload);
            return this.normaliseResponse(response);
        } catch (error) {
            console.error('OPENAPI_TOOL_CALL_ERROR', error);
            throw error;
        }
    }

    private normaliseResponse(response: any): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response),
                },
            ],
        };
    }

    get baseUrl() {
        if (this.config.url) {
            return this.config.url;
        }

        throw new Error('"url" is not defined');
    }

    get fetch() {
        const fetch = this.config.fetch ?? window['fetch'];

        if (!fetch) {
            throw new Error('fetch is not defined');
        }

        return fetch;
    }
}