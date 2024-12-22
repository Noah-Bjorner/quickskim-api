import { getErrorMessage } from "./helper";
import { getArticleQuickSkimPrompt } from "./prompts";

interface QuickSkimParams {
    env: Env;
    articleText: string;
}

export async function generateQuickSkim({ env, articleText }: QuickSkimParams) {
    try {
        const messages = getArticleQuickSkimPrompt(articleText);
        return await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages,
			stream: true,
			max_tokens: 2048,
			temperature: 0.2,
		});
    } catch (error) {
        throw new Error(`generateQuickSkim error: ${getErrorMessage(error)}`);
    }
}