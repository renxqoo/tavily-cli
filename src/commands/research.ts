/**
 * Tavily Research 命令
 *
 * 封装异步 Research API:
 *   POST /research           创建研究任务 → { request_id, status: pending }
 *   GET  /research/{id}      查询任务状态与最终报告
 *
 * 默认 `research <input>` 会自动轮询直到任务完成（可通过 --no-wait 仅创建任务）。
 * `research get <request_id>` 可查询已创建任务。
 */

import { defineCommandFromArgs, defineCommands, errs } from "@renxqoo/agent-data-cli";
import type { ResearchResult, ResearchSource, ResearchTask } from "../types.js";

const POLL_INTERVAL_MS = 3_000;

/** research 命令返回的数据结构（各分支统一） */
interface ResearchRunData {
  request_id: string;
  status: ResearchResult["status"];
  input?: string;
  model?: string;
  error?: string;
  content?: string | Record<string, unknown>;
  sources?: ResearchSource[];
  created_at?: string;
  completed_at?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCompletion(
  requestId: string,
  ctx: { get: <T>(path: string) => Promise<{ data: T }> },
  timeoutMs: number,
  log: { info: (msg: string) => void },
): Promise<ResearchResult> {
  const deadline = Date.now() + timeoutMs;
  let last: ResearchResult | null = null;

  while (Date.now() < deadline) {
    const res = await ctx.get<ResearchResult>(`/research/${requestId}`);
    last = res.data;

    if (res.data.status === "completed" || res.data.status === "failed") {
      return res.data;
    }
    log.info(`研究进行中: ${res.data.status}（继续轮询…）`);
    await sleep(POLL_INTERVAL_MS);
  }

  // 超时: 返回当前任务状态，提示用 `research get` 继续查询
  return {
    ...(last ?? ({} as ResearchTask)),
    request_id: requestId,
    status: (last?.status ?? "pending") as ResearchResult["status"],
  } as ResearchResult;
}

export const researchCommands = defineCommands({
  research: defineCommandFromArgs({
    name: "research",
    description: "发起深度研究任务并等待报告生成（异步）",
    args: {
      input: {
        type: "string",
        required: true,
        positional: true,
        desc: "研究任务或问题",
      },
      model: {
        type: "string",
        default: "auto",
        desc: "研究模型: mini(快速) | pro(全面) | auto(自动)",
      },
      citation_format: {
        type: "string",
        default: "numbered",
        desc: "引用格式: numbered | mla | apa | chicago",
      },
      output_length: {
        type: "string",
        desc: "报告长度: short | standard | long",
      },
      include_domains: {
        type: "array",
        desc: "优先使用的来源域名 (最多 20 个)",
      },
      exclude_domains: {
        type: "array",
        desc: "排除的来源域名 (最多 20 个)",
      },
      wait: {
        type: "boolean",
        default: true,
        desc: "是否自动轮询直到任务完成 (--no-wait 仅创建任务)",
      },
      wait_timeout: {
        type: "number",
        default: 300,
        desc: "最大等待秒数 (默认 300 秒)",
      },
    },

    async run(args, ctx) {
      // 参数验证
      const validModels = ["mini", "pro", "auto"];
      if (!validModels.includes(args.model)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--model",
          message: `--model 必须为 ${validModels.join(" / ")} 之一`,
        });
      }
      const validCitations = ["numbered", "mla", "apa", "chicago"];
      if (!validCitations.includes(args.citation_format)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--citation-format",
          message: `--citation-format 必须为 ${validCitations.join(" / ")} 之一`,
        });
      }
      if (args.output_length) {
        const validLengths = ["short", "standard", "long"];
        if (!validLengths.includes(args.output_length)) {
          throw new errs.ValidationError({
            subtype: "invalid_argument",
            param: "--output-length",
            message: `--output-length 必须为 ${validLengths.join(" / ")} 之一`,
          });
        }
      }
      if (args.include_domains && args.include_domains.length > 20) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--include-domains",
          message: "--include-domains 最多 20 个",
        });
      }
      if (args.exclude_domains && args.exclude_domains.length > 20) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--exclude-domains",
          message: "--exclude-domains 最多 20 个",
        });
      }

      const created = await ctx.post<ResearchTask>("/research", {
        input: args.input,
        model: args.model,
        citation_format: args.citation_format,
        ...(args.output_length ? { output_length: args.output_length } : {}),
        ...(args.include_domains?.length ? { include_domains: args.include_domains } : {}),
        ...(args.exclude_domains?.length ? { exclude_domains: args.exclude_domains } : {}),
      });

      if (!created.data.request_id) {
        throw new errs.APIError({
          subtype: "bad_response",
          message: "Research 任务创建失败：响应中缺少 request_id",
        });
      }

      if (!args.wait) {
        const data: ResearchRunData = {
          request_id: created.data.request_id,
          status: created.data.status,
          input: created.data.input,
          model: created.data.model,
          created_at: created.data.created_at,
        };
        return {
          data,
          meta: {
            hint: `任务已创建，运行 \`tavily research get ${created.data.request_id}\` 查询结果`,
          },
        };
      }

      ctx.log.info(`等待任务完成 (request_id: ${created.data.request_id})…`);

      const result = await waitForCompletion(
        created.data.request_id,
        ctx,
        args.wait_timeout * 1000,
        ctx.log,
      );

      if (result.status === "failed") {
        const data: ResearchRunData = {
          request_id: result.request_id,
          status: "failed",
          input: result.input ?? args.input,
          model: result.model,
          error: result.error ?? "未知错误",
          created_at: result.created_at,
        };
        return {
          data,
          meta: { hint: "研究任务失败，可尝试降低 --model 级别或简化问题" },
        };
      }

      if (result.status !== "completed") {
        // 超时未完成
        const data: ResearchRunData = {
          request_id: result.request_id,
          status: result.status,
          input: result.input ?? args.input,
          model: result.model,
          created_at: result.created_at,
        };
        return {
          data,
          meta: {
            hint: `等待超时，任务仍在进行。运行 \`tavily research get ${result.request_id}\` 稍后查询`,
          },
        };
      }

      const data: ResearchRunData = {
        request_id: result.request_id,
        input: result.input ?? args.input,
        status: result.status,
        model: result.model,
        content: result.content,
        ...(result.sources?.length ? { sources: result.sources } : {}),
        created_at: result.created_at,
        ...(result.completed_at ? { completed_at: result.completed_at } : {}),
      };
      return {
        data,
        meta: {
          sources_count: result.sources?.length ?? 0,
        },
      };
    },

    humanFormat(data) {
      const d = data as {
        request_id: string;
        input?: string;
        status: string;
        content?: string | Record<string, unknown>;
        sources?: ResearchSource[];
        error?: string;
        hint?: string;
      };
      const lines: string[] = [];

      lines.push(`研究任务: ${d.request_id} [${d.status}]`);
      lines.push("");

      if (d.status === "completed") {
        if (typeof d.content === "string") {
          lines.push(d.content);
        } else if (d.content && typeof d.content === "object") {
          lines.push(JSON.stringify(d.content, null, 2));
        }
        if (d.sources?.length) {
          lines.push("");
          lines.push(`来源 (${d.sources.length}):`);
          d.sources.forEach((s, i) => {
            lines.push(`  ${i + 1}. ${s.title} — ${s.url}`);
          });
        }
      } else if (d.status === "failed") {
        lines.push(`错误: ${d.error ?? "未知错误"}`);
      } else {
        lines.push(`状态: ${d.status}（任务仍在进行中）`);
      }

      return lines.join("\n");
    },
  }),
});

/**
 * `research get` 命名空间命令。
 * 框架规则: 嵌套命令须通过 namespaces 注册（route: [ns, cmd]），
 * 顶层 `research`（route 长度 1）与 `research get`（route 长度 2）可共存，
 * matchRoute 按 route 长度降序匹配，长 route 优先。
 */
export const researchNamespaces = defineCommands({
  get: defineCommandFromArgs({
    name: "get",
    description: "查询研究任务的状态与结果",
    args: {
      request_id: {
        type: "string",
        required: true,
        positional: true,
        desc: "研究任务的 request_id",
      },
    },

    async run(args, ctx) {
      const res = await ctx.get<ResearchResult>(`/research/${args.request_id}`);

      const d = res.data;
      return {
        data: {
          request_id: d.request_id,
          status: d.status,
          ...(d.input ? { input: d.input } : {}),
          ...(d.content !== undefined ? { content: d.content } : {}),
          ...(d.sources?.length ? { sources: d.sources } : {}),
          ...(d.error ? { error: d.error } : {}),
          created_at: d.created_at,
          ...(d.completed_at ? { completed_at: d.completed_at } : {}),
        },
        meta: {
          sources_count: d.sources?.length ?? 0,
          ...(d.status === "pending" || d.status === "in_progress"
            ? {
                hint: `任务仍在进行中，稍后再查询（request_id: ${d.request_id}）`,
              }
            : {}),
        },
      };
    },

    humanFormat(data) {
      const d = data as {
        request_id: string;
        status: string;
        input?: string;
        content?: string | Record<string, unknown>;
        sources?: ResearchSource[];
        error?: string;
      };
      const lines: string[] = [];

      lines.push(`研究任务: ${d.request_id} [${d.status}]`);
      if (d.input) lines.push(`问题: ${d.input}`);
      lines.push("");

      if (d.status === "completed") {
        if (typeof d.content === "string") {
          lines.push(d.content);
        } else if (d.content && typeof d.content === "object") {
          lines.push(JSON.stringify(d.content, null, 2));
        }
        if (d.sources?.length) {
          lines.push("");
          lines.push(`来源 (${d.sources.length}):`);
          d.sources.forEach((s, i) => {
            lines.push(`  ${i + 1}. ${s.title} — ${s.url}`);
          });
        }
      } else if (d.status === "failed") {
        lines.push(`错误: ${d.error ?? "未知错误"}`);
      } else {
        lines.push(`状态: ${d.status}（任务仍在进行中）`);
      }

      return lines.join("\n");
    },
  }),
});
