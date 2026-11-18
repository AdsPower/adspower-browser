import { rpaLocalTools } from '@adspower/local-api-core';
import { formatSchemaPropertiesForHelp, type Handler } from '../cliShared';

export const RPA_LOCAL_HANDLERS: Record<string, Handler> = Object.fromEntries(
    rpaLocalTools.map((tool) => [`rpa-${tool.name}`, {
        fn: tool.handler,
        description: tool.description,
        paramsDescription: formatSchemaPropertiesForHelp(tool.schema.toJSONSchema({ io: 'input' }).properties),
    }]),
);
