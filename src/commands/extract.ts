/**
 * Tavily Extract 命令
 *
 * 封装 POST /extract 接口，从指定 URL 提取网页内容。
 */

import {
  defineCommandFromArgs,
  defineCommands,
  errs,
  printTable,
  type TableColumn,
} from "@renxqoo/agent-data-cli";
import type { ExtractResponse, ExtractResult } from "../types.js";

export const extractCommands = defineCommands({
  extract: defineCommandFromArgs({
    name: "extract",
    description: "从指定 URL 提取网页内容",
    args: {
      urls: {
        type: "array",
        required: true,
        positional: true,
        desc: "要提取内容的 URL 列表",
      },
      query: {
        type: "string",
        desc: "用于重排提取内容的用户意图关键词",
      },
      extract_depth: {
        type: "string",
        default: "basic",
        desc: "提取深度: basic(1 credit/5 URL) | advanced(2 credits/5 URL)",
      },
      include_images: {
        type: "boolean",
        default: false,
        desc: "是否提取页面中的图片",
      },
      format: {
        type: "string",
        default: "markdown",
        desc: "内容格式: markdown | text",
      },
      timeout: {
        type: "number",
        desc: "提取超时时间 (秒, 1-60)",
      },
    },

    async run(args, ctx) {
      // 参数验证
      const validDepths = ["basic", "advanced"];
      if (!validDepths.includes(args.extract_depth)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--extract-depth",
          message: `--extract-depth 必须为 ${validDepths.join(" / ")} 之一`,
        });
      }

      const validFormats = ["markdown", "text"];
      if (!validFormats.includes(args.format)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--format",
          message: `--format 必须为 ${validFormats.join(" / ")} 之一`,
        });
      }

      if (args.timeout !== undefined) {
        if (args.timeout < 1 || args.timeout > 60) {
          throw new errs.ValidationError({
            subtype: "out_of_range",
            param: "--timeout",
            message: "--timeout 必须在 1-60 秒之间",
          });
        }
      }

      if (args.urls.length === 0) {
        throw new errs.ValidationError({
          subtype: "missing_required",
          param: "urls",
          message: "至少需要一个 URL",
        });
      }

      ctx.log.info(`提取 ${args.urls.length} 个 URL 的内容`);

      const res = await ctx.post<ExtractResponse>("/extract", {
        urls: args.urls,
        ...(args.query ? { query: args.query } : {}),
        extract_depth: args.extract_depth,
        include_images: args.include_images,
        format: args.format,
        ...(args.timeout ? { timeout: args.timeout } : {}),
      });

      const results = res.data.results ?? [];
      const failed = res.data.failed_results ?? [];

      return {
        data: {
          results: results.map((r: ExtractResult) => ({
            title: r.title,
            url: r.url,
            raw_content: r.raw_content,
            ...(r.images?.length ? { images: r.images } : {}),
            ...(r.favicon ? { favicon: r.favicon } : {}),
          })),
          ...(failed.length > 0 ? { failed_results: failed } : {}),
          response_time: res.data.response_time,
          ...(res.data.request_id ? { request_id: res.data.request_id } : {}),
        },
        meta: {
          count: results.length,
          ...(failed.length > 0 ? { failed_count: failed.length } : {}),
          ...(res.data.usage ? { credits: res.data.usage.credits } : {}),
        },
      };
    },

    humanFormat(data) {
      const d = data as {
        results: ExtractResult[];
        failed_results?: { url: string; error?: string }[];
      };
      const lines: string[] = [];

      if (d.results.length > 0) {
        const columns: TableColumn<ExtractResult>[] = [
          { header: "标题", value: (r: ExtractResult) => r.title ?? "(无标题)" },
          { header: "URL", value: (r: ExtractResult) => r.url },
        ];
        lines.push(printTable(d.results, columns));
      } else {
        lines.push("(无提取结果)");
      }

      if (d.failed_results?.length) {
        lines.push("");
        lines.push("失败的 URL:");
        for (const f of d.failed_results) {
          lines.push(`  ${f.url} — ${f.error ?? "未知错误"}`);
        }
      }

      return lines.join("\n");
    },
  }),
});
