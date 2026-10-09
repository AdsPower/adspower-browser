# Member Management

Team member APIs (`/api/v2/user/*`, `/api/v2/user-group/list`). These are members of the AdsPower team, not browser profiles.

**create-member** — Create a team member.

- **user_group_id** (required): Member group / role id. Use get-member-group-list to obtain it.
- **email** (required): Member email, max 70 characters.
- **password** (required): Login password in plaintext, 8 to 50 characters. The Local API hashes it before storing.
- **identity** (required): Role type: `2` admin, `3` manager, `4` staff.
- **name** (optional): Display name, max 50 characters.
- **manager** (optional): Direct manager `user_id`. Required by the backend when identity is `4`.
- **member** (optional): Direct subordinate `user_id` list, max 300. Used when identity is `2` or `3`.
- **authorized_group** (optional): Authorized browser group ids, max 1500. Empty array means no groups.
- **profile_limit** (optional): Profile quota for this member.
- **remark** (optional): Remark, max 100 characters.

**update-member** — Update an existing team member.

- **user_id** (required): Member to update.
- Optional fields match create-member (except password). Omit a field to leave it unchanged; send an empty string / empty array to clear it.
- **authorized_group**: omit to keep current groups. Empty array plus **group_update_type** `1` (default) replaces/clears; `2` appends/keeps.
- **group_update_type** (optional): `1` replace (default), `2` append.

**reset-member-password** — Reset a member password.

- **user_id** (required).
- **unbind_phone** (optional): `1` unbind, `0` keep. Default `0`.
- The new plaintext password is returned in the response as `new_password`. Do not send a new password as input.

**delete-member** — Delete a team member.

- **user_id** (required).

**get-member-list** — List or search team members.

- **user_group_id** (optional).
- **user_id** (optional): array, max 50.
- **email** (optional): array, max 50.
- **page** (optional): default 1, max 10000000.
- **limit** (optional): default 1, max 2000. Callers that omit `limit` only get 1 row.

**get-member-group-list** — List member groups / roles.

- **page** (optional): default 1, max 10000000.
- **limit** (optional): default 1, max 2000.
