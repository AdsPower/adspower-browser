# 工具意图与触发词对照表

本表与仓库内 `packages/core/src/constants/toolIntentMetadata.ts` 中的 `TOOL_INTENT_BY_NAME` 一致，用于反映 MCP 工具与 CLI 命令共用的中英意图元数据（路由与描述生成同源）。

| Tool | Intent (EN) | Intent (ZH) | Triggers (EN) | Triggers (ZH) |
|------|-------------|-------------|---------------|---------------|
| `open-browser` | Start an existing AdsPower browser profile (launch the profile browser). | 启动已存在的 AdsPower 浏览器环境（用户常称环境、配置文件、profile）。 | open browser, launch profile, start environment, open AdsPower, open config profile | 打开浏览器,启动环境,打开配置,打开配置文件,打开profile,拉起AdsPower,启动指纹浏览器 |
| `close-browser` | Stop a running AdsPower browser profile. | 关闭正在运行的浏览器环境 / profile。 | close browser, stop profile, shutdown environment, kill browser | 关闭浏览器,停止环境,关掉profile,结束浏览器,退出指纹环境 |
| `create-browser` | Create a new AdsPower browser profile (account). | 新建浏览器环境 / 账号 profile。 | create profile, new browser, add account, spin up profile | 新建环境,创建profile,添加浏览器,新开指纹,创建账号 |
| `update-browser` | Update fields of an existing browser profile. | 更新已有 profile 的配置（备注、代理、指纹等）。 | edit profile, change settings, modify browser, update fingerprint | 修改配置,更新profile,改代理,改指纹,编辑环境 |
| `delete-browser` | Delete one or more browser profiles permanently. | 永久删除一个或多个浏览器 profile。 | remove profile, delete account, trash browser | 删除环境,移除profile,删掉浏览器账号 |
| `get-browser-list` | List or search browser profiles (pagination, filters). | 分页/条件查询浏览器 profile 列表。 | list profiles, search browsers, query accounts, show all profiles | 列表,查询环境,搜索profile,列出所有浏览器 |
| `get-opened-browser` | List browser profiles currently open on this device. | 查看本机当前已打开的浏览器 profile。 | opened browsers, running profiles, active local sessions | 已打开,正在运行,当前会话,本地活跃 |
| `move-browser` | Move profiles to another group (regroup). | 将 profile 移动到指定分组。 | move to group, regroup profiles, change group | 移动分组,换组,归类到组 |
| `get-profile-cookies` | Read cookies for one profile. | 读取单个 profile 的 Cookie。 | get cookies, export cookies, read cookie jar | 导出Cookie,查看Cookie,读取站点Cookie |
| `get-profile-ua` | Get User-Agent strings for up to 10 profiles. | 批量查询最多 10 个 profile 的 UA。 | user agent, UA string, browser UA | UA,用户代理,浏览器标识 |
| `close-all-profiles` | Close all opened profiles on this device. | 关闭本机所有已打开的环境。 | close everything, stop all browsers, shutdown all profiles | 全部关闭,一键关环境,关所有浏览器 |
| `new-fingerprint` | Generate a new fingerprint for up to 10 profiles. | 为最多 10 个 profile 重新生成指纹。 | refresh fingerprint, regenerate fp, new device identity | 刷新指纹,重新指纹,换设备指纹 |
| `delete-cache-v2` | Clear selected local cache types for profiles. | 按类型清理 profile 本地缓存。 | clear cache, wipe storage, delete history cache | 清缓存,删历史,清理本地数据 |
| `share-profile` | Share profiles to another AdsPower account. | 将 profile 分享给其他 AdsPower 账号。 | share account, transfer profile, send browser to user | 分享环境,转让profile,发给同事 |
| `get-browser-active` | Get active status/details for one profile. | 查询单个 profile 的活跃/运行信息。 | is profile running, active status, browser state | 是否在线,活跃状态,运行信息 |
| `get-cloud-active` | Query cloud-side active status for many profile IDs. | 按 user_ids 批量查询云端活跃状态。 | cloud status, remote active, team multi device caveat | 云端状态,远程是否打开,多设备模式限制 |
| `create-group` | Create a browser profile group. | 新建浏览器分组。 | new group, add folder for profiles | 新建分组,创建组,环境分组 |
| `update-group` | Rename or update a group. | 重命名或更新分组信息。 | rename group, edit group | 改组名,更新分组 |
| `get-group-list` | List groups with optional name search. | 分页查询分组列表，可按名称搜索。 | list groups, search group name | 分组列表,查组名 |
| `check-status` | Check Local API availability on this machine. | 检测本机 Local API 是否可用。 | API health, connection status, ping AdsPower API | 接口通不通,检测API,连接状态 |
| `get-application-list` | List application/extension categories with pagination. | 分页获取应用/扩展分类列表。 | categories, extension list, application catalog | 应用分类,扩展目录,类别列表 |
| `create-proxy` | Create one or more proxy entries. | 新建一条或多条代理配置。 | add proxy, new proxy row | 添加代理,新建代理 |
| `update-proxy` | Update an existing proxy entry. | 更新已有代理项。 | edit proxy, change proxy host | 修改代理,更新代理 |
| `get-proxy-list` | List proxies with filters/pagination. | 分页/条件查询代理列表。 | list proxies, search proxy | 代理列表,查代理 |
| `delete-proxy` | Delete proxies by id list. | 按 ID 列表删除代理。 | remove proxy, delete proxy entries | 删除代理,移除代理 |
| `get-tag-list` | List browser tags. | 查询浏览器标签列表。 | list tags, label list | 标签列表,查看标签 |
| `create-tag` | Create tags (batch). | 批量创建标签。 | new tag, add label | 新建标签,添加标签 |
| `update-tag` | Update existing tags (batch). | 批量更新标签。 | rename tag, change tag color | 改标签名,改颜色 |
| `delete-tag` | Delete tags by id list. | 按 ID 删除标签。 | remove tags | 删除标签 |
| `download-kernel` | Download or update a browser kernel version. | 下载或更新指定内核版本。 | download chrome kernel, fetch firefox kernel | 下载内核,更新Chrome内核 |
| `get-kernel-list` | List supported kernel versions (optional type filter). | 查询支持的内核版本列表。 | kernel versions, supported browsers list | 内核列表,可用版本 |
| `update-patch` | Update AdsPower client patch channel. | 将 AdsPower 客户端更新到补丁通道版本。 | upgrade client, patch update, stable beta channel | 升级客户端,补丁更新,稳定版测试版 |
| `connect-browser-with-ws` | Attach Playwright automation using ws from open-browser. | 用 open-browser 返回的 ws 连接自动化（Playwright）。 | connect puppeteer, attach playwright, ws automation | 连接自动化,挂上Playwright,用ws控制 |
| `open-new-page` | Open a new page in the connected automation session. | 在已连接会话中打开新标签页/页面。 | new tab, new page | 新标签页,新页面 |
| `navigate` | Navigate current automation page to a URL. | 自动化当前页跳转到 URL。 | goto url, open url in automation | 跳转网址,打开链接 |
| `screenshot` | Capture screenshot of the automation page. | 截取自动化当前页面截图。 | screenshot, capture page image | 截图,截屏 |
| `get-page-visible-text` | Read visible text of the current page. | 读取当前页可见文本。 | visible text, page text content | 可见文字,页面文本 |
| `get-page-html` | Read HTML of the current page. | 读取当前页 HTML。 | page source, dom html | 网页源码,HTML |
| `click-element` | Click an element by selector in automation session. | 在自动化会话中按选择器点击元素。 | click button, tap element | 点击按钮,点元素 |
| `fill-input` | Fill an input field by selector. | 按选择器填写输入框。 | type text, enter value, input field | 输入文字,填表单 |
| `select-option` | Select a dropdown option by selector and value. | 下拉框按 selector 与 value 选择。 | dropdown select, pick option | 下拉选择,选选项 |
| `hover-element` | Hover an element by selector. | 悬停到指定元素。 | mouse over, hover menu | 鼠标悬停,划过菜单 |
| `scroll-element` | Scroll an element into view or by selector. | 滚动指定元素或区域。 | scroll into view, page scroll | 滚动到可见,页面滚动 |
| `press-key` | Press a keyboard key (optional focused selector). | 模拟按键（可选限定在元素上）。 | hit Enter, keyboard shortcut | 按回车,快捷键 |
| `evaluate-script` | Run JavaScript in the page context. | 在页面上下文执行 JS。 | execute js, run script in page | 执行脚本,页面JS |
| `drag-element` | Drag an element to a target element. | 拖拽元素到另一元素。 | drag and drop, dnd | 拖拽,拖放 |
| `iframe-click-element` | Click inside an iframe by iframe and inner selectors. | 在 iframe 内点击子元素。 | iframe click, nested frame | 框架内点击,iframe里点 |
