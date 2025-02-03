import { getErrorMessage } from "../helper";
import { PromptMessage } from "../prompts";
import { StreamTransformer, NormalizedToken } from "../stream";

const MODELS = {
  'phi-4': 'https://api.deepinfra.com/v1/inference/microsoft/phi-4',
  'llama-3.3': 'https://api.deepinfra.com/v1/inference/meta-llama/Llama-3.3-70B-Instruct-Turbo'
}

export async function generateDeepInfraStreamingResponse(
    env: Env,
    model: keyof typeof MODELS,
    messages: PromptMessage[],
    max_tokens: number = 2000,
    temperature: number = 0.2
): Promise<ReadableStream<any>> {
  try {
    const {prompt, stop} = modelPrompt(messages, model);

    const modelURL = MODELS[model];
    const response = await fetch(modelURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.DEEPINFRA_QUICKSKIM_API_KEY_V1}`,
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
            input: prompt,
            stop: stop,
            stream: true,
            max_tokens,
            temperature,
            timeout: 120000
        }),
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

function modelPrompt(messages: PromptMessage[], model: keyof typeof MODELS): {prompt: string, stop: string[]} {
  switch (model) {
    case 'phi-4':
      return {
        prompt: messages.map(msg => `<|im_start|>${msg.role}<|im_sep|>${msg.content}<|im_end|>`).join("") + "<|im_start|>assistant<|im_sep|>",
        stop: ["<|endoftext|>", "<|im_end|>"]
      }
    case 'llama-3.3':
      return {
        prompt: messages.map(msg => 
          `<|begin_of_text|><|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`
        ).join("") + "<|start_header_id|>assistant<|end_header_id|>\n\n",
        stop: ["<|eot_id|>", "<|end_of_text|>", "<|eom_id|>"]
      }
  }
} 





export const deepInfraTransformer: StreamTransformer = { transformChunk: (text: string): NormalizedToken | null => {
    try {
      const jsonData = JSON.parse(text);
      const textChunk = jsonData.token?.text;
      if (textChunk) {
        return {
          text: textChunk,
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