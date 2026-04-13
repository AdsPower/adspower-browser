type ResolveStartApiKeyResult =
    | { ok: true; apiKey: string }
    | { ok: false; error: string };

const MISSING_API_KEY_ERROR = "error: required option '-k, --api-key <apiKey>' not specified";

export function resolveStartApiKey(
    optionApiKey?: string,
    env: NodeJS.ProcessEnv = process.env
): ResolveStartApiKeyResult {
    if (optionApiKey) {
        return {
            ok: true,
            apiKey: optionApiKey,
        };
    }

    if (env.ADS_API_KEY) {
        return {
            ok: true,
            apiKey: env.ADS_API_KEY,
        };
    }

    return {
        ok: false,
        error: MISSING_API_KEY_ERROR,
    };
}
