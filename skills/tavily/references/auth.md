# auth command reference

> ⚠️ **Security red line: never hardcode the API key into code or chat logs.**
> Once a key appears in code, conversations, screenshots, or files committed to Git, consider it leaked — revoke and recreate it at the [Tavily dashboard](https://app.tavily.com) immediately.

## auth login

Reads the API key from the `TAVILY_API_KEY` environment variable and saves it to `~/.tavily-cli/credentials/tavily.json` (readable by the current user only).

```bash
TAVILY_API_KEY=tvly-xxxx tavily auth login --json
```

> Prefer storing the key in a system environment variable (macOS/Linux: `~/.zshrc`; Windows: System Properties → Environment Variables). WorkBuddy users can configure env vars in Settings (restart to take effect). Use `auth login` only when the CLI needs standalone persistence.

## auth logout

Clears the locally saved API key.

```bash
tavily auth logout --json
```

## auth status

Checks the current credential configuration; returns the credential source and type.

```bash
tavily auth status --json
```
