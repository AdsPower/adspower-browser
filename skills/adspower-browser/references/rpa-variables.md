# RPA Global Variables

Use this reference before supplying `variable` to process creation, content updates, metadata updates, or debugging. These are the client-compatible objects to generate; older key/value-only inputs accepted by the transport do not provide complete editor metadata.

The client's process metadata and the flow file are separate representations. The variable editor reads the process metadata's `variable` JSON directly; it does not fill in missing types from the flow file. For generated flows, build one complete variable array and use it consistently in all three locations:

1. `startNode.data.globalVariable` (array).
2. `startNode.data.config.variableObjList` (array).
3. The process tool's `variable` parameter (`JSON.stringify` of that same array).

Never reduce API variables to `{key, value}` or `{key, val}`. Each generated entry must contain all eight fields: `id`, `key`, `type`, `value`, `remark`, `isExpand`, `error`, `valueError`. Use a unique numeric `id` for each variable, and preserve those IDs across the three representations and later edits. Set `isExpand: true`, `error: ""`, `valueError: ""`; these flags do not replace actual validation. With no variables use empty arrays in the file and `"[]"` in the API parameter. Serialize once: the parameter must decode to an array, not another JSON string.

Allowed global `type` values are exactly `string`, `number`, `boolean`, `array`, `object`, `text`, `file`, `folder` (lowercase). UI labels such as `String` are not stored values. Runtime output types such as `element` and `any` are not global variable types.

For API compatibility, generate `value` as a string even for non-string types:

| type | Stored default value |
| --- | --- |
| `string`, `text` | Text, or `""` for an unset default |
| `number` | Numeric text, e.g. `"3"`; not a JSON number |
| `boolean` | `"true"` or `"false"`; not a JSON boolean |
| `array` | JSON array text, e.g. `"[1,2]"`; not a nested array |
| `object` | JSON non-null object text, e.g. `"{\"enabled\":true}"`; not a nested object |
| `file`, `folder` | User-supplied local path text, or `""` if not supplied; do not invent paths |

The frontend permits unset defaults and recognizes a whole-value `${variable}` reference without applying literal-value checks. For nonempty literal defaults validate numbers, booleans and JSON containers against the declared type; preserve the declared type when using a reference and ensure the referenced input is available.

Variable keys must be nonempty, unique, and match the frontend's `^[a-zA-Z$_][a-zA-Z\d_]*$`; use raw keys without `${}`. Also honor the current API limits: at most 1000 variables, 1048576 UTF-8 bytes for the encoded array, 32 characters per key and 1000 characters per value. The editor's manual add control stops at 200 entries; this is distinct from the API's 1000-entry limit. Do not discard or truncate variables to fit a limit.

Example tool argument (JSON string, containing complete objects):

```json
{
  "variable": "[{\"id\":1792479861479,\"key\":\"profileurl\",\"type\":\"string\",\"error\":\"\",\"value\":\"\",\"remark\":\"\",\"isExpand\":true,\"valueError\":\"\"},{\"id\":1792479891645,\"key\":\"postnumber\",\"type\":\"number\",\"error\":\"\",\"value\":\"3\",\"remark\":\"抓取帖子数\",\"isExpand\":true,\"valueError\":\"\"}]"
}
```

Before creation or a content update, decode the outgoing `variable` and compare its complete objects with both start-node arrays, including IDs, types, defaults and remarks. For metadata-only updates, preserve existing complete objects and merge only the requested changes; do not silently rebuild unrelated variable metadata.
