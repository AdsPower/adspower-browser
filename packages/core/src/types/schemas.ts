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

// Browser Kernel Config Schema — version must match type: chrome supports 92–143, ua_auto; firefox supports 100,107,114,120,123,126,129,132,135,138,141,144,ua_auto
const CHROME_VERSIONS = [
    "92", "99", "102", "105", "108", "111", "114", "115", "116", "117", "118", "119",
    "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131",
    "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "ua_auto"
] as const;
const FIREFOX_VERSIONS = ["100", "107", "114", "120", "123", "126", "129", "132", "135", "138", "141", "144", "ua_auto"] as const;
const ALL_KERNEL_VERSIONS = [...new Set([...CHROME_VERSIONS, ...FIREFOX_VERSIONS])] as const;

const browserKernelConfigSchema = z.object({
    version: z.union(
        ALL_KERNEL_VERSIONS.map((v) => z.literal(v)) as [z.ZodLiteral<(typeof ALL_KERNEL_VERSIONS)[number]>, z.ZodLiteral<(typeof ALL_KERNEL_VERSIONS)[number]>, ...z.ZodLiteral<(typeof ALL_KERNEL_VERSIONS)[number]>[]]
    ).optional().describe('The version of the browser, must match type: chrome 92–143 or ua_auto, firefox 100,107,114,120,123,126,129,132,135,138,141,144 or ua_auto; default is ua_auto'),
    type: z.enum(['chrome', 'firefox']).optional().describe('The type of the browser, default is chrome')
}).optional().superRefine((data, ctx) => {
    if (!data) return;
    const type = data.type ?? 'chrome';
    const version = data.version;
    if (version === undefined) return;
    const validForChrome = (CHROME_VERSIONS as readonly string[]).includes(version);
    const validForFirefox = (FIREFOX_VERSIONS as readonly string[]).includes(version);
    if (type === 'chrome' && !validForChrome) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Chrome does not support version "${version}". Supported: ${CHROME_VERSIONS.join(', ')}` });
    }
    if (type === 'firefox' && !validForFirefox) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Firefox does not support version "${version}". Supported: ${FIREFOX_VERSIONS.join(', ')}` });
    }
}).describe('The browser kernel config of the browser, default is version: ua_auto, type: chrome');

// Random UA Config Schema
// ua_system_version: Mac OS X / Windows / iOS / Android / Linux = random any version of that system; omit to random across all systems
const randomUaConfigSchema = z.object({
    ua_version: z.array(z.string()).optional(),
    ua_system_version: z.array(
        z.enum([
            'Android 9', 'Android 10', 'Android 11', 'Android 12', 'Android 13', 'Android 14', 'Android 15',
            'iOS 14', 'iOS 15', 'iOS 16', 'iOS 17', 'iOS 18',
            'Windows 7', 'Windows 8', 'Windows 10', 'Windows 11',
            'Mac OS X 10', 'Mac OS X 11', 'Mac OS X 12', 'Mac OS X 13', 'Mac OS X 14', 'Mac OS X 15',
            'Mac OS X', 'Windows', 'iOS', 'Android', 'Linux'
        ])
    ).optional().describe(
        'UA system version. Mac OS X / Windows / iOS / Android / Linux = random any version of that system; omit to random across all systems. e.g. ["Android 9", "iOS 14"] or ["Android", "Mac OS X"]'
    )
}).optional().describe('Random UA config (ua_version, ua_system_version). Ignored when fingerprint ua (custom UA) is set.');

// TLS cipher suite name -> hex code (valid values for tls are these hex codes, comma-separated)
export const TLS_CIPHER_SUITES = {
    TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384: '0xC02C',
    TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384: '0xC030',
    TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256: '0xC02B',
    TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256: '0xC02F',
    TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256: '0xCCA9',
    TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256: '0xCCA8',
    TLS_DHE_RSA_WITH_AES_256_GCM_SHA384: '0x009F',
    TLS_DHE_RSA_WITH_AES_128_GCM_SHA256: '0x009E',
    TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384: '0xC024',
    TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384: '0xC028',
    TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA: '0xC00A',
    TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA: '0xC014',
    TLS_DHE_RSA_WITH_AES_256_CBC_SHA256: '0x006B',
    TLS_DHE_RSA_WITH_AES_256_CBC_SHA: '0x0039',
    TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256: '0xC023',
    TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256: '0xC027',
    TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA: '0xC009',
    TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA: '0xC013',
    TLS_DHE_RSA_WITH_AES_128_CBC_SHA256: '0x0067',
    TLS_DHE_RSA_WITH_AES_128_CBC_SHA: '0x0033',
    TLS_RSA_WITH_AES_256_GCM_SHA384: '0x009D',
    TLS_RSA_WITH_AES_128_GCM_SHA256: '0x009C',
    TLS_RSA_WITH_AES_256_CBC_SHA256: '0x003D',
    TLS_RSA_WITH_AES_128_CBC_SHA256: '0x003C',
    TLS_RSA_WITH_AES_256_CBC_SHA: '0x0035',
    TLS_RSA_WITH_AES_128_CBC_SHA: '0x002F',
    TLS_AES_128_CCM_8_SHA256: '0x1305',
    TLS_AES_128_CCM_SHA256: '0x1304',
} as const;

const TLS_HEX_CODES = Object.values(TLS_CIPHER_SUITES) as [string, ...string[]];

// Country code: ISO 3166-1 alpha-2 (lowercase). 
export const COUNTRY_CODES = [
    'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az',
    'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz',
    'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cu', 'cv', 'cx', 'cy', 'cz',
    'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr',
    'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy',
    'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp',
    'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly',
    'ma', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz',
    'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py',
    'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv', 'sy', 'sz',
    'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'us', 'uy', 'uz',
    'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw'
] as const;
const countryCodeSchema = z.enum(COUNTRY_CODES);

// WebGL config when webgl=2: unmasked_vendor and unmasked_renderer required; webgpu optional (V2.6.8.1+)
const webglConfigSchema = z.object({
    unmasked_vendor: z.string().describe('WebGL vendor string, e.g. "Google Inc.". Required when webgl=2, cannot be empty.'),
    unmasked_renderer: z.string().describe('WebGL renderer string, e.g. "ANGLE (Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0)". Required when webgl=2, cannot be empty.'),
    webgpu: z.object({
        webgpu_switch: z.enum(['0', '1', '2']).describe('0: Disabled, 1: WebGL based matching, 2: Real')
    }).optional().describe('WebGPU setting (V2.6.8.1+)')
}).describe('Custom WebGL metadata when webgl=2. See AdsPower fingerprint_config webgl_config.');

// MAC address config (V4.3.9+)
const macAddressConfigSchema = z.object({
    model: z.enum(['0', '1', '2']).describe('0: use current computer MAC, 1: match appropriate value, 2: custom (address required)'),
    address: z.string().optional().describe('Custom MAC address when model=2, e.g. "E4-02-9B-3B-E9-27"')
}).describe('MAC address: model 0/1/2, address when model=2.');

// Media devices count when media_devices=2 (V2.6.4.2+)
const DEVICE_COUNT_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const mediaDevicesNumSchema = z.object({
    audioinput_num: z.enum(DEVICE_COUNT_VALUES).describe('Number of microphones, 1-9'),
    videoinput_num: z.enum(DEVICE_COUNT_VALUES).describe('Number of cameras, 1-9'),
    audiooutput_num: z.enum(DEVICE_COUNT_VALUES).describe('Number of speakers, 1-9')
}).describe('Device counts when media_devices=2: audioinput_num, videoinput_num, audiooutput_num each 1-9.');

// Fingerprint Config Schema
const fingerprintConfigSchema = z.object({
    automatic_timezone: z.enum(['0', '1']).optional().describe('Auto timezone by IP: 0 custom, 1 (default) by IP'),
    timezone: z.string().optional().describe('Timezone when automatic_timezone=0, e.g. Asia/Shanghai'),
    location_switch: z.enum(['0', '1']).optional().describe('Location by IP: 0 custom, 1 (default) by IP'),
    longitude: z.number().min(-180).max(180).optional().describe('Custom longitude when location_switch=0, -180 to 180, up to 6 decimals'),
    latitude: z.number().min(-90).max(90).optional().describe('Custom latitude when location_switch=0, -90 to 90, up to 6 decimals'),
    accuracy: z.number().int().min(10).max(5000).optional().describe('Location accuracy in meters when location_switch=0, 10-5000, default 1000'),
    location: z.enum(['ask', 'allow', 'block']).optional().describe('Site location permission: ask (default), allow, block'),
    language_switch: z.enum(['0', '1']).optional().describe('Language by IP country: 0 custom, 1 (default) by IP'),
    language: z.array(z.string()).optional().describe('Custom languages when language_switch=0, e.g. ["en-US", "zh-CN"]'),
    page_language_switch: z.enum(['0', '1']).optional().describe('Match UI language to language: 0 off, 1 (default) on; Chrome 109+ Win / 119+ macOS, v2.6.72+'),
    page_language: z.string().optional().describe('Page language when page_language_switch=0, e.g. en-US'),
    ua: z.string().optional().describe('Custom User-Agent string; when set, takes precedence over random_ua (random_ua is not sent). Omit for random UA.'),
    screen_resolution: z.union([
        z.enum(['none', 'random']),
        z.string().regex(/^\d+_\d+$/, 'Custom resolution format: width_height e.g. 1024_600')
    ]).optional().describe('Screen resolution: none (default), random, or width_height e.g. 1024_600'),
    fonts: z.array(z.string()).optional().describe('Font list e.g. ["Arial", "Times New Roman"] or ["all"]'),
    canvas: z.enum(['0', '1']).optional().describe('Canvas fingerprint: 0 computer default, 1 (default) add noise'),
    webgl: z.enum(['0', '2', '3']).optional().describe('WebGL metadata: 0 computer default, 2 custom (use webgl_config), 3 random'),
    webgl_image: z.enum(['0', '1']).optional().describe('WebGL image fingerprint: 0 default, 1 (default) add noise'),
    webgl_config: webglConfigSchema.optional().describe('Custom WebGL metadata when webgl=2. Must include unmasked_vendor and unmasked_renderer (non-empty). webgpu.webgpu_switch: 0 Disabled, 1 WebGL based, 2 Real. V2.6.8.1+'),
    flash: z.enum(['block', 'allow']).optional().describe('Flash: block (default) or allow'),
    webrtc: z.enum(['disabled', 'forward', 'proxy', 'local']).optional().describe('WebRTC: disabled (default), forward, proxy, local'),
    audio: z.enum(['0', '1']).optional().describe('Audio fingerprint: 0 close, 1 (default) add noise'),
    do_not_track: z.enum(['default', 'true', 'false']).optional().describe('Do Not Track: default, true (open), false (close)'),
    hardware_concurrency: z.enum(['2', '4', '6', '8', '16']).optional().describe('CPU cores: 2, 4 (default if omitted), 6, 8, 16; omit to follow current computer'),
    device_memory: z.enum(['2', '4', '6', '8']).optional().describe('Device memory (GB): 2, 4, 6, 8 (default if omitted); omit to follow current computer'),
    scan_port_type: z.enum(['0', '1']).optional().describe('Port scan protection: 0 close, 1 (default) enable'),
    allow_scan_ports: z.array(z.string()).optional().describe('Ports allowed when scan_port_type=1, e.g. ["4000","4001"]. Empty to not pass.'),
    media_devices: z.enum(['0', '1', '2']).optional().describe('Media devices: 0 off (use computer default), 1 noise (count follows local), 2 noise (use media_devices_num). V2.6.4.2+'),
    media_devices_num: mediaDevicesNumSchema.optional().describe('When media_devices=2: audioinput_num, videoinput_num, audiooutput_num each 1-9. V2.6.4.2+'),
    client_rects: z.enum(['0', '1']).optional().describe('ClientRects: 0 use computer default, 1 add noise. V3.6.2+'),
    device_name_switch: z.enum(['0', '1', '2']).optional().describe('Device name: 0 close (use computer name), 1 mask, 2 custom (use device_name). V3.6.25+'),
    device_name: z.string().optional().describe('Custom device name when device_name_switch=2. V2.4.8.1+'),
    speech_switch: z.enum(['0', '1']).optional().describe('SpeechVoices: 0 use computer default, 1 replace with value. V3.11.10+'),
    mac_address_config: macAddressConfigSchema.optional().describe('MAC address: model 0/1/2, address when model=2. V4.3.9+'),
    gpu: z.enum(['0', '1', '2']).optional().describe('GPU: 0 follow Local settings - Hardware acceleration, 1 turn on, 2 turn off'),
    browser_kernel_config: browserKernelConfigSchema.optional(),
    random_ua: randomUaConfigSchema.optional().describe('Random UA config; ignored when ua (custom UA) is provided.'),
    tls_switch: z.enum(['0', '1']).optional().describe('TLS custom list: 0 (default) off, 1 on'),
    tls: z.string()
        .optional()
        .refine(
            (val) => !val || val.split(',').every((hex) => TLS_HEX_CODES.includes(hex.trim() as (typeof TLS_HEX_CODES)[number])),
            { message: `tls must be comma-separated hex codes from: ${TLS_HEX_CODES.join(', ')}. e.g. "0xC02C,0xC030"` }
        )
        .describe('TLS cipher list when tls_switch=1: comma-separated hex codes. Chrome kernel only.')
}).optional().superRefine((data, ctx) => {
    if (!data) return;
    if (data.browser_kernel_config?.type === 'firefox' && data.tls) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tls is only supported for Chrome kernel', path: ['tls'] });
    }
    if (data.webgl === '2') {
        const wc = data.webgl_config;
        if (!wc || typeof wc.unmasked_vendor !== 'string' || wc.unmasked_vendor.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'When webgl=2, webgl_config.unmasked_vendor is required and cannot be empty', path: ['webgl_config', 'unmasked_vendor'] });
        }
        if (!wc || typeof wc.unmasked_renderer !== 'string' || wc.unmasked_renderer.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'When webgl=2, webgl_config.unmasked_renderer is required and cannot be empty', path: ['webgl_config', 'unmasked_renderer'] });
        }
    }
}).describe('Fingerprint config (fingerprint_config). All fields optional. See AdsPower Local API fingerprint_config.');

export const schemas = {
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
        userProxyConfig: userProxyConfigSchema.default({ proxy_soft: 'no_proxy' }).describe('Proxy configuration. If proxyid is provided, proxyid takes priority and this field is ignored. Defaults to no_proxy when neither proxyid nor a custom proxy is needed.'),
        proxyid: z.string().optional().describe('Proxy profile ID. Takes priority over userProxyConfig when provided.'),
        repeatConfig: z.array(z.union([z.literal(0), z.literal(2), z.literal(3), z.literal(4)])).optional().describe('Account deduplication settings (0, 2, 3, or 4)'),
        ignoreCookieError: z.enum(['0', '1']).optional().describe('Handle cookie verification failures: 0 (default) return data as-is, 1 filter out incorrectly formatted cookies'),
        tabs: z.array(z.string()).optional().describe('URLs to open on startup, eg: ["https://www.google.com"]'),
        ip: z.string().optional().describe('IP address'),
        country: countryCodeSchema.optional().describe('Country/Region, ISO 3166-1 alpha-2 (lowercase). eg: "cn", "us"'),
        region: z.string().optional().describe('Region'),
        city: z.string().optional().describe('City'),
        ipchecker: z.enum(['ip2location', 'ipapi']).optional().describe('IP query channel'),
        categoryId: z.string().optional().describe('The category id of the browser, you can use the get-application-list tool to get the application list'),
        fingerprintConfig: fingerprintConfigSchema.optional().default({ random_ua: { ua_system_version: ['Windows'] } })
    }),

    updateBrowserSchema: z.object({
        platform: z.string().optional().describe('The platform of the browser, eg: facebook.com'),
        tabs: z.array(z.string()).optional().describe('The tabs of the browser, eg: ["https://www.google.com"]'),
        cookie: z.string().optional().describe('The cookie of the browser'),
        username: z.string().optional().describe('The username of the browser, eg: "user"'),
        password: z.string().optional().describe('The password of the browser, eg: "password"'),
        fakey: z.string().optional().describe('Enter the 2FA-key'),
        ignoreCookieError: z.enum(['0', '1']).optional().describe('Specifies how to handle the case when cookie validation fails.'),
        groupId: z.string().optional().describe('The group id of the browser, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list or create a new group'),
        name: z.string().max(100).optional().describe('The Profile name of the browser, eg: "My Browser"'),
        remark: z.string().max(1500).optional().describe('Profile remarks, maximum 1500 characters'),
        country: countryCodeSchema.optional().describe('The country of the browser, ISO 3166-1 alpha-2 (lowercase). eg: "cn", "us"'),
        region: z.string().optional().describe('The region of the browser'),
        city: z.string().optional().describe('The city of the browser'),
        ip: z.string().optional().describe('The IP of the browser'),
        categoryId: z.string().optional().describe('The category id of the browser, you can use the get-application-list tool to get the application list'),
        userProxyConfig: userProxyConfigSchema.optional(),
        proxyid: z.string().optional().describe('Proxy ID'),
        fingerprintConfig: fingerprintConfigSchema.optional(),
        launchArgs: z.string().optional().describe('Browser startup parameters'),
        profileId: z.string().describe('The profile id of the browser to update, it is required when you want to update the browser')
    }),

    openBrowserSchema: z.object({
        profileNo: z.string().optional().describe('Priority will be given to user id when profile_id is filled.'),
        profileId: z.string().describe('Unique profile ID, generated after creating profile. The profile id of the browser to open'),
        ipTab: z.enum(['0', '1']).optional().describe('The ip tab of the browser, 0 is not use ip tab, 1 is use ip tab, default is 0'),
        launchArgs: z.string().optional().describe('The launch args of the browser, use chrome launch args, or vista url'),
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
            .describe('Sort order: "asc" (ascending) or "desc" (descending)'),
        tag_ids: z.array(z.string()).optional()
            .describe('Tag IDs to filter profiles by tags. Example: ["tag1","tag2"]'),
        tags_filter: z.enum(['include', 'exclude']).optional()
            .describe('Tag matching mode: "include" (default) matches profiles with any of the tags, "exclude" matches profiles without the tags'),
        name: z.string().optional()
            .describe('Profile name keyword to search for'),
        name_filter: z.enum(['include', 'exclude']).optional()
            .describe('Name matching mode: "include" (default) matches profiles containing the name keyword, "exclude" matches profiles not containing the name keyword')
    }).strict(),

    moveBrowserSchema: z.object({
        groupId: z.string()
            .regex(/^\d+$/, "Group ID must be a numeric string")
            .describe('The target group id, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list'),
        userIds: z.array(z.string()).describe('The browser Profile ids to move')
    }).strict(),

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
        shareType: z.number().int().optional().describe('Share type: 1 for email (default), 2 for phone number'),
        content: z.array(z.enum(['name', 'proxy', 'remark', 'tabs'])).optional().describe('Shared content')
    }).strict(),

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
        groupName: z.string().optional().describe('The name of the group to search, use like to search'),
        size: z.number().optional().describe('The size of the page, max is 100, default is 10'),
        page: z.number().optional().describe('The page of the group, default is 1')
    }).strict(),

    getApplicationListSchema: z.object({
        category_id: z.string().optional().describe('Extension category_id'),
        page: z.number().optional().describe('Page number, default 1'),
        limit: z.number().min(1).max(100).optional().describe('Default 1, how many values are returned per page, range 1 to 100')
    }).strict(),

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

    createProxySchema: z.object({
        proxies: z.array(z.object({
            type: z.enum(['http', 'https', 'ssh', 'socks5']).describe('Proxy type, support: http/https/ssh/socks5'),
            host: z.string().describe('Proxy host, support: ipV4, ipV6, eg: 192.168.0.1'),
            port: z.string().describe('Port, range: 0-65536, eg: 8000'),
            user: z.string().optional().describe('Proxy username, eg: user12345678'),
            password: z.string().optional().describe('Proxy password, eg: password'),
            proxy_url: z.string().optional().describe('URL used to refresh the proxy, eg: https://www.baidu.com/'),
            remark: z.string().optional().describe('Remark/description for the proxy'),
            ipchecker: z.enum(['ipinfo', 'ip2location', 'ipapi', 'ipfoxy']).optional().describe('IP checker.')
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
        ipchecker: z.enum(['ip2location', 'ipapi', 'ipfoxy']).optional().describe('IP checker.')
    }).strict(),

    getProxyListSchema: z.object({
        limit: z.number().optional().describe('Profiles per page. Number of proxies returned per page, range 1 ~ 200, default is 50'),
        page: z.number().optional().describe('Page number for results, default is 1'),
        proxyId: z.array(z.string()).optional().describe('Query by proxy ID. Example: ["proxy1","proxy2"]')
    }).strict(),

    deleteProxySchema: z.object({
        proxyIds: z.array(z.string()).describe('The proxy ids of the proxies to delete, it is required when you want to delete the proxy. The maximum is 100. ')
    }).strict(),

    emptySchema: z.object({}).strict(),

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
        selector: z.string().describe('The selector of the element to scroll, find from the page source code')
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
