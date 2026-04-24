# Group Management

**create-group** — Create a browser group.

- **group_name** (required): Name of the group to create.
- **remark** (optional): Remark of the group.

**update-group** — Update the browser group.

- **group_id** (required): Numeric string. Id of the group to update; use get-group-list to get list.
- **group_name** (required): New name of the group.
- **remark** (optional, nullable): New remark; set null to clear.

**get-group-list** — Get the list of groups.

- **group_name** (optional): Name to search (like search).
- **page_size** (optional): Page size, max 100, default 10.
- **page** (optional): Default 1.
