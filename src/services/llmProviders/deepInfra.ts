import { getErrorMessage } from "../helper";
import { PromptMessage } from "../prompts";
import { StreamTransformer, NormalizedToken } from "../stream";

const API_KEY = 'YRREAwcGXucZCXKDr8Zim8ntJ12L63rv'; //Move to worker secrets later.

export async function generateDeepInfraStreamingResponse(
    messages: PromptMessage[],
    max_tokens: number = 2000,
    temperature: number = 0.2
): Promise<ReadableStream<any>> {
  try {
    const formattedPrompt = messages.map(msg => 
        `<|im_start|>${msg.role}<|im_sep|>${msg.content}<|im_end|>`
    ).join("") + "<|im_start|>assistant<|im_sep|>";

    console.log(`formattedPrompt: ${formattedPrompt}`);

    const response = await fetch('https://api.deepinfra.com/v1/inference/microsoft/phi-4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            input: formattedPrompt,
            stop: ["<|endoftext|>", "<|im_end|>"],
            stream: true,
            max_tokens,
            temperature
        })
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



export const deepInfraTransformer: StreamTransformer = { transformChunk: (text: string): NormalizedToken | null => {
    try {
      const jsonData = JSON.parse(text);
      if (jsonData.token?.text) {
        return {
          text: jsonData.token.text,
          metadata: {
            model: 'deepInfra',
            originalChunk: jsonData
          }
        };
      }
    } catch (e) {
      console.error(`deepInfraTransformer error: ${getErrorMessage(e)}, text: ${text}`);
    }
    return null;
  }
};