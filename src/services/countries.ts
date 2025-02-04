import { REDIS_RATE_LIMIT_DATABASES } from "../middleware/rateLimit";
import { getErrorMessage } from "./helper";

const CONTINENTS = {
    EUROPE: "Europe",
    AMERICA: "America",
    ASIA: "Asia",
    PACIFIC: "Pacific",
}

const COUNTRIES = {
    UNITED_STATES: "US",
    CANADA: "CA",
    MEXICO: "MX",
    AUSTRALIA: "AU",
    NEW_ZEALAND: "NZ",
    SWEDEN: "SE",
    UNITED_KINGDOM: "GB",
    IRELAND: "IE",
    GERMANY: "DE",
    FRANCE: "FR",
    ITALY: "IT",
    SPAIN: "ES",
    PORTUGAL: "PT",
    NETHERLANDS: "NL",
    POLAND: "PL",
    DENMARK: "DK",
    FINLAND: "FI",
    NORWAY: "NO",
    ICELAND: "IS",
    GREECE: "GR",
    HUNGARY: "HU",
    CZECH_REPUBLIC: "CZ",
    SLOVAKIA: "SK",
    ROMANIA: "RO",
    BULGARIA: "BG",
    CROATIA: "HR",
    SLOVENIA: "SI",
    ESTONIA: "EE",
    LATVIA: "LV",
    LITHUANIA: "LT",
    MALTA: "MT",
    AUSTRIA: "AT",
    SWITZERLAND: "CH",
    BELGIUM: "BE",
    UKRAINE: "UA",
    BELARUS: "BY",
    SERBIA: "RS",
    ALBANIA: "AL",
    BOSNIA: "BA",
    TURKEY: "TR",
    ISRAEL: "IL",
    SAUDI_ARABIA: "SA",
    UAE: "AE",
    QATAR: "QA",
    KUWAIT: "KW",
    ARGENTINA: "AR",
    BRAZIL: "BR",
    URUGUAY: "UY",
    CHILE: "CL",
    JAPAN: "JP",
    SOUTH_KOREA: "KR"
}

const ALLOWED_COUNTRIES = new Set([
    COUNTRIES.UNITED_STATES, 
    COUNTRIES.CANADA,
    COUNTRIES.MEXICO,
    COUNTRIES.SWEDEN,
    COUNTRIES.AUSTRALIA,
    COUNTRIES.NEW_ZEALAND,
    COUNTRIES.UNITED_KINGDOM,
    COUNTRIES.IRELAND,
    COUNTRIES.GERMANY,
    COUNTRIES.FRANCE,
    COUNTRIES.ITALY,
    COUNTRIES.SPAIN,
    COUNTRIES.PORTUGAL,
    COUNTRIES.NETHERLANDS,
    COUNTRIES.POLAND,
    COUNTRIES.DENMARK,
    COUNTRIES.FINLAND,
    COUNTRIES.NORWAY,
    COUNTRIES.ICELAND,
    COUNTRIES.GREECE,
    COUNTRIES.HUNGARY,
    COUNTRIES.CZECH_REPUBLIC,
    COUNTRIES.SLOVAKIA,
    COUNTRIES.ROMANIA,
    COUNTRIES.BULGARIA,
    COUNTRIES.CROATIA,
    COUNTRIES.SLOVENIA,
    COUNTRIES.ESTONIA,
    COUNTRIES.LATVIA,
    COUNTRIES.LITHUANIA,
    COUNTRIES.MALTA,
    COUNTRIES.AUSTRIA,
    COUNTRIES.SWITZERLAND,
    COUNTRIES.BELGIUM,
    COUNTRIES.UKRAINE,
    COUNTRIES.BELARUS,
    COUNTRIES.SERBIA,
    COUNTRIES.ALBANIA,
    COUNTRIES.BOSNIA,
    COUNTRIES.TURKEY,
    COUNTRIES.ISRAEL,
    COUNTRIES.SAUDI_ARABIA,
    COUNTRIES.UAE,
    COUNTRIES.QATAR,
    COUNTRIES.KUWAIT,
    COUNTRIES.ARGENTINA,
    COUNTRIES.BRAZIL,
    COUNTRIES.URUGUAY,
    COUNTRIES.CHILE,
    COUNTRIES.JAPAN,
    COUNTRIES.SOUTH_KOREA
]);



export const getClosestRateLimitDatabase = (timeZone: string, country: string): REDIS_RATE_LIMIT_DATABASES => {
    try {
        const region = timeZone.split('/')[0] // e.g. Europe
        const location = timeZone.split('/')[1] // e.g. New_York

        // Europe
        if (region === CONTINENTS.EUROPE) {
            return REDIS_RATE_LIMIT_DATABASES.GERMANY
        }

        // USA & Canada
        if (country === COUNTRIES.UNITED_STATES || country === COUNTRIES.CANADA) {
            if (country === COUNTRIES.MEXICO ) return REDIS_RATE_LIMIT_DATABASES.CALIFORNIA
            const usWestLocations = ["Los_Angeles", "Denver", "San_Francisco", "Seattle", "Portland", "Phoenix", "Las_Vegas", "Boise"]
            const caWestLocations = ["Vancouver", "Calgary", "Edmonton", "Victoria", "Whitehorse", "Yellowknife", "Regina", "Saskatoon"]
            const westLocations = [...usWestLocations, ...caWestLocations]
            return westLocations.includes(location) ? REDIS_RATE_LIMIT_DATABASES.CALIFORNIA : REDIS_RATE_LIMIT_DATABASES.VIRGINIA
        }

        // Mexico
        if (country === COUNTRIES.MEXICO) {
            return REDIS_RATE_LIMIT_DATABASES.CALIFORNIA
        }

        // Australia & New Zealand
        if (country === COUNTRIES.AUSTRALIA || country === COUNTRIES.NEW_ZEALAND) {
            return REDIS_RATE_LIMIT_DATABASES.AUSTRALIA
        }

        // South America
        if (country === COUNTRIES.ARGENTINA || country === COUNTRIES.BRAZIL || country === COUNTRIES.CHILE || country === COUNTRIES.URUGUAY) {
            return REDIS_RATE_LIMIT_DATABASES.BRAZIL
        }

        // Asia
        if (country === COUNTRIES.JAPAN || country === COUNTRIES.SOUTH_KOREA) {
            return REDIS_RATE_LIMIT_DATABASES.JAPAN
        }

        // Rest of the world
        return REDIS_RATE_LIMIT_DATABASES.GERMANY
    } catch (error) {
        console.error({ event: 'failed_to_get_closest_rate_limit_database', error: getErrorMessage(error), country: country, timeZone: timeZone });
        return REDIS_RATE_LIMIT_DATABASES.GERMANY
    }

}

export const isCountryAllowed = (country: string): boolean => {
    return ALLOWED_COUNTRIES.has(country);
}