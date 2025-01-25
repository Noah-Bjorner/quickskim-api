import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { generateArticleQuickSkim, generateYouTubeQuickSkim } from './services/ai'
import { rateLimitMiddleware } from './services/rateLimit'
import { allowedCountriesMiddleware } from './services/allowedCountries'
import { allowedAPIKeyMiddleware } from './services/apiKey'
import { cleanYoutubeUrl, getCaptions } from './services/youtube'
import { handleQuickSkimRequest } from './services/logic'

const app = new Hono<{ Bindings: Env }>()

// prod test it so all works well...

app.use('/*', cors({
  origin: '*',
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
	'X-API-Key',
	],
  credentials: true,
}))

app.use('/*', allowedCountriesMiddleware());

app.use('/*', allowedAPIKeyMiddleware());

app.use('/*', rateLimitMiddleware({
    requests: 50, // set 6 requests per minute later
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
			generateFunction: generateArticleQuickSkim,
			getContent: undefined
		});
	} catch {
		return c.json({ error: 'article_response_unexpect_error' }, 500);
	}
});


app.post('/youtube', async (c) => {
	try {
		const { url } = await c.req.json();
		const cleanUrl = cleanYoutubeUrl(url)
		return handleQuickSkimRequest(c, {
			url: cleanUrl,
			text: undefined,
			logEventName: 'youtube_response',
			generateFunction: generateYouTubeQuickSkim,
			getContent: getCaptions
		});
	} catch {
		return c.json({ error: 'youtube_response_unexpect_error' }, 500);
	}
});


export default app


