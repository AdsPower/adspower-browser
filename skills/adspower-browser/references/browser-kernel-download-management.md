# Browser Kernel Download Management

This reference is the focused version of the `download-kernel` contract.

**download-kernel** — Download or update a specific browser kernel version.

- **kernel_type** (required): `Chrome` | `Firefox`.
- **kernel_version** (required): Kernel version string, for example `"141"`.

## Match user wording to `kernel_type`

Normalize browser names and aliases before calling `download-kernel`; match English names case-insensitively, including when they appear in a longer request:

| User wording or browser family | `kernel_type` |
| --- | --- |
| 火狐、Firefox、Mozilla Firefox、flowerBrowser, or other wording clearly referring to the Firefox family | `Firefox` |
| 谷歌、Google、Google Chrome、Chrome、Chromium、sunBrowser, or other wording clearly referring to the Google/Chrome family | `Chrome` |

For example, “下载火狐 版本 120 内核” maps to `{"kernel_type":"Firefox","kernel_version":"120"}`, and “下载 google 141 内核” maps to `{"kernel_type":"Chrome","kernel_version":"141"}`. Send only the exact API values `Firefox` or `Chrome`, never the user's alias. If the wording does not identify either family or conflicts between them, ask which kernel type the user wants.
