import { Redis } from "@upstash/redis/cloudflare";
import { cleanHtmlString, getErrorMessage, isValidQuickSkimResponse } from "./helper"

const redis = (env: Env) => Redis.fromEnv(env);

const storeInCache = async (key: string, value: any, env: Env, expirationSeconds: number = 3600) => {
    try {
        await redis(env).set(key, value, { ex: expirationSeconds });            
    } catch (error) {
        console.error({ event: 'failed_to_store_in_cache', error: getErrorMessage(error) });
        throw error;
    }
};

const getFromCache = async (key: string, env: Env) => {
    try {
        return await redis(env).get<string>(key);
    } catch (error) {
        console.error({ event: 'failed_to_get_from_cache', error: getErrorMessage(error) });
        return null;
    }
};




export async function cacheQuickSkim(rawResponse: string, url: string, env: Env) {
    try {
        const key = `quick-skim-${url}`
        const cleanedResponse = cleanHtmlString(rawResponse)
        const isValid = isValidQuickSkimResponse(cleanedResponse)
        if (!isValid) {
            throw new Error(`Invalid quick skim response html string: ${cleanedResponse}`)
        }
        const expirationSeconds = 1814400 //3 weeks in seconds
        await storeInCache(key, cleanedResponse, env, expirationSeconds)
    } catch (error) {
        console.error({ event: 'failed_to_cache_quick_skim', error: getErrorMessage(error) });
        throw error;
    }
}

export async function getCachedQuickSkim(url: string, env: Env) {
    try {
        const key = `quick-skim-${url}`
        const cachedContent = await getFromCache(key, env)
        
        if (!cachedContent || typeof cachedContent !== 'string') {
            return null
        }

        return cachedContent
    } catch (error) {
        console.error({ event: 'failed_to_get_cached_quick_skim', error: getErrorMessage(error) });
        return null
    }
}