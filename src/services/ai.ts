import { getErrorMessage } from "./helper";
import { getArticleQuickSkimPrompt, getYouTubeQuickSkimPrompt, PromptMessage } from "./prompts";
import { generateLLamaStreamingResponse } from "./llmProviders/workersAI";
import { generateDeepInfraStreamingResponse } from "./llmProviders/deepInfra";
import { createNormalizedLoggingStream } from "./stream";


export interface QuickSkimParams {
    env: Env;
    text: string;
    llmProvider: 'workersAI' | 'deepInfra';
}


export async function generateArticleQuickSkim({ env, text, llmProvider }: QuickSkimParams): Promise<ReadableStream<any>>  {
    try {
        const messages = getArticleQuickSkimPrompt(text);
        switch (llmProvider) {
            case 'workersAI':
                return await generateLLamaStreamingResponse(env, messages, 2048, 0.3);
            case 'deepInfra':
                const deepInfraModel = 'llama-3.3';
                return await generateDeepInfraStreamingResponse(env, deepInfraModel, messages, 2000, 0.3);
            default:
                throw new Error(`Invalid LLM provider: ${llmProvider}`);
        }
    } catch (error) {
        throw new Error(`generateArticleQuickSkim error: ${getErrorMessage(error)}`);
    }
}


export async function generateYouTubeQuickSkim({ env, text, llmProvider }: QuickSkimParams): Promise<ReadableStream<any>> {
    try {
        const messages = getYouTubeQuickSkimPrompt(text);
        switch (llmProvider) {
            case 'workersAI':
                return await generateLLamaStreamingResponse(env, messages, 2048, 0.3);
            case 'deepInfra':
                const deepInfraModel = 'llama-3.3';
                return await generateDeepInfraStreamingResponse(env, deepInfraModel, messages, 2000, 0.3);
            default:
                throw new Error(`Invalid LLM provider: ${llmProvider}`);
        }
    } catch (error) {
        throw new Error(`generateYouTubeQuickSkim error: ${getErrorMessage(error)}`);
    }
}










// Testing


export async function testAISummarize(env: Env, llmProvider: 'workersAI' | 'deepInfra'): Promise<Response> {
    try {
        const articleText = "The term “PSYOP” is over-used. People acting in coordination with others because they share the same ideology is not a psychological operation. That term needs to be reserved for formal, targeted propaganda operations like Operation Mockingbird.However, there is some strange shit going on.I spent most of the last two weeks smoking weed and watching movies that made me question my sanity (Interstellar and Shutter Island), so I’m not particularly excited about directing mental energy towards things like this.As famed ANTI-conspiracist Michael Shermer points out, the Tesla Bomber, the New Orleans Terrorist, and Ryan Routh (the guy who tried to shoot Trump on his golf course) all had ties to Ft. Bragg, as well as a number of other strange connections.Than you have this very odd situation where the Tesla Bomber’s body was burned beyond recognition yet his ID is found in near perfect condition. And the situation surrounding his manifesto is strange and weird and involves him blowing the whistle on GRAVITY PROPULSION UFOS FROM CHINA. So I don’t know what to think to be honest.It’s seems perfectly plausible that a small group of individuals within the intelligence agencies and military industrial complex are involved in these events in order to provide a pretense for a long-anticipated war with Russia, China, and/or Iran.If that sounds absurd to you, I don’t blame you. For what it’s worth, I plan on doing an extended explanation and steelman of the populist & anti-establishment perspective than I tend to sympathize with. It will start by asking the viewer/reader if they’ve ever seen the letter the FBI wrote to MLK Jr. telling him to kill himself.The political Right is continuing to fracture in interesting ways. I think Sam Hyde’s video address to Elon Musk has set a solid memetic foundation for the Dissident Right to gain ground within the political Right. If you are not familiar with Sam Hyde, he is someone who has a far stronger mastery of the vibes than even I do, and he makes a lot of very cogent and precise points about immigration, capitalism, and the complexity of American identity.Then there is the whole issue of the Woke Right. The “Woke Right” is a silly label used by mildly incompetent atheist liberals like Konstantin Kisin or James Lindsay against a wide variety of people, some of whom are genuinely incompetent freaks. But increasingly, the label just seems to be thrown at people too critical of the current Israeli government.I’ll have more on all these topics to come. Also, look out for a second Substack post coming soon where I ask you to submit your memes for me to test out my Archetypal Memetics Framework out.Until then, good luck and Godspeed.";
        const url = 'test';
        const messages = getArticleQuickSkimPrompt(articleText);

        switch (llmProvider) {
            case 'workersAI':
                const workersAIStream = await generateLLamaStreamingResponse(env, messages, 2000, 0.25);
                const workersAINormalizedStream = await createNormalizedLoggingStream(workersAIStream, url, env, llmProvider);
                return new Response(workersAINormalizedStream, {
                    headers: {
                        "content-type": "text/event-stream",
                        "X-LLM-Provider": llmProvider
                    },
                });
            case 'deepInfra':
                const model = 'llama-3.3';
                const deepInfraStream = await generateDeepInfraStreamingResponse(env, model, messages, 2000, 0.25);
                const deepInfraNormalizedStream = await createNormalizedLoggingStream(deepInfraStream, url, env, llmProvider);
                return new Response(deepInfraNormalizedStream, {
                    headers: {
                        "content-type": "text/event-stream",
                        "X-LLM-Provider": `${llmProvider}/${model}`
                    },
                });
            default:
                throw new Error(`Invalid LLM provider: ${llmProvider}`);
        }
    } catch (error) {
        throw new Error(`generateArticleQuickSkim error: ${getErrorMessage(error)}`);
    }
}