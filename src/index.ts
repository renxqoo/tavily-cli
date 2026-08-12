#!/usr/bin/env node
/**
 * Tavily CLI — AI Agent 原生的搜索与内容提取工具
 *
 * 封装 Tavily AI API，提供结构化输出供 AI agent 直接消费。
 *
 * 用法:
 *   tavily search "量子计算最新进展" --json
 *   tavily extract https://example.com --json
 *
 * 鉴权:
 *   设置 TAVILY_API_KEY 环境变量，或运行 `tavily auth login` 保存到本地。
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { defineCli, runInstallWizard } from "@renxqoo/agent-data-cli";
import { createTavilyAuth } from "./auth.js";
import { searchCommands } from "./commands/search.js";
import { extractCommands } from "./commands/extract.js";
import { crawlCommands } from "./commands/crawl.js";
import { mapCommands } from "./commands/map.js";
import { researchCommands, researchNamespaces } from "./commands/research.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 返回发布包内 skills 目录的绝对路径（基于 import.meta.url，全局安装后仍可解析） */
function resolveSkillsDir(): string {
  return join(__dirname, "../skills");
}

/** 判断当前模块是否作为 CLI 主入口直接运行（而非被其他模块 import） */
function isMainEntry(): boolean {
  return realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
}

const auth = createTavilyAuth();

const app = defineCli({
  name: "tavily",
  binName: "tavily",
  description: "Tavily AI 搜索与内容提取 CLI",
  baseUrl: "https://api.tavily.com",
  plugins: [auth],
  commands: {
    ...searchCommands,
    ...extractCommands,
    ...crawlCommands,
    ...mapCommands,
    ...researchCommands,
  },
  namespaces: {
    research: {
      ...researchNamespaces,
    },
  },
  errorOnStatus: {
    403: "forbidden",
    404: "not_found",
    429: "rate_limited",
    "5xx": "server_error",
  },
  defaultFormat: "auto",
  skillsDir: resolveSkillsDir(),
});

if (isMainEntry()) {
  const argv = process.argv.slice(2);
  if (argv[0] === "install") {
    process.exitCode = await runInstallWizard({
      skillsSource: process.env.TAVILY_SKILLS_SOURCE,
    });
  } else {
    await app.run(argv);
  }
}

export default app;
