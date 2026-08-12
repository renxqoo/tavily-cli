/**
 * Tavily Search 命令
 *
 * 封装 POST /search 接口，支持全文搜索、新闻搜索和金融搜索。
 */

import {
  defineCommandFromArgs,
  defineCommands,
  errs,
  printTable,
  type TableColumn,
} from "@renxqoo/agent-data-cli";
import type { SearchResponse, SearchResult } from "../types.js";

export const searchCommands = defineCommands({
  search: defineCommandFromArgs({
    name: "search",
    description: "使用 Tavily AI 搜索网络内容",
    args: {
      query: {
        type: "string",
        required: true,
        positional: true,
        desc: "搜索查询词",
      },
      search_depth: {
        type: "string",
        default: "basic",
        desc: "搜索深度: basic(1 credit) | advanced(2 credits) | fast | ultra-fast",
      },
      max_results: {
        type: "number",
        default: 5,
        desc: "返回结果数量上限 (0-20)",
      },
      topic: {
        type: "string",
        default: "general",
        desc: "搜索类别: general | news | finance",
      },
      time_range: {
        type: "string",
        desc: "时间范围: day | week | month | year",
      },
      start_date: {
        type: "string",
        desc: "起始日期 (YYYY-MM-DD)",
      },
      end_date: {
        type: "string",
        desc: "截止日期 (YYYY-MM-DD)",
      },
      include_answer: {
        type: "boolean",
        default: false,
        desc: "是否包含 AI 生成的回答",
      },
      include_raw_content: {
        type: "boolean",
        default: false,
        desc: "是否包含原始网页内容 (markdown 格式)",
      },
      include_images: {
        type: "boolean",
        default: false,
        desc: "是否包含相关图片",
      },
      include_domains: {
        type: "array",
        desc: "仅包含的域名列表 (最多 300 个)",
      },
      exclude_domains: {
        type: "array",
        desc: "排除的域名列表 (最多 150 个)",
      },
      country: {
        type: "string",
        desc: "优先展示指定国家的内容 (仅 topic=general 时有效)",
      },
    },

    async run(args, ctx) {
      // 参数验证
      const validDepths = ["basic", "advanced", "fast", "ultra-fast"];
      if (!validDepths.includes(args.search_depth)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--search-depth",
          message: `--search-depth 必须为 ${validDepths.join(" / ")} 之一`,
        });
      }

      const validTopics = ["general", "news", "finance"];
      if (!validTopics.includes(args.topic)) {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--topic",
          message: `--topic 必须为 ${validTopics.join(" / ")} 之一`,
        });
      }

      if (args.max_results < 0 || args.max_results > 20) {
        throw new errs.ValidationError({
          subtype: "out_of_range",
          param: "--max-results",
          message: "--max-results 必须在 0-20 之间",
        });
      }

      if (args.time_range) {
        const validRanges = ["day", "week", "month", "year", "d", "w", "m", "y"];
        if (!validRanges.includes(args.time_range)) {
          throw new errs.ValidationError({
            subtype: "invalid_argument",
            param: "--time-range",
            message: `--time-range 必须为 ${validRanges.join(" / ")} 之一`,
          });
        }
      }

      if (args.country && args.topic !== "general") {
        throw new errs.ValidationError({
          subtype: "invalid_argument",
          param: "--country",
          message: "--country 仅在 topic=general 时有效",
          hint: "移除 --country 或将 --topic 设为 general",
        });
      }

      const res = await ctx.post<SearchResponse>("/search", {
        query: args.query,
        search_depth: args.search_depth,
        max_results: args.max_results,
        topic: args.topic,
        ...(args.time_range ? { time_range: args.time_range } : {}),
        ...(args.start_date ? { start_date: args.start_date } : {}),
        ...(args.end_date ? { end_date: args.end_date } : {}),
        include_answer: args.include_answer,
        include_raw_content: args.include_raw_content,
        include_images: args.include_images,
        ...(args.include_domains?.length ? { include_domains: args.include_domains } : {}),
        ...(args.exclude_domains?.length ? { exclude_domains: args.exclude_domains } : {}),
        ...(args.country ? { country: args.country } : {}),
      });

      const results = res.data.results ?? [];
      const hasAnswer = Boolean(res.data.answer);

      return {
        data: {
          query: res.data.query,
          ...(hasAnswer ? { answer: res.data.answer } : {}),
          results: results.map((r: SearchResult) => ({
            title: r.title,
            url: r.url,
            content: r.content,
            ...(r.score !== undefined ? { score: r.score } : {}),
            ...(args.include_raw_content && r.raw_content ? { raw_content: r.raw_content } : {}),
          })),
          ...(res.data.images?.length ? { images: res.data.images } : {}),
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
        query: string;
        answer?: string;
        results: SearchResult[];
      };
      const lines: string[] = [];

      lines.push(`搜索: ${d.query}`);
      lines.push("");

      if (d.answer) {
        lines.push("AI 回答:");
        lines.push(d.answer);
        lines.push("");
      }

      if (d.results.length > 0) {
        const columns: TableColumn<SearchResult>[] = [
          { header: "标题", value: (r: SearchResult) => r.title },
          { header: "URL", value: (r: SearchResult) => r.url },
          {
            header: "相关度",
            value: (r: SearchResult) => (r.score !== undefined ? r.score.toFixed(2) : "-"),
            align: "right",
          },
        ];
        lines.push(printTable(d.results, columns));
      } else {
        lines.push("(无搜索结果)");
      }

      return lines.join("\n");
    },
  }),
});
