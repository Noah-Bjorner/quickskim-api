import { getErrorMessage } from "./helper";

export interface GetContentParams {
    env: Env;
    url: string;
}

export async function getCaptions({ env, url }: GetContentParams): Promise<string> {
    try {
        const apiUrl = env.YOUTUBE_API_ENDPOINT_URL;
        const passkey = env.YOUTUBE_API_PASSKEY

        const params = new URLSearchParams({
            passkey,
            url
        });

        const response = await fetch(`${apiUrl}?${params}`);
        
        if (!response.ok) throw new Error(`Failed to fetch captions -> status: ${response.status} url: ${url}`);

        const captions = await response.json()

        if (!captions) throw new Error(`status: ${response.status} url: ${url}`);

        const captionsString = formatCaptionsForLLM(JSON.stringify(captions));

        return captionsString;
    } catch (error) {
        throw new Error(`getCaptions failed: ${getErrorMessage(error)}`);
    }
}

export function cleanYoutubeUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        
        if (!videoId) {
            throw new Error('No video ID found in YouTube URL');
        }

        const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
        return cleanUrl;
    } catch (error) {
        throw new Error(`Failed to clean YouTube URL: ${getErrorMessage(error)}`);
    }
}





function formatCaptionsForLLM(captionsJSON: string): string {
    const json = JSON.parse(captionsJSON) as { captions: { start: string, text: string }[] };
    return json.captions
        .map((caption: { start: string, text: string }) => {
            // Convert seconds to HH:MM:SS format
            const hours = Math.floor(Number(caption.start) / 3600);
            const minutes = Math.floor((Number(caption.start) % 3600) / 60);
            const seconds = Math.floor(Number(caption.start) % 60);
            const timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            return `[${timestamp}] ${caption.text}`;
        })
        .join(' ');
}