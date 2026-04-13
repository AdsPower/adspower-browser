# Browser Kernel Management

These commands already use aligned snake_case parameter names.

**download-kernel** — Download or update a specific browser kernel version.

- **kernel_type** (required): `Chrome` | `Firefox`.
- **kernel_version** (required): Kernel version string, for example `"141"`.

**get-kernel-list** — Get browser kernel list.

- **kernel_type** (optional): `Chrome` | `Firefox`. Omit to return all supported kernels.
