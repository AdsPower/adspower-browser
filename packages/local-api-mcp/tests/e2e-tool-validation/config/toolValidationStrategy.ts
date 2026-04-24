export type ToolValidationStrategy =
    | 'R' // Roundtrip write/readback
    | 'D' // Delete visibility/state check
    | 'Q' // Query/read-only semantics
    | 'L' // Lifecycle/state transition
    | 'E' // High-impact side-effect
    | 'K' // Kernel operations
    | 'P' // Patch/update operations
    | 'A' // Browser automation chain
    | 'S'; // Special strategy bucket (reserved)

export const toolValidationStrategy: Record<string, ToolValidationStrategy> = {
    'open-browser': 'L',
    'close-browser': 'L',
    'create-browser': 'R',
    'update-browser': 'R',
    'delete-browser': 'D',
    'get-browser-list': 'Q',
    'get-opened-browser': 'Q',
    'move-browser': 'R',
    'get-profile-cookies': 'Q',
    'get-profile-ua': 'Q',
    'close-all-profiles': 'L',
    'new-fingerprint': 'E',
    'delete-cache-v2': 'E',
    'share-profile': 'E',
    'get-browser-active': 'Q',
    'get-cloud-active': 'Q',
    'create-group': 'R',
    'update-group': 'R',
    'get-group-list': 'Q',
    'check-status': 'Q',
    'get-application-list': 'Q',
    'create-proxy': 'R',
    'update-proxy': 'R',
    'get-proxy-list': 'Q',
    'delete-proxy': 'D',
    'get-tag-list': 'Q',
    'create-tag': 'R',
    'update-tag': 'R',
    'delete-tag': 'D',
    'download-kernel': 'K',
    'get-kernel-list': 'Q',
    'update-patch': 'P',
    'connect-browser-with-ws': 'A',
    'open-new-page': 'A',
    navigate: 'A',
    screenshot: 'A',
    'get-page-visible-text': 'A',
    'get-page-html': 'A',
    'click-element': 'A',
    'fill-input': 'A',
    'select-option': 'A',
    'hover-element': 'A',
    'scroll-element': 'A',
    'press-key': 'A',
    'evaluate-script': 'A',
    'drag-element': 'A',
    'iframe-click-element': 'A',
};
