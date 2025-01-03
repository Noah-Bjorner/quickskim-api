import { Env } from "../index";
import { getErrorMessage } from "./helper";

// maybe get youtube video id here so I can use it in cache also?

export async function getCaptions(url: string, env: Env): Promise<string> {
  try {

    const apiUrl = env.YOUTUBE_API_ENDPOINT_URL;
    const passkey = env.YOUTUBE_API_PASSKEY
    const cleanUrl = cleanYoutubeUrl(url)

    const params = new URLSearchParams({
        passkey,
        url: cleanUrl
    });

    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch captions -> status: ${response.status} url: ${url}`);
    }

    const data = await response.json() as { captions: string };

    const captions = data.captions

    if (!captions) {
      throw new Error(`status: ${response.status} url: ${url}`);
    }

    return captions;
  } catch (error) {
    throw new Error(`getCaptions failed: ${getErrorMessage(error)}`);
  }
}



function cleanYoutubeUrl(url: string): string {
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
