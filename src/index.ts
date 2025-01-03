import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { generateArticleQuickSkim, generateYouTubeQuickSkim } from './services/ai'
import { rateLimitMiddleware } from './services/rateLimit'
import { allowedCountriesMiddleware } from './services/allowedCountries'
import { getCaptions } from './services/youtube'
import { handleQuickSkimRequest } from './services/logic'


export interface Env {
  AI: Ai;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_CALIFORNIA_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_CALIFORNIA_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_AUSTRALIA_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_AUSTRALIA_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_BRAZIL_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_BRAZIL_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_JAPAN_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_JAPAN_REST_TOKEN: string;
  UPSTASH_REDIS_RATE_LIMIT_GERMANY_REST_URL: string;
  UPSTASH_REDIS_RATE_LIMIT_GERMANY_REST_TOKEN: string;
  YOUTUBE_API_PASSKEY: string;
  YOUTUBE_API_ENDPOINT_URL: string;
}


const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({
  origin: ['chrome-extension://*'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: [
	'Content-Type', 
	'X-Cache-Status', 
	'X-RateLimit-Limit', 
	'X-RateLimit-Remaining', 	
	'X-RateLimit-Reset', 
	'X-RateLimit-Database',
	'Retry-After',
	'X-RateLimit-Policy',
	'X-RateLimit-Database',
	'X-Country',
	],
  credentials: true,
}))

app.use('/*', allowedCountriesMiddleware());

app.use('/*', rateLimitMiddleware({
    requests: 5,
    window: 60
}));



app.get('/health', (c) => c.text('healthy', 200))


app.post('/article', async (c) => {
	try {
		const { articleText, url } = await c.req.json();
		return handleQuickSkimRequest(c, {
			url,
			text: articleText,
			logEventName: 'article_response',
			generateFunction: generateArticleQuickSkim
		});
	} catch {
		return c.json({ error: 'article_response_unexpect_error' }, 500);
	}
});

app.post('/youtube', async (c) => {
	try {
		const { url } = await c.req.json();
		const captions = await getCaptions(url, c.env);
		return handleQuickSkimRequest(c, {
			url,
			text: captions,
			logEventName: 'youtube_response',
			generateFunction: generateYouTubeQuickSkim
		});
	} catch {
		return c.json({ error: 'youtube_response_unexpect_error' }, 500);
	}
});


export default app


