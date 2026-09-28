---
sidebar_position: 1
---

# CLI

Installing `@loushy/build-ai-agent` also installs the `loushy` command. A separate `create-loushy-agent` package scaffolds a new project.

## Scaffolding a project: `create-loushy-agent`

```bash
npx create-loushy-agent --name=my-agent --provider=openai --yes
```

This writes a ready-to-build project: `package.json`, `tsconfig.json`, `src/agent.ts` calling `createAgent()`, and a `.env.example` naming your provider's credential variable.

## `loushy dev <spec.yaml|spec.json>`

Runs a local dev server for an [`AgentSpec`](../concepts/declarative-specs) file:

```bash
npx loushy dev agent.yaml
npx loushy dev agent.yaml --port=4000 --host=0.0.0.0
```

| Flag      | Default       | Description                                          |
| ---------- | -------------- | ------------------------------------------------------ |
| `--port`  | `3737`        | Port to listen on.                                    |
| `--host`  | `127.0.0.1`   | Bind address - localhost only by default. Pass e.g. `--host=0.0.0.0` to opt in to LAN access. |

The server exposes:

- `GET /` - a chat UI
- `GET /health` - health check
- `POST /chat` - `{ "message": "..." }` in, the agent's `ExecutionResult` out (1MB body limit)

It **reloads the agent whenever the spec file changes**, and keeps the last good config if an edit is invalid - so a typo in `agent.yaml` doesn't take the dev server down.

## `loushy build --target=<target> --agent=<spec> [--out=<dir>]`

Builds a deployable artifact for one target platform. See [Deployment](./deployment) for what each target produces and requires (`tsup` must be installed as a dev dependency: `npm install --save-dev tsup`).

```bash
npx loushy build --target=node-server --agent=agent.yaml
npx loushy build --target=docker --agent=agent.yaml --out=./dist/docker
npx loushy build --target=cloudflare-worker --agent=agent.yaml
```

| Flag       | Default                          | Description                              |
| ----------- | ---------------------------------- | ------------------------------------------- |
| `--target` | *(required)*                      | `node-server`, `docker`, or `cloudflare-worker`. |
| `--agent`  | *(required)*                      | Path to the `AgentSpec` file.             |
| `--out`    | `.loushy/build/<target>`         | Output directory.                         |

## Custom deploy targets

Targets are `DeploymentAdapter` objects (`scaffold`, `build`, `describe`) registered by name with `registerAdapter()`, both exported from the package root - see [`api/overview`](../api/overview).

## Next Steps

- [Declarative Specs](../concepts/declarative-specs) - the spec file format `loushy dev`/`loushy build` consume
- [Deployment](./deployment) - each build target in depth
