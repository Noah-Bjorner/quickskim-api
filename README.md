# QuickSkim API

QuickSkim simplifies online reading by delivering instant summaries and clear breakdowns of any article and video with a single click.

📌 **Use For Free:** [Chrome Web Store](https://xxx)

![API Status](https://img.shields.io/badge/API-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-FF7300?logo=cloudflare&logoColor=white)

![QuickSkim Simulator in action](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExenJ1NjdqbzVzM25oczM2OW11enVpNHRndjZrbnFraTNtbWd3cDFzeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cOILlKqLpYFZ8LP6hy/giphy.gif)

✅ Instant Insight: Skim any article or video in seconds.<br>
✅ Completely Free: No fees, no accounts—just install and go.

### Technical Overview
* Backend API built with Hono.js and TypeScript, deployed on Cloudflare Workers
* Multi-region rate limiting using Upstash Redis for optimal global performance
* Supports multiple LLM providers (OpenRouter, DeepInfra, Workers AI) for reliability
* Implements caching strategy for frequently accessed content
* Handles both article text and YouTube video transcripts

### Author

Created and maintained by Noah Bjorner
- 📧 Email: bjornernoah@gmail.com
- 🛠 GitHub: @Noah-Bjorner

### License

This project is licensed under the MIT License - see the LICENSE file for details.