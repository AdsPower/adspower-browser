// intent metadata for MCP/CLI tool descriptions
export type ToolIntentRecord = {
    intentZh: string;
    intentEn: string;
    triggersZh: string;
    triggersEn: string;
};

export const TOOL_INTENT_BY_NAME: Record<string, ToolIntentRecord> = {
    'open-browser': {
        intentEn: 'Start an existing AdsPower browser profile (launch the profile browser).',
        intentZh: '启动已存在的 AdsPower 浏览器环境（用户常称环境、配置文件、profile）。',
        triggersEn: 'open browser, launch profile, start environment, open AdsPower, open config profile',
        triggersZh: '打开浏览器,启动环境,打开配置,打开配置文件,打开profile,拉起AdsPower,启动指纹浏览器',
    },
    'close-browser': {
        intentEn: 'Stop a running AdsPower browser profile.',
        intentZh: '关闭正在运行的浏览器环境 / profile。',
        triggersEn: 'close browser, stop profile, shutdown environment, kill browser',
        triggersZh: '关闭浏览器,停止环境,关掉profile,结束浏览器,退出指纹环境',
    },
    'create-browser': {
        intentEn: 'Create a new AdsPower browser profile (account).',
        intentZh: '新建浏览器环境 / 账号 profile。',
        triggersEn: 'create profile, new browser, add account, spin up profile',
        triggersZh: '新建环境,创建profile,添加浏览器,新开指纹,创建账号',
    },
    'update-browser': {
        intentEn: 'Update fields of an existing browser profile.',
        intentZh: '更新已有 profile 的配置（备注、代理、指纹等）。',
        triggersEn: 'edit profile, change settings, modify browser, update fingerprint',
        triggersZh: '修改配置,更新profile,改代理,改指纹,编辑环境',
    },
    'delete-browser': {
        intentEn: 'Delete one or more browser profiles permanently.',
        intentZh: '永久删除一个或多个浏览器 profile。',
        triggersEn: 'remove profile, delete account, trash browser',
        triggersZh: '删除环境,移除profile,删掉浏览器账号',
    },
    'get-browser-list': {
        intentEn: 'List or search browser profiles (pagination, filters).',
        intentZh: '分页/条件查询浏览器 profile 列表。',
        triggersEn: 'list profiles, search browsers, query accounts, show all profiles',
        triggersZh: '列表,查询环境,搜索profile,列出所有浏览器',
    },
    'get-opened-browser': {
        intentEn: 'List browser profiles currently open on this device.',
        intentZh: '查看本机当前已打开的浏览器 profile。',
        triggersEn: 'opened browsers, running profiles, active local sessions',
        triggersZh: '已打开,正在运行,当前会话,本地活跃',
    },
    'move-browser': {
        intentEn: 'Move profiles to another group (regroup).',
        intentZh: '将 profile 移动到指定分组。',
        triggersEn: 'move to group, regroup profiles, change group',
        triggersZh: '移动分组,换组,归类到组',
    },
    'get-profile-cookies': {
        intentEn: 'Read cookies for one profile.',
        intentZh: '读取单个 profile 的 Cookie。',
        triggersEn: 'get cookies, export cookies, read cookie jar',
        triggersZh: '导出Cookie,查看Cookie,读取站点Cookie',
    },
    'get-profile-ua': {
        intentEn: 'Get User-Agent strings for up to 10 profiles.',
        intentZh: '批量查询最多 10 个 profile 的 UA。',
        triggersEn: 'user agent, UA string, browser UA',
        triggersZh: 'UA,用户代理,浏览器标识',
    },
    'close-all-profiles': {
        intentEn: 'Close all opened profiles on this device.',
        intentZh: '关闭本机所有已打开的环境。',
        triggersEn: 'close everything, stop all browsers, shutdown all profiles',
        triggersZh: '全部关闭,一键关环境,关所有浏览器',
    },
    'new-fingerprint': {
        intentEn: 'Generate a new fingerprint for up to 10 profiles.',
        intentZh: '为最多 10 个 profile 重新生成指纹。',
        triggersEn: 'refresh fingerprint, regenerate fp, new device identity',
        triggersZh: '刷新指纹,重新指纹,换设备指纹',
    },
    'delete-cache-v2': {
        intentEn: 'Clear selected local cache types for profiles.',
        intentZh: '按类型清理 profile 本地缓存。',
        triggersEn: 'clear cache, wipe storage, delete history cache',
        triggersZh: '清缓存,删历史,清理本地数据',
    },
    'share-profile': {
        intentEn: 'Share profiles to another AdsPower account.',
        intentZh: '将 profile 分享给其他 AdsPower 账号。',
        triggersEn: 'share account, transfer profile, send browser to user',
        triggersZh: '分享环境,转让profile,发给同事',
    },
    'get-browser-active': {
        intentEn: 'Get active status/details for one profile.',
        intentZh: '查询单个 profile 的活跃/运行信息。',
        triggersEn: 'is profile running, active status, browser state',
        triggersZh: '是否在线,活跃状态,运行信息',
    },
    'get-cloud-active': {
        intentEn: 'Query cloud-side active status for many profile IDs.',
        intentZh: '按 user_ids 批量查询云端活跃状态。',
        triggersEn: 'cloud status, remote active, team multi device caveat',
        triggersZh: '云端状态,远程是否打开,多设备模式限制',
    },
    'create-group': {
        intentEn: 'Create a browser profile group.',
        intentZh: '新建浏览器分组。',
        triggersEn: 'new group, add folder for profiles',
        triggersZh: '新建分组,创建组,环境分组',
    },
    'update-group': {
        intentEn: 'Rename or update a group.',
        intentZh: '重命名或更新分组信息。',
        triggersEn: 'rename group, edit group',
        triggersZh: '改组名,更新分组',
    },
    'get-group-list': {
        intentEn: 'List groups with optional name search.',
        intentZh: '分页查询分组列表，可按名称搜索。',
        triggersEn: 'list groups, search group name',
        triggersZh: '分组列表,查组名',
    },
    'check-status': {
        intentEn: 'Check Local API availability on this machine.',
        intentZh: '检测本机 Local API 是否可用。',
        triggersEn: 'API health, connection status, ping AdsPower API',
        triggersZh: '接口通不通,检测API,连接状态',
    },
    'get-application-list': {
        intentEn: 'List application/extension categories with pagination.',
        intentZh: '分页获取应用/扩展分类列表。',
        triggersEn: 'categories, extension list, application catalog',
        triggersZh: '应用分类,扩展目录,类别列表',
    },
    'create-proxy': {
        intentEn: 'Create one or more proxy entries.',
        intentZh: '新建一条或多条代理配置。',
        triggersEn: 'add proxy, new proxy row',
        triggersZh: '添加代理,新建代理',
    },
    'update-proxy': {
        intentEn: 'Update an existing proxy entry.',
        intentZh: '更新已有代理项。',
        triggersEn: 'edit proxy, change proxy host',
        triggersZh: '修改代理,更新代理',
    },
    'get-proxy-list': {
        intentEn: 'List proxies with filters/pagination.',
        intentZh: '分页/条件查询代理列表。',
        triggersEn: 'list proxies, search proxy',
        triggersZh: '代理列表,查代理',
    },
    'delete-proxy': {
        intentEn: 'Delete proxies by id list.',
        intentZh: '按 ID 列表删除代理。',
        triggersEn: 'remove proxy, delete proxy entries',
        triggersZh: '删除代理,移除代理',
    },
    'get-tag-list': {
        intentEn: 'List browser tags.',
        intentZh: '查询浏览器标签列表。',
        triggersEn: 'list tags, label list',
        triggersZh: '标签列表,查看标签',
    },
    'create-tag': {
        intentEn: 'Create tags (batch).',
        intentZh: '批量创建标签。',
        triggersEn: 'new tag, add label',
        triggersZh: '新建标签,添加标签',
    },
    'update-tag': {
        intentEn: 'Update existing tags (batch).',
        intentZh: '批量更新标签。',
        triggersEn: 'rename tag, change tag color',
        triggersZh: '改标签名,改颜色',
    },
    'delete-tag': {
        intentEn: 'Delete tags by id list.',
        intentZh: '按 ID 删除标签。',
        triggersEn: 'remove tags',
        triggersZh: '删除标签',
    },
    'download-kernel': {
        intentEn: 'Download or update a browser kernel version.',
        intentZh: '下载或更新指定内核版本。',
        triggersEn: 'download chrome kernel, fetch firefox kernel',
        triggersZh: '下载内核,更新Chrome内核',
    },
    'get-kernel-list': {
        intentEn: 'List supported kernel versions (optional type filter).',
        intentZh: '查询支持的内核版本列表。',
        triggersEn: 'kernel versions, supported browsers list',
        triggersZh: '内核列表,可用版本',
    },
    'update-patch': {
        intentEn: 'Update AdsPower client patch channel.',
        intentZh: '将 AdsPower 客户端更新到补丁通道版本。',
        triggersEn: 'upgrade client, patch update, stable beta channel',
        triggersZh: '升级客户端,补丁更新,稳定版测试版',
    },
    'connect-browser-with-ws': {
        intentEn: 'Attach Playwright automation using ws from open-browser.',
        intentZh: '用 open-browser 返回的 ws 连接自动化（Playwright）。',
        triggersEn: 'connect puppeteer, attach playwright, ws automation',
        triggersZh: '连接自动化,挂上Playwright,用ws控制',
    },
    'open-new-page': {
        intentEn: 'Open a new page in the connected automation session.',
        intentZh: '在已连接会话中打开新标签页/页面。',
        triggersEn: 'new tab, new page',
        triggersZh: '新标签页,新页面',
    },
    'navigate': {
        intentEn: 'Navigate current automation page to a URL.',
        intentZh: '自动化当前页跳转到 URL。',
        triggersEn: 'goto url, open url in automation',
        triggersZh: '跳转网址,打开链接',
    },
    'screenshot': {
        intentEn: 'Capture screenshot of the automation page.',
        intentZh: '截取自动化当前页面截图。',
        triggersEn: 'screenshot, capture page image',
        triggersZh: '截图,截屏',
    },
    'get-page-visible-text': {
        intentEn: 'Read visible text of the current page.',
        intentZh: '读取当前页可见文本。',
        triggersEn: 'visible text, page text content',
        triggersZh: '可见文字,页面文本',
    },
    'get-page-html': {
        intentEn: 'Read HTML of the current page.',
        intentZh: '读取当前页 HTML。',
        triggersEn: 'page source, dom html',
        triggersZh: '网页源码,HTML',
    },
    'click-element': {
        intentEn: 'Click an element by selector in automation session.',
        intentZh: '在自动化会话中按选择器点击元素。',
        triggersEn: 'click button, tap element',
        triggersZh: '点击按钮,点元素',
    },
    'fill-input': {
        intentEn: 'Fill an input field by selector.',
        intentZh: '按选择器填写输入框。',
        triggersEn: 'type text, enter value, input field',
        triggersZh: '输入文字,填表单',
    },
    'select-option': {
        intentEn: 'Select a dropdown option by selector and value.',
        intentZh: '下拉框按 selector 与 value 选择。',
        triggersEn: 'dropdown select, pick option',
        triggersZh: '下拉选择,选选项',
    },
    'hover-element': {
        intentEn: 'Hover an element by selector.',
        intentZh: '悬停到指定元素。',
        triggersEn: 'mouse over, hover menu',
        triggersZh: '鼠标悬停,划过菜单',
    },
    'scroll-element': {
        intentEn: 'Scroll an element into view or by selector.',
        intentZh: '滚动指定元素或区域。',
        triggersEn: 'scroll into view, page scroll',
        triggersZh: '滚动到可见,页面滚动',
    },
    'press-key': {
        intentEn: 'Press a keyboard key (optional focused selector).',
        intentZh: '模拟按键（可选限定在元素上）。',
        triggersEn: 'hit Enter, keyboard shortcut',
        triggersZh: '按回车,快捷键',
    },
    'evaluate-script': {
        intentEn: 'Run JavaScript in the page context.',
        intentZh: '在页面上下文执行 JS。',
        triggersEn: 'execute js, run script in page',
        triggersZh: '执行脚本,页面JS',
    },
    'drag-element': {
        intentEn: 'Drag an element to a target element.',
        intentZh: '拖拽元素到另一元素。',
        triggersEn: 'drag and drop, dnd',
        triggersZh: '拖拽,拖放',
    },
    'iframe-click-element': {
        intentEn: 'Click inside an iframe by iframe and inner selectors.',
        intentZh: '在 iframe 内点击子元素。',
        triggersEn: 'iframe click, nested frame',
        triggersZh: '框架内点击,iframe里点',
    },
};

function formatDescription(rec: ToolIntentRecord): string {
    return `${rec.intentEn} / ${rec.intentZh} | Triggers: ${rec.triggersEn}; ${rec.triggersZh}`;
}

export function buildMcpToolDescription(toolName: string, legacyFallback: string): string {
    const rec = TOOL_INTENT_BY_NAME[toolName];
    return rec ? formatDescription(rec) : legacyFallback;
}

export function buildCliCommandDescription(commandName: string, legacyFallback: string): string {
    return buildMcpToolDescription(commandName, legacyFallback);
}
