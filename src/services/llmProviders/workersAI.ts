import { PromptMessage } from "../prompts";
import { StreamTransformer } from "../stream";

export async function generateLLamaStreamingResponse(
    env: Env,
    messages: PromptMessage[],
    max_tokens: number,
    temperature: number = 0.2
) 
    : Promise<ReadableStream<any>>
{
    const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    return await env.AI.run(model, {
        messages,
        stream: true,
        max_tokens,
        temperature,
    });
}



export const workersAITransformer: StreamTransformer = {
  transformChunk: (rawResponse: string): string | null => {
    try {
      const jsonData = JSON.parse(rawResponse);
      const response = jsonData.response;
      return response || null;
    } catch (e) {}
    return null;
  }
};