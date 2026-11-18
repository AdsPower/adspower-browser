# RPA Task Schedule Rules

`rpa-create-task` and `rpa-update-task` accept `schedule_rule` as a JSON string with a fixed field contract. Unknown fields, irrelevant frequency-specific fields and invalid values are rejected. Core exports `RpaScheduleRule`, `rpaScheduleRuleSchema`, and `rpaScheduleJsonSchema`.

- Regular tasks (`exec_type=1`): use `"{}"`. Creation defaults to this value when omitted.
- Scheduled tasks (`exec_type=2`): a complete schedule is required; neither omission nor `"{}"` is valid.
- `start_time` and optional `end_time` are nonnegative integer Unix timestamps in **seconds**, not milliseconds.
- On creation, `start_time` must be more than 10 minutes in the future. Updates may retain existing start times.
- If provided, `end_time` must be more than 10 minutes after `start_time`.

| `freq` | Required fields besides `freq` | Optional fields | Rules |
|---|---|---|---|
| `once` | `start_time` | None | Execute once. No `end_time`. |
| `interval` | `start_time`, `gap_time` | `end_time` | `gap_time`: integer minutes from 10 to 1440. |
| `day` | `start_time`, `exec_time` | `end_time` | `exec_time`: seconds since local midnight; integer 0-86340, a multiple of 60 (HH:mm precision). |
| `week` | `start_time`, `exec_time`, `weekday` | `end_time` | Same `exec_time` rule; `weekday`: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday or Sunday (case-sensitive). |
| `month` | `start_time`, `exec_time`, `monthday` | `end_time` | Same `exec_time` rule; `monthday`: integer 1-30, matching the frontend selector. |

For example, a weekly schedule at 09:00 uses `"exec_time":32400`. Obtain the intended date/time and runtime timezone before choosing timestamps; the API has no timezone field. Do not invent schedule fields such as cron.

Source: `mix_fe_plus/src/views/auto/rpaPlus/components/taskInfo.vue`, `taskManage/addTask.vue`, and `taskManage/editTask/taskConfig.vue`.
