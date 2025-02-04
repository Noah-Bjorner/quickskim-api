import { getErrorMessage } from "../helper";
import { PromptMessage } from "../prompts";
import { StreamTransformer } from "../stream";

const MODELS = {
  'phi-4': 'microsoft/phi-4',
  'llama-3.3': 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
}

export async function generateDeepInfraStreamingResponse(
    env: Env,
    model: keyof typeof MODELS,
    messages: PromptMessage[],
    max_tokens: number = 2000,
    temperature: number = 0.2
): Promise<ReadableStream<any>> {
  try {
    const body = {
      model: MODELS[model],
      stream: true,
      max_tokens,
      temperature,
      messages,
    }
    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${env.DEEPINFRA_QUICKSKIM_API_KEY_V1}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body as ReadableStream<any>;
  } catch (e) {
    console.error(`generateDeepInfraStreamingResponse error: ${getErrorMessage(e)}`);
    throw e;
  }
}


export const deepInfraTransformer: StreamTransformer = { transformChunk: (rawResponse: string): string | null => {
    try {
      const jsonData = JSON.parse(rawResponse);
      const textChunk = jsonData.choices?.[0]?.delta?.content;
      return textChunk || null;
    } catch (e) {
      console.error(`deepInfraTransformer error: ${getErrorMessage(e)}, rawResponse: ${rawResponse}`);
    }
    return null;
  }
};