import { Context } from "hono";

export const allowedAPIKeyMiddleware = () => {
    return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
        const apiKey = c.req.header('x-api-key') || 'unknown';
        const isAllowed = apiKey === c.env.PUBLIC_API_KEY_V1;
        
        if (!isAllowed) {
            console.error({ event: 'api_key_denied', apiKey: apiKey });
            return c.json(
                { 
                    error: 'Invalid API key',
                    apiKey: apiKey
                },
                {
                    status: 401,
                    headers: {
                        'X-API-Key': apiKey
                    }
                }
            );
        }

        await next();
    };
};