function findJsonBoundary(text: string, start: number): number {
    const open = text[start];
    const close = open === '{' ? '}' : open === '[' ? ']' : '';
    if (!close) {
        throw new Error(`Unsupported JSON start token at index ${start}`);
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i += 1) {
        const ch = text[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === open) {
            depth += 1;
            continue;
        }
        if (ch === close) {
            depth -= 1;
            if (depth === 0) {
                return i + 1;
            }
        }
    }

    throw new Error('JSON payload is incomplete or not closed');
}

export function extractJsonPayloadFromToolText(text: string): unknown {
    const firstObject = text.indexOf('{');
    const firstArray = text.indexOf('[');
    const candidates = [firstObject, firstArray].filter((x) => x >= 0);
    if (candidates.length === 0) {
        throw new Error('No JSON payload found in tool text');
    }
    const start = Math.min(...candidates);
    const end = findJsonBoundary(text, start);
    const jsonText = text.slice(start, end).trim();
    try {
        return JSON.parse(jsonText);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse JSON payload: ${message}`);
    }
}

export function extractJsonPayloadAfterPrefix(text: string, prefix: string): unknown {
    const i = text.indexOf(prefix);
    if (i < 0) {
        throw new Error(`Prefix not found: ${prefix}`);
    }
    const sliced = text.slice(i + prefix.length).trim();
    return extractJsonPayloadFromToolText(sliced);
}
