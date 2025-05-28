import { randomUUID } from 'node:crypto';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  EventStore,
  StreamableHTTPServerTransport,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import http from 'http';

import { InMemoryEventStore } from './in-memory-event-store';

export type SSEServer = {
  close: () => Promise<void>;
};

type ServerLike = {
  close: Server['close'];
  connect: Server['connect'];
};

const getBody = (request: http.IncomingMessage) => {
  return new Promise((resolve) => {
    const bodyParts: Buffer[] = [];
    let body: string;
    request
      .on('data', (chunk) => {
        bodyParts.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(bodyParts).toString();
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          console.error('Error parsing body:', error);
          resolve(null);
        }
      });
  });
};

const handleStreamRequest = async <T extends ServerLike>({
  activeTransports,
  createServer,
  endpoint,
  eventStore,
  onClose,
  onConnect,
  req,
  res,
}: {
  activeTransports: Record<string, { server: T; transport: StreamableHTTPServerTransport }>;
  createServer: (request: http.IncomingMessage) => Promise<T>;
  endpoint: string;
  eventStore?: EventStore;
  onClose?: (server: T) => void;
  onConnect?: (server: T) => void;
  req: http.IncomingMessage;
  res: http.ServerResponse;
}) => {
  if (req.method === 'POST' && new URL(req.url!, 'http://localhost').pathname === endpoint) {
    try {
      const sessionId = Array.isArray(req.headers['mcp-session-id'])
        ? req.headers['mcp-session-id'][0]
        : req.headers['mcp-session-id'];

      let transport: StreamableHTTPServerTransport;

      let server: T;

      const body = await getBody(req);

      if (sessionId && activeTransports[sessionId]) {
        transport = activeTransports[sessionId].transport;
        server = activeTransports[sessionId].server;
      } else if (!sessionId && isInitializeRequest(body)) {
        // Create a new transport for the session
        transport = new StreamableHTTPServerTransport({
          eventStore: eventStore || new InMemoryEventStore(),
          onsessioninitialized: (_sessionId) => {
            // add only when the id Sesison id is generated
            activeTransports[_sessionId] = {
              server,
              transport,
            };
          },
          sessionIdGenerator: randomUUID,
        });

        // Handle the server close event
        transport.onclose = async () => {
          const sid = transport.sessionId;
          if (sid && activeTransports[sid]) {
            onClose?.(server);

            try {
              await server.close();
            } catch (error) {
              console.error('Error closing server:', error);
            }

            delete activeTransports[sid];
          }
        };

        try {
          server = await createServer(req);
        } catch (error) {
          if (error instanceof Response) {
            res.writeHead(error.status).end(error.statusText);

            return true;
          }

          res.writeHead(500).end('Error creating server');

          return true;
        }

        server.connect(transport);

        onConnect?.(server);

        await transport.handleRequest(req, res, body);

        return true;
      } else {
        // Error if the server is not created but the request is not an initialize request
        res.setHeader('Content-Type', 'application/json');

        res.writeHead(400).end(
          JSON.stringify({
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
            jsonrpc: '2.0',
          }),
        );

        return true;
      }

      // Handle the request if the server is already created
      await transport.handleRequest(req, res, body);

      return true;
    } catch (error) {
      console.error('Error handling request:', error);

      res.setHeader('Content-Type', 'application/json');

      res.writeHead(500).end(
        JSON.stringify({
          error: { code: -32603, message: 'Internal Server Error' },
          id: null,
          jsonrpc: '2.0',
        }),
      );
    }
    return true;
  }

  if (req.method === 'GET' && new URL(req.url!, 'http://localhost').pathname === endpoint) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    const activeTransport:
      | {
          server: T;
          transport: StreamableHTTPServerTransport;
        }
      | undefined = sessionId ? activeTransports[sessionId] : undefined;

    if (!sessionId) {
      res.writeHead(400).end('No sessionId');

      return true;
    }

    if (!activeTransport) {
      res.writeHead(400).end('No active transport');

      return true;
    }

    const lastEventId = req.headers['last-event-id'] as string | undefined;

    if (lastEventId) {
      console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else {
      console.log(`Establishing new SSE stream for session ${sessionId}`);
    }

    await activeTransport.transport.handleRequest(req, res);

    return true;
  }

  if (req.method === 'DELETE' && new URL(req.url!, 'http://localhost').pathname === endpoint) {
    console.log('received delete request');

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId) {
      res.writeHead(400).end('Invalid or missing sessionId');

      return true;
    }

    console.log('received delete request for session', sessionId);

    const activeTransport = activeTransports[sessionId];

    if (!activeTransport) {
      res.writeHead(400).end('No active transport');
      return true;
    }

    try {
      await activeTransport.transport.handleRequest(req, res);

      onClose?.(activeTransport.server);
    } catch (error) {
      console.error('Error handling delete request:', error);

      res.writeHead(500).end('Error handling delete request');
    }

    return true;
  }

  return false;
};

const handleSSERequest = async <T extends ServerLike>({
  activeTransports,
  createServer,
  endpoint,
  onClose,
  onConnect,
  req,
  res,
}: {
  activeTransports: Record<string, SSEServerTransport>;
  createServer: (request: http.IncomingMessage) => Promise<T>;
  endpoint: string;
  onClose?: (server: T) => void;
  onConnect?: (server: T) => void;
  req: http.IncomingMessage;
  res: http.ServerResponse;
}) => {
  if (req.method === 'GET' && new URL(req.url!, 'http://localhost').pathname === endpoint) {
    const transport = new SSEServerTransport('/messages', res);

    let server: T;

    try {
      server = await createServer(req);
    } catch (error) {
      if (error instanceof Response) {
        res.writeHead(error.status).end(error.statusText);

        return true;
      }

      res.writeHead(500).end('Error creating server');

      return true;
    }

    activeTransports[transport.sessionId] = transport;

    let closed = false;

    res.on('close', async () => {
      closed = true;

      try {
        await server.close();
      } catch (error) {
        console.error('Error closing server:', error);
      }

      delete activeTransports[transport.sessionId];

      onClose?.(server);
    });

    try {
      await server.connect(transport);

      await transport.send({
        jsonrpc: '2.0',
        method: 'sse/connection',
        params: { message: 'SSE Connection established' },
      });

      onConnect?.(server);
    } catch (error) {
      if (!closed) {
        console.error('Error connecting to server:', error);

        res.writeHead(500).end('Error connecting to server');
      }
    }

    return true;
  }

  if (req.method === 'POST' && req.url?.startsWith('/messages')) {
    const sessionId = new URL(req.url, 'https://example.com').searchParams.get('sessionId');

    if (!sessionId) {
      res.writeHead(400).end('No sessionId');

      return true;
    }

    const activeTransport: SSEServerTransport | undefined = activeTransports[sessionId];

    if (!activeTransport) {
      res.writeHead(400).end('No active transport');

      return true;
    }

    await activeTransport.handlePostMessage(req, res);

    return true;
  }

  return false;
};

export const startHTTPServer = async <T extends ServerLike>({
  createServer,
  eventStore,
  onClose,
  onConnect,
  onUnhandledRequest,
  port,
}: {
  createServer: (request: http.IncomingMessage) => Promise<T>;
  eventStore?: EventStore;
  onClose?: (server: T) => void;
  onConnect?: (server: T) => void;
  onUnhandledRequest?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
  port: number;
}): Promise<SSEServer> => {
  const activeSSETransports: Record<string, SSEServerTransport> = {};

  const activeStreamTransports: Record<
    string,
    {
      server: T;
      transport: StreamableHTTPServerTransport;
    }
  > = {};

  // http://localhost:3000/sse/tskdp_bza2Juk9B4XpnoXE8mdbig4iZWfNci7xzm
  /**
   * @author https://dev.classmethod.jp/articles/mcp-sse/
   */
  const httpServer = http.createServer(async (req, res) => {
    req;
    if (req.headers.origin) {
      try {
        const origin = new URL(req.headers.origin);

        res.setHeader('Access-Control-Allow-Origin', origin.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
      } catch (error) {
        console.error('Error parsing origin:', error);
      }
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === `/ping`) {
      res.writeHead(200).end('pong');
      return;
    }

    if (
      await handleSSERequest({
        activeTransports: activeSSETransports,
        createServer,
        endpoint: '/sse',
        onClose,
        onConnect,
        req,
        res,
      })
    ) {
      return;
    }

    if (
      await handleStreamRequest({
        activeTransports: activeStreamTransports,
        createServer,
        endpoint: '/stream',
        eventStore,
        onClose,
        onConnect,
        req,
        res,
      })
    ) {
      return;
    }

    if (onUnhandledRequest) {
      await onUnhandledRequest(req, res);
    } else {
      res.writeHead(404).end();
    }
  });

  await new Promise((resolve) => {
    httpServer.listen(port, '::', () => {
      resolve(undefined);
    });
  });

  return {
    close: async () => {
      for (const transport of Object.values(activeSSETransports)) {
        await transport.close();
      }

      for (const transport of Object.values(activeStreamTransports)) {
        await transport.transport.close();
      }

      return new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    },
  };
};
