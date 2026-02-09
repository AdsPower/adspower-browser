# FingerprintConfig (fingerprint config for create-browser / update-browser)

**fingerprintConfig** is aligned with AdsPower Local API **fingerprint_config**; all fields are optional. 

- **automatic_timezone** (optional): Auto timezone by IP. `'0'` custom / `'1'` by IP (default)
- **timezone** (optional): Timezone when automatic_timezone=0, e.g. `Asia/Shanghai`
- **location_switch** (optional): Location by IP. `'0'` custom / `'1'` by IP (default)
- **longitude** (optional): Custom longitude when location_switch=0, -180 to 180, up to 6 decimals
- **latitude** (optional): Custom latitude when location_switch=0, -90 to 90, up to 6 decimals
- **accuracy** (optional): Location accuracy in meters when location_switch=0, 10–5000 integer, default 1000
- **location** (optional): Site location permission. `'ask'` (default) / `'allow'` / `'block'`
- **language_switch** (optional): Language by IP country. `'0'` custom / `'1'` by IP (default)
- **language** (optional): Custom languages when language_switch=0, e.g. `["en-US", "zh-CN"]`
- **page_language_switch** (optional): Match UI language to language. `'0'` off / `'1'` on (default); requires Chrome 109+ Win / 119+ macOS, AdsPower v2.6.72+
- **page_language** (optional): Page language when page_language_switch=0, e.g. `en-US`
- **ua** (optional): Custom User-Agent string; when set, takes precedence over **random_ua** (random_ua is not sent). Omit for random UA.
- **screen_resolution** (optional): Screen resolution. `'none'` follow computer (default) / `'random'` / or `"width_height"` e.g. `"1024_600"`
- **fonts** (optional): Font list, e.g. `["Arial", "Times New Roman"]` or `["all"]`
- **canvas** (optional): Canvas fingerprint. `'0'` computer default / `'1'` add noise (default)
- **webgl** (optional): WebGL metadata. `'0'` computer default / `'2'` custom (requires **webgl_config**) / `'3'` random
- **webgl_image** (optional): WebGL image fingerprint. `'0'` computer default / `'1'` add noise (default)
- **webgl_config** (optional): When webgl=2, **required**; vendor and renderer cannot be empty.
  - **unmasked_vendor** (required when webgl=2): e.g. `"Google Inc."`
  - **unmasked_renderer** (required when webgl=2): e.g. `"ANGLE (Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0)"`
  - **webgpu** (optional): `{ "webgpu_switch": "0" | "1" | "2" }` — 0 Disabled, 1 WebGL based matching, 2 Real. V2.6.8.1+
- **flash** (optional): Flash. `'block'` (default) / `'allow'`
- **webrtc** (optional): WebRTC. `'disabled'` (default) / `'forward'` / `'proxy'` / `'local'`
- **audio** (optional): Audio fingerprint. `'0'` close / `'1'` add noise (default)
- **do_not_track** (optional): DNT. `'default'` / `'true'` (open) / `'false'` (close)
- **hardware_concurrency** (optional): CPU cores. `'2'` | `'4'` | `'6'` | `'8'` | `'16'`; omit to follow computer
- **device_memory** (optional): Device memory (GB). `'2'` | `'4'` | `'6'` | `'8'`; omit to follow computer
- **scan_port_type** (optional): Port scan protection. `'0'` close / `'1'` enable (default)
- **allow_scan_ports** (optional): Ports allowed when scan_port_type=1, e.g. `["4000","4001"]`
- **media_devices** (optional): Media devices. `'0'` off / `'1'` noise (count from local) / `'2'` noise (use **media_devices_num**). V2.6.4.2+
- **media_devices_num** (optional): When media_devices=2: `{ "audioinput_num": "1"-"9", "videoinput_num": "1"-"9", "audiooutput_num": "1"-"9" }`. V2.6.4.2+
- **client_rects** (optional): ClientRects. `'0'` computer default / `'1'` add noise. V3.6.2+
- **device_name_switch** (optional): Device name. `'0'` close / `'1'` mask / `'2'` custom (**device_name**). V3.6.25+
- **device_name** (optional): Custom device name when device_name_switch=2. V2.4.8.1+
- **speech_switch** (optional): SpeechVoices. `'0'` computer default / `'1'` replace. V3.11.10+
- **mac_address_config** (optional): MAC address. `{ "model": "0"|"1"|"2", "address"?: string }` — 0 use computer, 1 match, 2 custom (address required). V4.3.9+
- **gpu** (optional): GPU. `'0'` follow Local settings / `'1'` turn on / `'2'` turn off
- **browser_kernel_config** (optional): Browser kernel; type and version must match. See [browser-kernel-config.md](browser-kernel-config.md)
- **random_ua** (optional): Random UA; ignored when **ua** (custom UA) is provided.
  - **ua_version** (optional): UA version string array
  - **ua_system_version** (optional): System version enum array. See [ua-system-version.md](ua-system-version.md)
- **tls_switch** (optional): Enable custom TLS. `'0'` (default) / `'1'`
- **tls** (optional): **Chrome kernel only**. Comma-separated TLS hex codes when tls_switch=1, e.g. `"0xC02C,0xC030"`. See [chrome-tls-cipher.md](chrome-tls-cipher.md)

Example: `"fingerprintConfig":{"timezone":"America/New_York","language":["en-US"],"webrtc":"proxy","browser_kernel_config":{"version":"ua_auto","type":"chrome"}}`
