# Random UA — `ua_system_version` enum

Used under **fingerprintConfig** → **random_ua** → **ua_system_version**.

## Specific versions (fixed OS version)

| System   | Values |
|----------|--------|
| Android  | `Android 9`, `Android 10`, `Android 11`, `Android 12`, `Android 13`, `Android 14`, `Android 15` |
| iOS      | `iOS 12`, `iOS 13`, `iOS 14`, `iOS 15`, `iOS 16`, `iOS 17`, `iOS 18`, `iOS 26` |
| Windows  | `Windows 7`, `Windows 8`, `Windows 10`, `Windows 11` |
| Mac OS X | `Mac OS X 10`, `Mac OS X 11`, `Mac OS X 12`, `Mac OS X 13`, `Mac OS X 14`, `Mac OS X 15`, `Mac OS X 26` |
| Linux    | `Linux` |

## Generic (random any version of that system)

- `Mac OS X` — random any macOS version  
- `Windows` — random any Windows version  
- `iOS` — random any iOS version  
- `Android` — random any Android version  
- `Linux` — random any Linux (same as specific `Linux` here)

## Behavior

- **Omit** `ua_system_version`: UA is chosen at random across **all** systems.
- **Provide** an array: UA is chosen only from the listed system/versions (specific and/or generic can be mixed).

## Examples

- `["Android 9", "iOS 14"]` — only Android 9 or iOS 14
- `["Android", "Mac OS X"]` — any Android version or any macOS version
- `["Windows 11", "Mac OS X 15"]` — only Windows 11 or Mac OS X 15
