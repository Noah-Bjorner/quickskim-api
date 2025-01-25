import { Context } from "hono";
import { getCachedQuickSkim } from "./cache";
import { isTextLengthValid, getErrorMessage } from "./helper";
import { createLoggingStream } from './stream'
import { QuickSkimParams } from "./ai";
import { GetContentParams } from "./youtube";




interface QuickSkimRequestParams {
    url: string;
    text?: string;
    logEventName: string;
    generateFunction: (params: QuickSkimParams) => Promise<ReadableStream>;
    getContent?: (params: GetContentParams) => Promise<string>;
}

export async function handleQuickSkimRequest(c: Context, params: QuickSkimRequestParams) {
    
    const { url, text, logEventName, generateFunction, getContent } = params;
  
    try {
      const cachedContent = await getCachedQuickSkim(url, c.env);
      if (cachedContent) {
        console.log({ event: logEventName, cache_status: 'HIT', url, text_length: text?.length || 0 });
        return c.json(
          { content: cachedContent },
          { headers: { "X-Cache-Status": "HIT" }}
        );
      }
  
      const content = text || (getContent ? await getContent({env: c.env, url}) : "");

      const isValid = isTextLengthValid(content);
      if (!isValid) {
        throw new Error(`Text length is invalid: ${content.length}`);
      }
  
      const generatedStream = await generateFunction({ env: c.env, text: content });
      const loggingStream = await createLoggingStream(generatedStream, url, c.env);
      console.log({ event: logEventName, cache_status: 'MISS', url, text_length: content.length });

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
  