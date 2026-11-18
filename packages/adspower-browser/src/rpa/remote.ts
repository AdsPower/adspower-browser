import { rpaRemoteTools } from '@adspower/local-api-core';
import { formatSchemaPropertiesForHelp, type Handler } from '../cliShared';

export const RPA_REMOTE_HANDLERS: Record<string, Handler> = Object.fromEntries(
    rpaRemoteTools.map((tool) => [`rpa-${tool.name}`, {
        fn: tool.handler,
        description: tool.description,
        paramsDescription: formatSchemaPropertiesForHelp(tool.schema.toJSONSchema({ io: 'input' }).properties),
    }]),
);
