/**
 * CLI 冒烟测试
 *
 * 以子进程方式运行构建产物 dist/index.js，验证 CLI 入口、命令注册与
 * 内置 Skill 输出契约。不依赖 Tavily API Key（只覆盖无需鉴权的路径）。
 *
 * 依赖 dist/index.js：`npm test` 通过 `pretest` 脚本自动先构建。
 */

import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const CLI_ENTRY = "dist/index.js";

interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** 以子进程运行 CLI（强制 CI/非 TTY 模式，输出稳定）。 */
function run(args: string[]): RunResult {
  const res = spawnSync("node", [CLI_ENTRY, ...args], {
    encoding: "utf-8",
    env: { ...process.env, CI: "1", NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  return {
    status: res.status,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}

describe("CLI smoke", () => {
  it("--help lists all top-level commands", () => {
    const r = run(["--help"]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/Usage:/);
    for (const cmd of ["search", "extract", "crawl", "map", "research", "auth"]) {
      expect(r.stdout).toContain(cmd);
    }
  });

  it("--version prints a semver version", () => {
    const r = run(["--version"]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim()).toMatch(/^tavily\/\d+\.\d+\.\d+$/);
  });

  it("skills list --json returns the bundled tavily skill", () => {
    const r = run(["skills", "list", "--json"]);
    expect(r.status, r.stderr).toBe(0);
    const parsed = JSON.parse(r.stdout) as {
      ok: boolean;
      data: Array<{ name: string; description: string }>;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.data).toBeInstanceOf(Array);
    expect(parsed.data.length).toBeGreaterThan(0);
    const tavily = parsed.data.find((s) => s.name === "tavily");
    expect(tavily).toBeDefined();
    expect(tavily?.description.length).toBeGreaterThan(0);
  });
});
