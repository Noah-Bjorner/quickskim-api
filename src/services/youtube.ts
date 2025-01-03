import { getErrorMessage } from "./helper";


export async function getCaptions(url: string): Promise<string> {
  const apiUrl = 'https://youtube-noahbjorner-com.deno.dev/captions';
  const passkey = 'WiNteRbeAR2025'

  const params = new URLSearchParams({
    passkey,
    url
  });

  try {
    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch captions: ${response.status}`);
    }

    const data = await response.json() as { captions: string };
    return data.captions;
  } catch (error) {
    console.error('getCaptions failed:', getErrorMessage(error));
    throw error;
  }
}
