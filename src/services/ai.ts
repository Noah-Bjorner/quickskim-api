import { getErrorMessage } from "./helper";
import { getArticleQuickSkimPrompt, getYouTubeQuickSkimPrompt, PromptMessage } from "./prompts";
import { generateLLamaStreamingResponse } from "./llmProviders/workersAI";
import { generateDeepInfraStreamingResponse } from "./llmProviders/deepInfra";


export interface QuickSkimParams {
    env: Env;
    text: string;
    llmProvider: 'workersAI' | 'deepInfra';
}


export async function generateArticleQuickSkim({ env, text, llmProvider }: QuickSkimParams): Promise<ReadableStream<any>>  {
    try {
        const messages = getArticleQuickSkimPrompt(text);
        switch (llmProvider) {
            case 'workersAI':
                return await generateLLamaStreamingResponse(env, messages, 2048, 0.3);
            case 'deepInfra':
                const deepInfraModel = 'llama-3.3';
                return await generateDeepInfraStreamingResponse(env, deepInfraModel, messages, 2500, 0.3);
            default:
                throw new Error(`Invalid LLM provider: ${llmProvider}`);
        }
    } catch (error) {
        throw new Error(`generateArticleQuickSkim error: ${getErrorMessage(error)}`);
    }
}


export async function generateYouTubeQuickSkim({ env, text, llmProvider }: QuickSkimParams): Promise<ReadableStream<any>> {
    try {
        const messages = getYouTubeQuickSkimPrompt(text);
        switch (llmProvider) {
            case 'workersAI':
                return await generateLLamaStreamingResponse(env, messages, 2048, 0.3);
            case 'deepInfra':
                const deepInfraModel = 'llama-3.3';
                return await generateDeepInfraStreamingResponse(env, deepInfraModel, messages, 2500, 0.3);
            default:
                throw new Error(`Invalid LLM provider: ${llmProvider}`);
        }
    } catch (error) {
        throw new Error(`generateYouTubeQuickSkim error: ${getErrorMessage(error)}`);
    }
}