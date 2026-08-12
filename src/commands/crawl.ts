/**
 * Tavily Crawl 命令
 *
 * 封装 POST /crawl 接口，基于图遍历并行爬取站点并提取内容。
 * 同步模式: 发起请求后保持连接直到爬取完成（最长 timeout 秒）。
 */

import {
  defineCommandFromArgs,
  defineCommands,
  errs,
  printTable,
  type TableColumn,
} from "@renxqoo/agent-data-cli";
import type { CrawlResponse, CrawlResult } from "../types.js";

export const crawlCommands = defineCommands({
  crawl: defineCommandFromArgs({
    name: "crawl",
    description: "爬取站点并提取多个页面的内容（图遍历）",
    args: {
      url: {
        type: "string",
        required: true,
        positional: true,
        desc: "爬取的根 URL，如 https://docs.tavily.com",
      },
      instructions: {
        type: "string",
        desc: "爬虫的自然语言指令（启用后费用翻倍）",
      },
      max_depth: {
        type: "number",
        default: 1,
        desc: "最大爬取深度 (1-5)",
      },
      max_breadth: {
        type: "number",
        default: 20,
        desc: "每层最多跟随的链接数 (1-500)",
      },
      limit: {
        type: "number",
        default: 50,
        desc: "停止前处理的总链接数上限",
      },
      select_paths: {
        type: "array",
        desc: "仅爬取匹配正则路径的 URL，如 /docs/.*",
      },
      select_domains: {
        type: "array",
        desc: "仅爬取匹配正则的域名/子域名",
      },
      exclude_paths: {
        type: "array",
        desc: "排除匹配正则路径的 URL，如 /private/.*",
      },
      exclude_domains: {
        type: "array",
        desc: "排除匹配正则的域名/子域名",
      },
      allow_external: {
        type: "boolean",
        default: true,
        desc: "是否在结果中包含外部域名链接",
      },
      include_images: {
        type: "boolean",
        default: false,
        desc: "是否在爬取结果中包含图片",
      },
      extract_depth: {
        type: "string",
        default: "basic",
        desc: "提取深度: basic | advanced",
      },
      format: {
        type: "string",
        default: "markdown",
        desc: "内容格式: markdown | text",
      },
      include_favicon: {
        type: "boolean",
        default: false,
        desc: "是否为每个结果包含 favicon",
      },
      timeout: {
        type: "number",
        desc: "爬取超时时间 (秒, 10-150)",
      },
      include_usage: {
        type: "boolean",
        default: false,
        desc: "是否在响应中包含 credit 用量",
      },
    },

    async run(args, ctx) {
      // 参数验证
      if (args.max_depth < 1 || args.max_depth > 5) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--max-depth",
          message: "--max-depth 必须在 1-5 之间",
        });
      }
      if (args.max_breadth < 1 || args.max_breadth > 500) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--max-breadth",
          message: "--max-breadth 必须在 1-500 之间",
        });
      }
      if (args.limit < 1) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--limit",
          message: "--limit 必须 >= 1",
        });
      }
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
        if (args.timeout < 10 || args.timeout > 150) {
          throw new errs.ValidationError({
            subtype: "out_of_range",
            param: "--timeout",
            message: "--timeout 必须在 10-150 秒之间",
          });
        }
      }

      ctx.log.info(`爬取: ${args.url}`);

      const res = await ctx.post<CrawlResponse>("/crawl", {
        url: args.url,
        ...(args.instructions ? { instructions: args.instructions } : {}),
        max_depth: args.max_depth,
        max_breadth: args.max_breadth,
        limit: args.limit,
        ...(args.select_paths?.length ? { select_paths: args.select_paths } : {}),
        ...(args.select_domains?.length ? { select_domains: args.select_domains } : {}),
        ...(args.exclude_paths?.length ? { exclude_paths: args.exclude_paths } : {}),
        ...(args.exclude_domains?.length ? { exclude_domains: args.exclude_domains } : {}),
        allow_external: args.allow_external,
        include_images: args.include_images,
        extract_depth: args.extract_depth,
        format: args.format,
        include_favicon: args.include_favicon,
        ...(args.timeout ? { timeout: args.timeout } : {}),
        include_usage: args.include_usage,
      });

      const results = res.data.results ?? [];

      return {
        data: {
          base_url: res.data.base_url,
          results: results.map((r: CrawlResult) => ({
            url: r.url,
            raw_content: r.raw_content,
            ...(r.favicon ? { favicon: r.favicon } : {}),
            ...(r.images?.length ? { images: r.images } : {}),
          })),
          response_time: res.data.response_time,
          ...(res.data.request_id ? { request_id: res.data.request_id } : {}),
        },
        meta: {
          count: results.length,
          ...(res.data.usage ? { credits: res.data.usage.credits } : {}),
        },
      };
    },

    humanFormat(data) {
      const d = data as {
        base_url: string;
        results: CrawlResult[];
      };
      const lines: string[] = [];

      lines.push(`爬取: ${d.base_url}`);
      lines.push("");

      if (d.results.length > 0) {
        const columns: TableColumn<CrawlResult>[] = [
          { header: "URL", value: (r: CrawlResult) => r.url },
          {
            header: "内容长度",
            value: (r: CrawlResult) => `${(r.raw_content?.length ?? 0).toLocaleString()} 字符`,
            align: "right",
          },
        ];
        lines.push(printTable(d.results, columns));
      } else {
        lines.push("(无爬取结果)");
      }

      return lines.join("\n");
    },
  }),
});
