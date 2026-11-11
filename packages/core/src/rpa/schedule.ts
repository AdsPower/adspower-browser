import { z } from 'zod';

const timestamp = z.number().int().nonnegative();
const recurring = { start_time: timestamp, end_time: timestamp.optional() };
const execTime = z.number().int().min(0).max(86340).multipleOf(60);

export const rpaScheduleRuleSchema = z.discriminatedUnion('freq', [
    z.object({ freq: z.literal('once'), start_time: timestamp }).strict(),
    z.object({ freq: z.literal('interval'), ...recurring, gap_time: z.number().int().min(10).max(1440) }).strict(),
    z.object({ freq: z.literal('day'), ...recurring, exec_time: execTime }).strict(),
    z.object({ freq: z.literal('week'), ...recurring, exec_time: execTime,
        weekday: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) }).strict(),
    z.object({ freq: z.literal('month'), ...recurring, exec_time: execTime,
        monthday: z.number().int().min(1).max(30) }).strict(),
]);

export type RpaScheduleRule = z.infer<typeof rpaScheduleRuleSchema>;

export const rpaScheduleJsonSchema = z.string().superRefine((value, ctx) => {
    let parsed: unknown;
    try { parsed = JSON.parse(value); }
    catch { ctx.addIssue({ code: 'custom', message: 'schedule_rule must be a valid JSON string.' }); return; }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0) return;
    const result = rpaScheduleRuleSchema.safeParse(parsed);
    if (!result.success) {
        for (const issue of result.error.issues) {
            ctx.addIssue({ code: 'custom', message: `schedule_rule.${issue.path.join('.')}: ${issue.message}` });
        }
    }
}).describe('Schedule encoded as JSON. Regular tasks use {}. Scheduled tasks require freq (once/interval/day/week/month) and start_time (Unix seconds). Recurring rules allow end_time (Unix seconds). interval requires gap_time (10-1440 whole minutes); day/week/month require exec_time (seconds since midnight, 0-86340, multiples of 60); week requires weekday (Monday-Sunday); month requires monthday (1-30). Unknown fields are rejected.');

export function validateTaskSchedule(
    value: { exec_type: number; schedule_rule?: string }, ctx: z.RefinementCtx, isCreate: boolean,
): void {
    let rule: unknown;
    try { rule = JSON.parse(value.schedule_rule ?? '{}'); }
    catch { return; } // The field schema reports malformed JSON.
    if (value.exec_type === 1) {
        if (!rule || typeof rule !== 'object' || Array.isArray(rule) || Object.keys(rule).length !== 0) {
            ctx.addIssue({ code: 'custom', path: ['schedule_rule'], message: 'Regular tasks require an empty schedule object.' });
        }
        return;
    }
    const result = rpaScheduleRuleSchema.safeParse(rule);
    if (!result.success) {
        ctx.addIssue({ code: 'custom', path: ['schedule_rule'], message: 'Scheduled tasks require a complete frequency-specific schedule.' });
        return;
    }
    const schedule = result.data;
    if (isCreate && schedule.start_time * 1000 - Date.now() <= 600000) {
        ctx.addIssue({ code: 'custom', path: ['schedule_rule'], message: 'start_time must be more than 10 minutes in the future.' });
    }
    if ('end_time' in schedule && schedule.end_time !== undefined && schedule.end_time - schedule.start_time <= 600) {
        ctx.addIssue({ code: 'custom', path: ['schedule_rule'], message: 'end_time must be more than 10 minutes after start_time.' });
    }
}
