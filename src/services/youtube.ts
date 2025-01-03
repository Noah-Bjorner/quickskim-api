import { Env } from "../index";
import { getErrorMessage } from "./helper";

export async function getCaptions(url: string, env: Env): Promise<string> {
  try {

    const apiUrl = env.YOUTUBE_API_ENDPOINT_URL;
    const passkey = env.YOUTUBE_API_PASSKEY

    const params = new URLSearchParams({
        passkey,
        url
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
