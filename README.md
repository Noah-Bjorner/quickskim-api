# QuickSkim API

A Cloudflare Worker API that provides article summarization services using AI.

## Features

- Article summarization using Cloudflare AI
- Redis caching with Upstash
- Regional rate limiting
- Geo-blocking capabilities
- Streaming responses

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Run locally: `npm run dev`
5. Deploy: `npm run deploy`

## Environment Variables

Required environment variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- Various regional rate limit Redis configurations

## API Endpoints

- `POST /article` - Submit an article for summarization
- `GET /ping` - Health check endpoint

## Development

- `npm run dev` - Run development server
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm test` - Run tests
