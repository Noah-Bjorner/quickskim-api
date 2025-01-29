import { PromptMessage } from "../prompts";
import { StreamTransformer, NormalizedToken } from "../stream";

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
  transformChunk: (text: string): NormalizedToken | null => {
    try {
      const jsonData = JSON.parse(text);
      const response = jsonData.response;
      if (response) {
        return {
          text: response,
          metadata: {
            model: 'workersAI',
            originalChunk: jsonData
          }
        };
      }
    } catch (e) {}
    return null;
  }
};