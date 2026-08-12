/**
 * Tavily Map 命令
 *
 * 封装 POST /map 接口，像图一样遍历网站，发现并返回站点内所有 URL。
 * 只发现 URL，不提取内容（提取请用 extract 或 crawl）。
 */

import {
  defineCommandFromArgs,
  defineCommands,
  errs,
} from "@renxqoo/agent-data-cli";
import type { MapResponse } from "../types.js";

export const mapCommands = defineCommands({
  map: defineCommandFromArgs({
    name: "map",
    description: "生成站点 URL 地图（发现链接，不提取内容）",
    args: {
      url: {
        type: "string",
        required: true,
        positional: true,
        desc: "映射的根 URL，如 https://docs.tavily.com",
      },
      instructions: {
        type: "string",
        desc: "爬虫的自然语言指令（启用后费用翻倍）",
      },
      max_depth: {
        type: "number",
        default: 1,
        desc: "最大映射深度 (1-5)",
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
        desc: "仅选择匹配正则路径的 URL，如 /docs/.*",
      },
      select_domains: {
        type: "array",
        desc: "仅选择匹配正则的域名/子域名",
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
        desc: "是否在最终结果中包含外部域名链接",
      },
      timeout: {
        type: "number",
        desc: "映射超时时间 (秒, 10-150)",
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
      if (args.timeout !== undefined) {
        if (args.timeout < 10 || args.timeout > 150) {
          throw new errs.ValidationError({
            subtype: "out_of_range",
            param: "--timeout",
            message: "--timeout 必须在 10-150 秒之间",
          });
        }
      }

      ctx.log.info(`映射: ${args.url}`);

      const res = await ctx.post<MapResponse>("/map", {
        url: args.url,
        ...(args.instructions ? { instructions: args.instructions } : {}),
        max_depth: args.max_depth,
        max_breadth: args.max_breadth,
        limit: args.limit,
        ...(args.select_paths?.length ? { select_paths: args.select_paths } : {}),
        ...(args.select_domains?.length
          ? { select_domains: args.select_domains }
          : {}),
        ...(args.exclude_paths?.length
          ? { exclude_paths: args.exclude_paths }
          : {}),
        ...(args.exclude_domains?.length
          ? { exclude_domains: args.exclude_domains }
          : {}),
        allow_external: args.allow_external,
        ...(args.timeout ? { timeout: args.timeout } : {}),
        include_usage: args.include_usage,
      });

      const urls = res.data.results ?? [];

      return {
        data: {
          base_url: res.data.base_url,
          results: urls,
          response_time: res.data.response_time,
          ...(res.data.request_id ? { request_id: res.data.request_id } : {}),
        },
        meta: {
          count: urls.length,
          ...(res.data.usage ? { credits: res.data.usage.credits } : {}),
        },
      };
    },

    humanFormat(data) {
      const d = data as {
        base_url: string;
        results: string[];
      };
      const lines: string[] = [];

      lines.push(`站点地图: ${d.base_url}`);
      lines.push("");

      if (d.results.length > 0) {
        d.results.forEach((u, i) => {
          lines.push(`${String(i + 1).padStart(3)}. ${u}`);
        });
      } else {
        lines.push("(未发现任何 URL)");
      }

      return lines.join("\n");
    },
  }),
});
