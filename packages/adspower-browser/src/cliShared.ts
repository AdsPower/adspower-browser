export type HandlerFn = (params: any) => Promise<string | unknown>;

export type Handler = {
    fn: HandlerFn;
    description: string;
    paramsDescription: string;
}

function formatJsonValueForHelp(value: unknown, indent: number): string {
    const pad = '  '.repeat(indent);
    const childPad = '  '.repeat(indent + 1);

    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }

        const lines = value.map((item) => `${childPad}${formatJsonValueForHelp(item, indent + 1)}`);
        return `[\n${lines.join(',\n')}\n${pad}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
        return '{}';
    }

    const lines = entries.map(([key, val]) => {
        if (['enum', 'oneOf', 'required'].includes(key) && Array.isArray(val)) {
            return `${childPad}${JSON.stringify(key)}: ${JSON.stringify(val)}`;
        }

        return `${childPad}${JSON.stringify(key)}: ${formatJsonValueForHelp(val, indent + 1)}`;
    });

    return `{\n${lines.join(',\n')}\n${pad}}`;
}

export function formatSchemaPropertiesForHelp(properties: unknown): string {
    return formatJsonValueForHelp(properties, 0);
}

