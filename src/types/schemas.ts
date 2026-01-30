import { z } from 'zod';

// Proxy Config Schema
const userProxyConfigSchema = z.object({
    proxy_soft: z.enum([
        'brightdata', 'brightauto', 'oxylabsauto', '922S5auto',
        'ipideeauto', 'ipfoxyauto', '922S5auth', 'kookauto',
        'ssh', 'other', 'no_proxy'
    ]).describe('The proxy soft of the browser'),
    proxy_type: z.enum(['http', 'https', 'socks5', 'no_proxy']).optional(),
    proxy_host: z.string().optional().describe('The proxy host of the browser, eg: 127.0.0.1'),
    proxy_port: z.string().optional().describe('The proxy port of the browser, eg: 8080'),
    proxy_user: z.string().optional().describe('The proxy user of the browser, eg: user'),
    proxy_password: z.string().optional().describe('The proxy password of the browser, eg: password'),
    proxy_url: z.string().optional().describe('The proxy url of the browser, eg: http://127.0.0.1:8080'),
    global_config: z.enum(['0', '1']).optional().describe('The global config of the browser, default is 0')
}).describe('The user proxy config of the browser');

// Browser Kernel Config Schema
const browserKernelConfigSchema = z.object({
    version: z.union([
        z.literal("92"), z.literal("99"), z.literal("102"),
        z.literal("105"), z.literal("108"), z.literal("111"),
        z.literal("114"), z.literal("115"), z.literal("116"),
        z.literal("117"), z.literal("118"), z.literal("119"),
        z.literal("120"), z.literal("121"), z.literal("122"),
        z.literal("123"), z.literal("124"), z.literal("125"),
        z.literal("126"), z.literal("127"), z.literal("128"),
        z.literal("129"), z.literal("130"), z.literal("131"),
        z.literal("132"), z.literal("133"), z.literal("134"),
        z.literal("ua_auto")
    ]).optional().describe('The version of the browser, default is ua_auto'),
    type: z.enum(['chrome', 'firefox']).optional().describe('The type of the browser, default is chrome')
}).optional().describe('The browser kernel config of the browser, default is version: ua_auto, type: chrome');

// Random UA Config Schema
const randomUaConfigSchema = z.object({
    ua_version: z.array(z.string()).optional(),
    ua_system_version: z.array(
        z.enum([
            'Android 9', 'Android 10', 'Android 11', 'Android 12', 'Android 13',
            'iOS 14', 'iOS 15',
            'Windows 7', 'Windows 8', 'Windows 10', 'Windows 11',
            'Mac OS X 10', 'Mac OS X 11', 'Mac OS X 12', 'Mac OS X 13',
            'Linux'
        ])
    ).optional().describe('The ua system version of the browser, eg: ["Android 9", "iOS 14"]')
}).optional().describe('The random ua config of the browser, default is ua_version: [], ua_system_version: []');

// Fingerprint Config Schema
const fingerprintConfigSchema = z.object({
    automatic_timezone: z.enum(['0', '1']).optional().describe('The automatic timezone of the browser, default is 0'),
    timezone: z.string().optional().describe('The timezone of the browser, eg: Asia/Shanghai'),
    language: z.array(z.string()).optional().describe('The language of the browser, eg: ["en-US", "zh-CN"]'),
    flash: z.enum(['block', 'allow']).optional().describe('The flash of the browser, default is disabled'),
    fonts: z.array(z.string()).optional().describe('The fonts of the browser, eg: ["Arial", "Times New Roman"]'),
    webrtc: z.enum(['disabled', 'forward', 'proxy', 'local']).optional().describe('The webrtc of the browser, default is disabled'),
    browser_kernel_config: browserKernelConfigSchema,
    random_ua: randomUaConfigSchema,
    tls_switch: z.enum(['0', '1']).optional().describe('The tls switch of the browser, default is 0'),
    tls: z.string().optional().describe('The tls of the browser, if tls_switch is 1, you can set the tls of the browser, eg: "0xC02C,0xC030"')
}).optional().describe('The fingerprint config of the browser, default is automatic_timezone: 0, timezone: "", language: [], flash: "", fonts: [], webrtc: disabled, browser_kernel_config: ua_auto, random_ua: ua_version: [], ua_system_version: [], tls_switch: 0, tls: ""');

export const schemas = {
    // Browser Related Schema
    createBrowserSchema: z.object({
        groupId: z.string()
            .regex(/^\d+$/, "Group ID must be a numeric string")
            .describe('The group id of the browser, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list or create a new group, use 0 for Ungrouped'),
        username: z.string().optional().describe('Platform account username'),
        password: z.string().optional().describe('Platform account password'),
        cookie: z.string().optional().describe('Cookie data in JSON or Netscape format'),
        fakey: z.string().optional().describe('2FA key for online 2FA code generators'),
        name: z.string().max(100).optional().describe('Account name, max 100 characters'),
        platform: z.string().optional().describe('Platform domain, eg: facebook.com'),
        remark: z.string().optional().describe('Remarks to describe the account. Maximum 1500 characters.'),
        userProxyConfig: userProxyConfigSchema.optional().describe('Either user_proxy_config or proxyid must be provided. Only one is required.'),
        proxyid: z.string().optional().describe('Either user_proxy_config or proxyid must be provided. Only one is required.'),
        repeatConfig: z.array(z.union([z.literal(0), z.literal(2), z.literal(3), z.literal(4)])).optional().describe('Account deduplication settings (0, 2, 3, or 4)'),
        ignoreCookieError: z.enum(['0', '1']).optional().describe('Handle cookie verification failures: 0 (default) return data as-is, 1 filter out incorrectly formatted cookies'),
        tabs: z.array(z.string()).optional().describe('URLs to open on startup, eg: ["https://www.google.com"]'),
        ip: z.string().optional().describe('IP address'),
        country: z.string().optional().describe('Country/Region, eg: "CN"'),
        region: z.string().optional().describe('Region'),
        city: z.string().optional().describe('City'),
        ipchecker: z.enum(['ip2location', 'ipapi']).optional().describe('IP query channel'),
        categoryId: z.string().optional().describe('The category id of the browser, you can use the get-application-list tool to get the application list'),
        fingerprintConfig: fingerprintConfigSchema.optional()
    }).refine(data => data.userProxyConfig || data.proxyid, {
        message: "Either userProxyConfig or proxyid must be provided"
    }).refine(data => data.username || data.password || data.cookie || data.fakey, {
        message: "At least one account information field (username, password, cookie, or fakey) must be provided"
    }),

    updateBrowserSchema: z.object({
        platform: z.string().optional().describe('The platform of the browser, eg: facebook.com'),
        tabs: z.array(z.string()).optional().describe('The tabs of the browser, eg: ["https://www.google.com"]'),
        cookie: z.string().optional().describe('The cookie of the browser, eg: "[{\"domain\":\".baidu.com\",\"expirationDate\":\"\",\"name\":\"\",\"path\":\"/\",\"sameSite\":\"unspecified\",\"secure\":true,\"value\":\"\",\"id\":1}]"'),
        username: z.string().optional().describe('The username of the browser, eg: "user"'),
        password: z.string().optional().describe('The password of the browser, eg: "password"'),
        fakey: z.string().optional().describe('Enter the 2FA-key'),
        ignoreCookieError: z.enum(['0', '1']).optional().describe('Specifies how to handle the case when cookie validation fails. 0 (default): Return data as-is even if the format is incorrect. 1: Filter out incorrectly formatted cookies and keep only valid ones. Only supports Netscape format.'),
        groupId: z.string().optional().describe('The group id of the browser, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list or create a new group'),
        name: z.string().max(100).optional().describe('The Profile name of the browser, eg: "My Browser"'),
        remark: z.string().max(1500).optional().describe('Profile remarks, maximum 1500 characters'),
        country: z.string().optional().describe('The country of the browser, eg: "CN"'),
        region: z.string().optional().describe('The region of the browser'),
        city: z.string().optional().describe('The city of the browser'),
        ip: z.string().optional().describe('The IP of the browser'),
        categoryId: z.string().optional().describe('The category id of the browser, you can use the get-application-list tool to get the application list'),
        userProxyConfig: userProxyConfigSchema.optional(),
        proxyid: z.string().optional().describe('Proxy ID'),
        fingerprintConfig: fingerprintConfigSchema.optional(),
        launchArgs: z.string().optional().describe('Browser startup parameters, refer to Chromium command-line switches for details.(https://peter.sh/experiments/chromium-command-line-switches/). Example: ["--window-position=400,0", "--blink-settings=imagesEnabled=false", "--disable-notifications"]'),
        profileId: z.string().describe('The profile id of the browser to update, it is required when you want to update the browser')
    }),

    openBrowserSchema: z.object({
        profileNo: z.string().optional().describe('Priority will be given to user id when profile_id is filled.'),
        profileId: z.string().describe('Unique profile ID, generated after creating profile. The profile id of the browser to open'),
        ipTab: z.enum(['0', '1']).optional().describe('The ip tab of the browser, 0 is not use ip tab, 1 is use ip tab, default is 0'),
        launchArgs: z.string().optional().describe(`The launch args of the browser, use chrome launch args, eg: ${JSON.stringify(["--blink-settings=imagesEnabled=false", "--disable-notifications"])}, or vista url, eg: ${JSON.stringify(["https://www.adspower.net"])}`),
        clearCacheAfterClosing: z.enum(['0', '1']).optional().describe('The clear cache after closing of the browser, 0 is not clear cache after closing, 1 is clear cache after closing, default is 0'),
        cdpMask: z.enum(['0', '1']).optional().describe('The cdp mask of the browser, 0 is not use cdp mask, 1 is use cdp mask, default is 0'),
    }).strict(),

    closeBrowserSchema: z.object({
        profileId: z.string().optional().describe('The profile id of the browser to stop, either profileId or profileNo must be provided'),
        profileNo: z.string().optional().describe('The profile number of the browser to stop, priority will be given to profileId when profileId is filled')
    }).refine(data => data.profileId || data.profileNo, {
        message: "Either profileId or profileNo must be provided"
    }),

    deleteBrowserSchema: z.object({
        profileIds: z.array(z.string()).describe('The profile ids of the browsers to delete, it is required when you want to delete the browser')
    }).strict(),

    getBrowserListSchema: z.object({
        groupId: z.string()
            .regex(/^\d+$/, "Group ID must be a numeric string")
            .optional()
            .describe('Query by group ID; searches all groups if empty'),
        limit: z.number().optional().describe('Profiles per page. Number of profiles returned per page, range 1 ~ 200, default is 50'),
        page: z.number().optional().describe('Page number for results, default is 1'),
        profileId: z.array(z.string()).optional().describe('Query by profile ID. Example: ["h1yynkm","h1yynks"]'),
        profileNo: z.array(z.string()).optional().describe('Query by profile number. Example: ["123","124"]'),
        sortType: z.enum(['profile_no', 'last_open_time', 'created_time']).optional()
            .describe('Sort results by: profile_no, last_open_time, or created_time'),
        sortOrder: z.enum(['asc', 'desc']).optional()
            .describe('Sort order: \"asc\" (ascending) or \"desc\" (descending)')
    }).strict(),

    moveBrowserSchema: z.object({
        groupId: z.string()
            .regex(/^\d+$/, "Group ID must be a numeric string")
            .describe('The target group id, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list'),
        userIds: z.array(z.string()).describe('The browser Profile ids to move')
    }).strict(),

    // New v2 endpoints schemas
    getProfileCookiesSchema: z.object({
        profileId: z.string().optional().describe('The profile id, either profileId or profileNo must be provided'),
        profileNo: z.string().optional().describe('The profile number, priority will be given to profileId when profileId is filled')
    }).refine(data => data.profileId || data.profileNo, {
        message: "Either profileId or profileNo must be provided"
    }),

    getProfileUaSchema: z.object({
        profileId: z.array(z.string()).optional().describe('The profile id array, either profileId or profileNo must be provided'),
        profileNo: z.array(z.string()).optional().describe('The profile number array, priority will be given to profileId when profileId is filled')
    }).refine(data => (data.profileId && data.profileId.length > 0) || (data.profileNo && data.profileNo.length > 0), {
        message: "Either profileId or profileNo must be provided with at least one element"
    }),

    closeAllProfilesSchema: z.object({}).strict(),

    newFingerprintSchema: z.object({
        profileId: z.array(z.string()).optional().describe('The profile id array, either profileId or profileNo must be provided'),
        profileNo: z.array(z.string()).optional().describe('The profile number array, priority will be given to profileId when profileId is filled')
    }).strict(),

    deleteCacheV2Schema: z.object({
        profileIds: z.array(z.string()).describe('The profile ids array, it is required'),
        type: z.array(z.enum(['local_storage', 'indexeddb', 'extension_cache', 'cookie', 'history', 'image_file'])).describe('Types of cache to clear, it is required')
    }).strict(),

    shareProfileSchema: z.object({
        profileIds: z.array(z.string()).describe('The profile ids array, it is required'),
        receiver: z.string().describe('Receiver\'s account email or phone number (no area code), it is required'),
        shareType: z.number(z.enum(['1', '2'])).int().optional().describe('Share type: 1 for email (default), 2 for phone number'),
        content: z.array(z.enum(['name', 'proxy', 'remark', 'tabs'])).optional().describe('Shared content, by default shares platform, account, password, 2FA key, cookies, fingerprint info, IP, etc. You can choose to share additional items')
    }).strict(),

    // Group Related Schema
    createGroupSchema: z.object({
        groupName: z.string().describe('The name of the group to create'),
        remark: z.string().optional().describe('The remark of the group')
    }).strict(),

    updateGroupSchema: z.object({
        groupId: z.string()
            .regex(/^\d+$/, "Group ID must be a numeric string")
            .describe('The id of the group to update, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list'),
        groupName: z.string().describe('The new name of the group'),
        remark: z.string().nullable().optional().describe('The new remark of the group')
    }).strict(),

    getGroupListSchema: z.object({
        groupName: z.string().optional().describe('The name of the group to search, use like to search, often used group name to find the group id, so eg: "test" will search "test" and "test1"'),
        size: z.number().optional().describe('The size of the page, max is 100, if get more than 100, you need to use the page to get the next page, default is 10'),
        page: z.number().optional().describe('The page of the group, default is 1')
    }).strict(),

    // Application Related Schema
    getApplicationListSchema: z.object({
        category_id: z.string().optional().describe('Extension category_id'),
        page: z.number().optional().describe('Page number, default 1, to view the data of which pages'),
        limit: z.number().min(1).max(100).optional().describe('Default 1, how many values are returned per page, range 1 to 100')
    }).strict(),

    // Browser Active Related Schema
    getBrowserActiveSchema: z.object({
        profileId: z.string().optional().describe('The profile id, either profileId or profileNo must be provided'),
        profileNo: z.string().optional().describe('The profile number, priority will be given to profileId when profileId is filled')
    }).refine(data => data.profileId || data.profileNo, {
        message: "Either profileId or profileNo must be provided"
    }),

    getCloudActiveSchema: z.object({
        userIds: z.string().describe('Profile IDs string to check (split by comma, max 100 per request). Unique profile ID, generated after creating the profile.')
    }).refine(data => data.userIds.split(',').length <= 100, {
        message: "The number of profile ids is too many, the maximum is 100"
    }),

    // Proxy Related Schema
    createProxySchema: z.object({
        proxies: z.array(z.object({
            type: z.enum(['http', 'https', 'ssh', 'socks5']).describe('Proxy type, support: http/https/ssh/socks5'),
            host: z.string().describe('Proxy host, support: ipV4, ipV6, eg: 192.168.0.1'),
            port: z.string().describe('Port, range: 0-65536, eg: 8000'),
            user: z.string().optional().describe('Proxy username, eg: user12345678'),
            password: z.string().optional().describe('Proxy password, eg: password'),
            proxy_url: z.string().optional().describe('URL used to refresh the proxy, eg: https://www.baidu.com/'),
            remark: z.string().optional().describe('Remark/description for the proxy'),
            ipchecker: z.enum(['ipinfo', 'ip2location', 'ipapi', 'ipfoxy', 'ipidea']).optional().describe('IP checker. If left blank, the setting in Global settings will be used. Support: ipinfo/ip2location/ipapi/ipfoxy/ipidea')
        }).strict()).describe('Array of proxy configurations to create')
    }).strict(),

    updateProxySchema: z.object({
        proxyId: z.string().describe('The unique id after the proxy is added'),
        type: z.enum(['http', 'https', 'ssh', 'socks5']).optional().describe('Proxy type, support: http/https/ssh/socks5'),
        host: z.string().optional().describe('Proxy host, support: ipV4, ipV6, eg: 192.168.0.1'),
        port: z.string().optional().describe('Port, range: 0-65536, eg: 8000'),
        user: z.string().optional().describe('Proxy username, eg: user12345678'),
        password: z.string().optional().describe('Proxy password, eg: password'),
        proxyUrl: z.string().optional().describe('URL used to refresh the proxy, eg: https://www.baidu.com/'),
        remark: z.string().optional().describe('Remark/description for the proxy'),
        ipchecker: z.enum(['ip2location', 'ipapi', 'ipfoxy', 'ipidea']).optional().describe('IP checker. If left blank, the setting in Global settings will be used. Support: ip2location/ipapi/ipfoxy/ipidea')
    }).strict(),

    getProxyListSchema: z.object({
        limit: z.number().optional().describe('Profiles per page. Number of proxies returned per page, range 1 ~ 200, default is 50'),
        page: z.number().optional().describe('Page number for results, default is 1'),
        proxyId: z.array(z.string()).optional().describe('Query by proxy ID. Example: ["proxy1","proxy2"]')
    }).strict(),

    deleteProxySchema: z.object({
        proxyIds: z.array(z.string()).describe('The proxy ids of the proxies to delete, it is required when you want to delete the proxy. The maximum is 100. ')
    }).strict(),

    // Empty Schema
    emptySchema: z.object({}).strict(),

    // Automation Related Schema
    createAutomationSchema: z.object({
        userId: z.string().optional().describe('The browser id of the browser to connect'),
        serialNumber: z.string().optional().describe('The serial number of the browser to connect'),
        wsUrl: z.string().describe('The ws url of the browser, get from the open-browser tool content `ws.puppeteer`')
    }).strict(),

    navigateSchema: z.object({
        url: z.string().describe('The url to navigate to')
    }).strict(),

    screenshotSchema: z.object({
        savePath: z.string().optional().describe('The path to save the screenshot'),
        isFullPage: z.boolean().optional().describe('The is full page of the screenshot')
    }).strict(),

    clickElementSchema: z.object({
        selector: z.string().describe('The selector of the element to click, find from the page source code')
    }).strict(),

    fillInputSchema: z.object({
        selector: z.string().describe('The selector of the input to fill, find from the page source code'),
        text: z.string().describe('The text to fill in the input')
    }).strict(),

    selectOptionSchema: z.object({
        selector: z.string().describe('The selector of the option to select, find from the page source code'),
        value: z.string().describe('The value of the option to select')
    }).strict(),

    hoverElementSchema: z.object({
        selector: z.string().describe('The selector of the element to hover, find from the page source code')
    }).strict(),

    scrollElementSchema: z.object({
        selector: z.string().describe('The selector of the element to scroll, find from the page source code, Simulates a user navigating page by scrolling, usually finding element in the bottom of the page')
    }).strict(),

    pressKeySchema: z.object({
        key: z.string().describe('The key to press, eg: "Enter"'),
        selector: z.string().optional().describe('The selector of the element to press the key, find from the page source code')
    }).strict(),

    evaluateScriptSchema: z.object({
        script: z.string().describe('The script to evaluate, eg: "document.querySelector(\'#username\').value = \'test\'"')
    }).strict(),

    dragElementSchema: z.object({
        selector: z.string().describe('The selector of the element to drag, find from the page source code'),
        targetSelector: z.string().describe('The selector of the element to drag to, find from the page source code'),
    }).strict(),

    iframeClickElementSchema: z.object({
        selector: z.string().describe('The selector of the element to click, find from the page source code'),
        iframeSelector: z.string().describe('The selector of the iframe to click, find from the page source code')
    }).strict(),
};