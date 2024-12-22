import { cacheQuickSkim } from "./cache"
import { Env } from "../index";


export async function createLoggingStream(originalStream: any, url: string, env: Env) {
  let completeResponse = '';

  const transformStream = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      const text = new TextDecoder().decode(chunk);
      
      if (text.startsWith('data: ')) {
        try {
          const jsonStr = text.replace(/^data: /, '').trim();
          const jsonData = JSON.parse(jsonStr);
          if (jsonData.response) {
            completeResponse += jsonData.response;
          }
        } catch (e) {
          console.error({ event: 'failed_to_parse_chunk', error: e });
        }
      }
      
      controller.enqueue(chunk);
    },
    
    async flush() {
      await cacheQuickSkim(completeResponse, url, env);
    }
  });

  return originalStream.pipeThrough(transformStream);
}
