import { getErrorMessage } from "../helper";
import { PromptMessage } from "../prompts";
import { StreamTransformer } from "../stream";

const MODEL = "google/gemini-2.0-flash-001"

export async function generateOpenRouterStreamingResponse(
    env: Env,
    messages: PromptMessage[],
    max_tokens: number = 3000,
    temperature: number = 0.2
): Promise<ReadableStream<any>> {
    try {
        const body = {
            model: MODEL,
            messages,
            stream: true,
            max_tokens,
            temperature,
        };
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(180000),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.body as ReadableStream<any>;
    } catch (e) {
        console.error(`generateOpenRouterStreamingResponse error: ${getErrorMessage(e)}`);
        throw e;
    }
}

export const openRouterTransformer: StreamTransformer = {
    transformChunk: (rawResponse: string): string | null => {
        try {
            const jsonData = JSON.parse(rawResponse);
            const textChunk = jsonData.choices?.[0]?.delta?.content;
            return textChunk || null;
        } catch (e) {
            console.error(`openRouterTransformer error: ${getErrorMessage(e)}, rawResponse: ${rawResponse}`);
        }
        return null;
    }
};