import { z } from 'zod';

export const DEFAULT_RPA_SETTINGS: Readonly<RpaSettings> = Object.freeze({
    exceptHandle: 'skip',
    close_browser: 'auto',
    save_tab: '0',
    use_headless: 'false',
    disable_password_filling: 'false',
    clear_cache_after_closing: 'false',
    enable_password_saving: 'false',
    launch_args: '',
    task_timeout: 0,
    delay_exec: 0,
});

// Fields and limits match the RPA Plus setting form. Partial updates must not
// acquire defaults, which would overwrite settings the caller did not supply.
export const rpaSettingsObjectSchema = z.object({
    exceptHandle: z.enum(['skip', 'interrupt']).optional().describe('Error handling: skip continues after an error; interrupt stops the process. Defaults to skip.'),
    close_browser: z.enum(['auto', 'manual']).optional().describe('Browser closure after completion: auto closes automatically; manual keeps the browser open. Defaults to auto.'),
    save_tab: z.enum(['0', '1']).optional().describe('Tabs after completion: string 0 clears tabs; string 1 preserves them. Defaults to 0.'),
    use_headless: z.enum(['true', 'false']).optional().describe('Use a browser without a graphical interface. String true or false; defaults to false.'),
    disable_password_filling: z.enum(['true', 'false']).optional().describe('Disable autofill of saved accounts and passwords. String true or false; defaults to false.'),
    clear_cache_after_closing: z.enum(['true', 'false']).optional().describe('Clear browser cache when closing. String true or false; defaults to false.'),
    enable_password_saving: z.enum(['true', 'false']).optional().describe('Allow the browser to save login passwords. String true or false; defaults to false.'),
    launch_args: z.string().max(300).optional().describe('Browser launch arguments, one per line, up to 300 characters. Defaults to an empty string.'),
    task_timeout: z.number().int().min(0).max(864000).optional().describe('Task timeout in whole seconds, from 0 to 864000. Defaults to 0 (no timeout).'),
    delay_exec: z.number().int().min(0).max(1440).optional().describe('Execution delay in whole minutes, from 0 to 1440. Defaults to 0 (no delay).'),
}).strict();

/** Complete process settings; see rpaSettingsObjectSchema for field meanings, values and limits. */
export type RpaSettings = Required<z.infer<typeof rpaSettingsObjectSchema>>;
/** Partial process settings accepted by the API; updates do not acquire defaults. */
export type RpaSettingsInput = z.input<typeof rpaSettingsObjectSchema>;

export const rpaSettingsJsonSchema = z.string().superRefine((value, ctx) => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        ctx.addIssue({ code: 'custom', message: 'setting must be a valid JSON string.' });
        return;
    }
    const result = rpaSettingsObjectSchema.safeParse(parsed);
    if (!result.success) {
        for (const issue of result.error.issues) {
            ctx.addIssue({ code: 'custom', message: `setting.${issue.path.join('.')}: ${issue.message}` });
        }
    }
}).describe('Process settings encoded as JSON. Allowed fields: exceptHandle (skip/interrupt), close_browser (auto/manual), save_tab (string 0/1), use_headless/disable_password_filling/clear_cache_after_closing/enable_password_saving (string true/false), launch_args (up to 300 characters), task_timeout (integer seconds, 0-864000), delay_exec (integer minutes, 0-1440). Unknown fields are rejected.');

export const rpaCreateSettingsJsonSchema = rpaSettingsJsonSchema
    .default(JSON.stringify(DEFAULT_RPA_SETTINGS))
    .describe(`${rpaSettingsJsonSchema.description} Omit setting on creation to use the complete default configuration; explicitly supplied settings are not filled with defaults.`);
