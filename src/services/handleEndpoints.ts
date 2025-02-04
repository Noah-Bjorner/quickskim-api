import { Context } from "hono";
import { getCachedQuickSkim } from "./cache";
import { isTextLengthValid, getErrorMessage } from "./helper";
import { QuickSkimParams } from "./ai";
import { GetContentParams } from "./youtube";
import { createCacheableStream } from "./stream";

interface QuickSkimRequestParams {
    url: string;
    text?: string;
    logEventName: string;
    generateFunction: (params: QuickSkimParams) => Promise<ReadableStream>;
    getContent?: (params: GetContentParams) => Promise<string>;
    llmProvider: 'workersAI' | 'deepInfra';
}

export async function handleQuickSkimRequest(c: Context, params: QuickSkimRequestParams): Promise<Response> {
    const { url, text, logEventName, generateFunction, getContent, llmProvider } = params;
  
    try {
      const cachedContent = await getCachedQuickSkim(url, c.env);
      if (cachedContent) {
        console.log({ event: logEventName, cache_status: 'HIT', url, text_length: cachedContent.length});
        return c.json(
          { content: cachedContent },
          { headers: { "X-Cache-Status": "HIT" }}
        );
      }
  
      const content = text || (getContent ? await getContent({env: c.env, url}) : "");

      const isValid = isTextLengthValid(content);
      if (!isValid) throw new Error(`Text length is invalid: ${content.length}`);
  
      const generatedStream = await generateFunction({ env: c.env, text: content, llmProvider });
      const cacheableStream = await createCacheableStream(generatedStream, url, c.env, llmProvider);
      console.log({ event: logEventName, cache_status: 'MISS', url, text_length: content.length });

      return new Response(cacheableStream, {
        headers: {
          "content-type": "text/event-stream",
          "X-Cache-Status": "MISS",
          "X-LLM-Provider": llmProvider
        },
      });
    } catch (error) {
      console.error({ event: `failed_to_process_${logEventName}`, error: getErrorMessage(error) });
      return c.json({ error: `Failed to process ${logEventName}` }, 500);
    }
  }
  