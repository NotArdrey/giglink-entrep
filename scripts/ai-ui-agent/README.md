# AI UI Redesign Agent

This folder wires the requested flow:

```text
AI Agent
-> MCP bridge
-> Stitch
-> generated UI patch/files
-> guarded apply or merge
-> Playwright smoke verification
```

## Commands

Run the orchestrator directly:

```bash
npm run ai:stitch:redesign -- --prompt "Redesign the landing page for a cleaner marketplace feel" --apply
```

Expose it to an MCP-capable agent:

```bash
npm run ai:stitch:mcp
```

Run only the automatic redesign smoke test:

```bash
npm run test:e2e:ai-redesign
```

## Stitch connection options

The orchestrator accepts Stitch output in any of these forms:

- `STITCH_API_URL` plus optional `STITCH_API_KEY`
- `STITCH_COMMAND`, a local command that reads the prompt from stdin and writes JSON to stdout
- `STITCH_OUTPUT_PATH`, a local JSON file exported by Stitch
- `--source-file path/to/stitch-output.json`

Expected Stitch JSON:

```json
{
  "summary": "Short explanation of the redesign",
  "files": [
    {
      "path": "src/features/landing/pages/LandingPage.jsx",
      "content": "..."
    }
  ]
}
```

It can also return a unified diff:

```json
{
  "summary": "Short explanation of the redesign",
  "patch": "diff --git ..."
}
```

## Guarded auto-merge

Use `--auto-merge` only from a clean git worktree. The script creates a temporary branch, applies the Stitch result, runs `npm run build` and the Playwright redesign smoke test, commits the generated change, then fast-forwards the original branch.

```bash
npm run ai:stitch:redesign -- --prompt-file prompts/landing-redesign.md --auto-merge
```

Add `--full-suite` when Supabase demo credentials and test data are ready:

```bash
npm run ai:stitch:redesign -- --prompt-file prompts/landing-redesign.md --auto-merge --full-suite
```
