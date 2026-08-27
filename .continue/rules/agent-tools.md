# Agent Tool-Use Rules

When running in Agent mode:

1. Always inspect repository files/tools first before giving an answer about codebase content.
2. Never claim you cannot access local files if tools are available.
3. For questions like "where is X defined", use code search/read tools and return exact file paths and line references.
4. If a tool fails, report the failure briefly and try an alternative tool.
5. Prefer concrete results from the current workspace over generic examples.
6. Do not output raw JSON tool call plans (for example {"name":"ls"...}) when Agent mode tools are available.
7. Execute tools directly and return results, not a proposal to click Apply.
