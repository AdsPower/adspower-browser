# Browser Kernel Management

These commands already use aligned snake_case parameter names.

**download-kernel** — Download or update a specific browser kernel version.

- **kernel_type** (required): `Chrome` | `Firefox`.
- Match user browser names using the [kernel type alias mapping](browser-kernel-download-management.md#match-user-wording-to-kernel_type): 火狐 / flowerBrowser → `Firefox`; google / 谷歌 / sunBrowser → `Chrome` (English names are case-insensitive).
- **kernel_version** (required): Kernel version string, for example `"141"`.

**get-kernel-list** — Get browser kernel list.

- **kernel_type** (optional): `Chrome` | `Firefox`. Omit to return all supported kernels.
