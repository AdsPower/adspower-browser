# Browser tag management

**get-tag-list** — Get the list of browser tags.

- **ids** (optional): Tag IDs to query, max 100 per request, e.g. `["tag1","tag2"]`.
- **limit** (optional): 1-200, default 50. Tags per page.
- **page** (optional): Default 1.

**create-tag** — Create browser tags (batch).

- **tags** (required): Array of tag configs. Each item:
  - **name** (required): Tag name, max 50 characters.
  - **color** (optional): `'darkBlue'` | `'blue'` | `'purple'` | `'red'` | `'yellow'` | `'orange'` | `'green'` | `'lightGreen'` (default darkBlue).

**update-tag** — Update browser tags (batch).

- **tags** (required): Array of tag configs. Each item:
  - **id** (required): Tag ID to update.
  - **name** (optional): Tag name, max 50 characters.
  - **color** (optional): Same enum as **create-tag**.

**delete-tag** — Delete browser tags.

- **ids** (required): Array of tag IDs to delete.
