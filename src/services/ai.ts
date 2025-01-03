import { getErrorMessage } from "./helper";
import { getArticleQuickSkimPrompt, getYouTubeQuickSkimPrompt } from "./prompts";

export interface QuickSkimParams {
    env: Env;
    text: string;
}

export async function generateArticleQuickSkim({ env, text}: QuickSkimParams) {
    try {
        const messages = getArticleQuickSkimPrompt(text);
        return await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages,
			stream: true,
			max_tokens: 2048,
			temperature: 0.2,
		});
    } catch (error) {
        throw new Error(`generateArticleQuickSkim error: ${getErrorMessage(error)}`);
    }
}



export async function generateYouTubeQuickSkim({ env, text }: QuickSkimParams) {
    try {
        const messages = getYouTubeQuickSkimPrompt(text);
        return await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages,
			stream: true,
			max_tokens: 2048,
			temperature: 0.2,
		});
    } catch (error) {
        throw new Error(`generateYouTubeQuickSkim error: ${getErrorMessage(error)}`);
    }
}