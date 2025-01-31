import { cacheQuickSkim } from "./cache";
import { workersAITransformer } from "./llmProviders/workersAI";
import { deepInfraTransformer } from "./llmProviders/deepInfra";

export interface NormalizedToken {
    text: string;
    metadata?: {
      model: 'workersAI' | 'deepInfra';
      originalChunk: any;
    };
}

export interface StreamTransformer {
    transformChunk: (text: string) => NormalizedToken | null;
}

export async function createNormalizedLoggingStream(
    originalStream: ReadableStream,
    url: string,
    env: Env,
    llmProvider: 'workersAI' | 'deepInfra'
) {
    let completeResponse = '';
    let buffer = '';

    const transformStream = new TransformStream({
      transform(chunk: Uint8Array, controller) {
        const text = new TextDecoder().decode(chunk).trim();
        buffer += text;

        const lines = buffer.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          const isCompleteChunk = trimmedLine.startsWith('data: ') && trimmedLine.endsWith('}');
          if (!isCompleteChunk) continue;

          const jsonStr = trimmedLine.replace(/^data: /, '').trim();
          buffer = '';

          const invalidJsonStrings = ['[DONE]', '']
          if (!jsonStr || invalidJsonStrings.includes(jsonStr)) continue;

          const transformer = getTransformer(llmProvider);
          const normalizedToken = transformer.transformChunk(jsonStr);
          if (!normalizedToken) continue;
        
          completeResponse += normalizedToken.text;
          const textChunk = `data: ${JSON.stringify({ response: normalizedToken.text })}\n\n`
          const newChunk = new TextEncoder().encode(textChunk);
          controller.enqueue(newChunk);
        }
      },
      
      async flush() {
        await cacheQuickSkim(completeResponse, url, env);
      }
    });
  
    return originalStream.pipeThrough(transformStream);
}

function getTransformer(llmProvider: 'workersAI' | 'deepInfra'): StreamTransformer {
    switch (llmProvider) {
        case 'workersAI':
            return workersAITransformer;
        case 'deepInfra':
            return deepInfraTransformer;
        default:
            throw new Error(`Invalid LLM provider: ${llmProvider}`);
    }
}