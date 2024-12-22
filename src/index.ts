import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { generateQuickSkim } from './services/ai'
import { createLoggingStream } from './services/stream'
import { getCachedQuickSkim } from './services/cache'
import { rateLimitMiddleware } from './services/rateLimit'
import { allowedCountriesMiddleware } from './services/allowedCountries'
import { isArticleLengthValid } from './services/helper'

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
}


const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({
  origin: ['chrome-extension://mhbjpenikhkdikjeeboebjoalkpkhjme'],
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





app.get('/ping', (c) => {
	return c.text('pong', 200)
})


app.post('/article', async (c) => {
	const { articleText, url } = await c.req.json()
	const LOG_EVENT_NAME = 'article_response'

	try {
		const cachedContent = await getCachedQuickSkim(url, c.env)
		if (cachedContent) {
			console.log({ event: LOG_EVENT_NAME, cache_status: 'HIT', url: url, article_length: articleText.length });
			return c.json(
				{ content: cachedContent }, 
				{ headers: { "X-Cache-Status": "HIT" }}
			)
		}

		const isValid = isArticleLengthValid(articleText)
		if (!isValid) {
			throw new Error('Article too long')
		}

		const generatedStream = await generateQuickSkim({ env: c.env, articleText })
		const loggingStream = await createLoggingStream(generatedStream, url, c.env)
		console.log({ event: LOG_EVENT_NAME, cache_status: 'MISS', url: url, article_length: articleText.length });
		return new Response(loggingStream, {
			headers: { 
				"content-type": "text/event-stream", 
				"X-Cache-Status": "MISS"
			},
		});
		
	} catch (error) {
		console.error({ event: 'failed_to_process_article', error: error });
		return c.json({ error: 'Failed to process article' }, 500);
	}
})





export default app


