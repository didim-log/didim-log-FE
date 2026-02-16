# Template Customization Backend Checklist

## Goal
Fix cases where user custom templates are saved but not reliably applied in retrospective writing.

## 1) Render API: move to POST body (required)
Current FE now calls POST first and falls back to GET for backward compatibility.

- Preferred endpoint: `POST /templates/{templateId}/render`
- Request body:
```json
{
  "problemId": 1000,
  "programmingLanguage": "KOTLIN",
  "code": "...user code..."
}
```
- Response body:
```json
{
  "renderedContent": "...rendered markdown..."
}
```

### Why
- GET query with long `code` can fail due to URL length / encoding.
- POST body is stable for long source code and special characters.

## 2) Default template consistency (required)
When user sets a default template for SUCCESS/FAIL, the `summaries` response must reflect it immediately.

- `GET /templates/summaries` must always return up-to-date:
  - `isDefaultSuccess`
  - `isDefaultFail`
- After:
  - `PUT /templates/{id}/default?category=SUCCESS|FAIL`
  - template create/update/delete

## 3) Render must preserve template author intent (required)
Render output should not force unexpected structure.

- Do not overwrite user-authored title if template already contains heading.
- Do not remove custom body sections.
- If code/meta default blocks are missing, append minimally (idempotent behavior).

## 4) Fallback selection should be metadata-based, not title-string-based
If no explicit default template exists:

- Use system template fallback by explicit type (`type=SYSTEM`), not by title keywords like "simple/detail/요약/상세".

## 5) Recommended backend verification queries/tests

### API tests
1. Create custom template with multi-line body.
2. Edit and re-fetch template: body must remain unchanged.
3. Set as SUCCESS default and fetch `/templates/summaries`: flag must be true.
4. Render with 5k+ code chars: POST render must succeed.
5. Render output should include original custom sections without dropping body.

### Data checks
- Ensure only one `isDefaultSuccess=true` per user.
- Ensure only one `isDefaultFail=true` per user.
- Ensure create/update/delete transactions update default references atomically.

## 6) FE compatibility note
FE now uses POST-only render:
- POST `/templates/{id}/render`

Backend must provide this endpoint in all environments (local/staging/prod).
