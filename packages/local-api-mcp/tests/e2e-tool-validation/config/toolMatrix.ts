import type { ToolMatrixEntry } from '../types.js';
import { getOptionalFieldsFromSchema } from './schemaIntrospector.js';

function build(tool: string, requiredMin: string[]): ToolMatrixEntry {
    return {
        requiredMin,
        optionalAll: getOptionalFieldsFromSchema(tool),
    };
}

/**
 * `requiredMin`: smallest field set used for planned positive E2E cases (may omit keys
 * that are conditionally required via `.refine()`, e.g. profile_id OR profile_no).
 * `optionalAll`: always derived from Zod object shapes (see `getOptionalFieldsFromSchema`).
 */
export const toolMatrix: Record<string, ToolMatrixEntry> = {
    'open-browser': build('open-browser', ['profile_id']),
    'close-browser': build('close-browser', ['profile_id']),
    'create-browser': build('create-browser', ['group_id']),
    'update-browser': build('update-browser', ['profile_id']),
    'delete-browser': build('delete-browser', ['profile_id']),
    'get-browser-list': build('get-browser-list', []),
    'get-opened-browser': build('get-opened-browser', []),
    'move-browser': build('move-browser', ['user_ids', 'group_id']),
    'get-profile-cookies': build('get-profile-cookies', ['profile_id']),
    'get-profile-ua': build('get-profile-ua', ['profile_id']),
    'close-all-profiles': build('close-all-profiles', []),
    'new-fingerprint': build('new-fingerprint', ['profile_id']),
    'delete-cache-v2': build('delete-cache-v2', ['profile_id', 'type']),
    'share-profile': build('share-profile', ['profile_id', 'receiver']),
    'get-browser-active': build('get-browser-active', ['profile_id']),
    'get-cloud-active': build('get-cloud-active', ['user_ids']),
    'create-group': build('create-group', ['group_name']),
    'update-group': build('update-group', ['group_id', 'group_name']),
    'get-group-list': build('get-group-list', []),
    'check-status': build('check-status', []),
    'get-application-list': build('get-application-list', []),
    'create-proxy': build('create-proxy', ['proxies']),
    'update-proxy': build('update-proxy', ['proxy_id']),
    'get-proxy-list': build('get-proxy-list', []),
    'delete-proxy': build('delete-proxy', ['proxy_id']),
    'get-tag-list': build('get-tag-list', []),
    'create-tag': build('create-tag', ['tags']),
    'update-tag': build('update-tag', ['tags']),
    'delete-tag': build('delete-tag', ['ids']),
    'download-kernel': build('download-kernel', ['kernel_type', 'kernel_version']),
    'get-kernel-list': build('get-kernel-list', []),
    'update-patch': build('update-patch', []),
    'connect-browser-with-ws': build('connect-browser-with-ws', ['wsUrl']),
    'open-new-page': build('open-new-page', []),
    'navigate': build('navigate', ['url']),
    'screenshot': build('screenshot', []),
    'get-page-visible-text': build('get-page-visible-text', []),
    'get-page-html': build('get-page-html', []),
    'click-element': build('click-element', ['selector']),
    'fill-input': build('fill-input', ['selector', 'text']),
    'select-option': build('select-option', ['selector', 'value']),
    'hover-element': build('hover-element', ['selector']),
    'scroll-element': build('scroll-element', ['selector']),
    'press-key': build('press-key', ['key']),
    'evaluate-script': build('evaluate-script', ['script']),
    'drag-element': build('drag-element', ['selector', 'targetSelector']),
    'iframe-click-element': build('iframe-click-element', ['selector', 'iframeSelector']),
};
