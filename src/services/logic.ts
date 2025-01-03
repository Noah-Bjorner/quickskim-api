import { Context } from "hono";
import { getCachedQuickSkim } from "./cache";
import { isTextLengthValid, getErrorMessage } from "./helper";
import { createLoggingStream } from './stream'
import { QuickSkimParams } from "./ai";

interface QuickSkimRequestParams {
    url: string;
    text: string;
    logEventName: string;
    generateFunction: (params: QuickSkimParams) => Promise<ReadableStream>;
}

export async function handleQuickSkimRequest(c: Context, params: QuickSkimRequestParams) {
    
    const { url, text, logEventName, generateFunction } = params;
  
    try {
      const cachedContent = await getCachedQuickSkim(url, c.env);
      if (cachedContent) {
        console.log({ event: logEventName, cache_status: 'HIT', url, text_length: text.length });
        return c.json(
          { content: cachedContent },
          { headers: { "X-Cache-Status": "HIT" }}
        );
      }
  
      const isValid = isTextLengthValid(text);
      if (!isValid) {
        throw new Error(`Text length is invalid: ${text.length}`);
      }
  
      const generatedStream = await generateFunction({ env: c.env, text });
      const loggingStream = await createLoggingStream(generatedStream, url, c.env);
      console.log({ event: logEventName, cache_status: 'MISS', url, text_length: text.length });

      return new Response(loggingStream, {
        headers: {
          "content-type": "text/event-stream",
          "X-Cache-Status": "MISS"
        },
      });
    } catch (error) {
      console.error({ event: `failed_to_process_${logEventName}`, error: getErrorMessage(error) });
      return c.json({ error: `Failed to process ${logEventName}` }, 500);
    }
  }
  