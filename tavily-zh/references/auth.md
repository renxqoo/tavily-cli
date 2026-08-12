# auth 命令详解

> ⚠️ **安全红线：绝对不要将 API Key 硬编码到代码或聊天记录中。**
> Key 一旦出现在代码、对话、截图或提交到 Git 的文件中，即视为已泄露，应立即到 [Tavily 控制台](https://app.tavily.com) 吊销重建。

## auth login

从环境变量 `TAVILY_API_KEY` 读取 API Key 并保存到本地文件 `~/.tavily-cli/credentials/tavily.json`（仅当前用户可读）。

```bash
TAVILY_API_KEY=tvly-xxxx tavily auth login --json
```

> Key 优先存系统环境变量（macOS/Linux 写入 `~/.zshrc`，Windows 系统属性→环境变量），WorkBuddy 可在设置页配置环境变量，修改后需重启生效；`auth login` 仅在需要 CLI 独立持久化时使用。

## auth logout

清除本地保存的 API Key。

```bash
tavily auth logout --json
```

## auth status

检查当前凭证配置状态，返回凭证来源和类型。

```bash
tavily auth status --json
```
