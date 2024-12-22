import { Context } from "hono";
import { isCountryAllowed } from "./countries";

export const allowedCountriesMiddleware = () => {
    return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
        const country = c.req.header('cf-ipcountry') || 'US';
        const isAllowed = isCountryAllowed(country);
        
        if (!isAllowed) {
            console.error({ event: 'country_access_denied', country: country });
            return c.json(
                { 
                    error: 'Service not available in your region',
                    country: country
                },
                {
                    status: 451,
                    headers: {
                        'X-Country': country
                    }
                }
            );
        }

        await next();
    };
};