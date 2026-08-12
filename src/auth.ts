/**
 * Tavily API Key 鉴权插件
 *
 * Tavily 使用简单的 API Key (Bearer token)，无 OAuth 流程。
 * 本插件基于框架的 provider chain 实现:
 *   - 环境变量 TAVILY_API_KEY (envProvider, priority 5)
 *   - 环境变量 TAVILY_BEARER_TOKEN (envBearerProvider, priority 6)
 *   - 文件凭证 ~/.tavily-cli/credentials/tavily.json (fileProvider, priority 10)
 *
 * 通过 `tavily auth login` 可将环境变量中的 API Key 持久化到本地文件。
 */

import {
  type Plugin,
  type CommandContext,
  type ProviderContext,
  fileStore,
  defaultProviders,
  getAuthSession,
  resolveWithChain,
  setAuthSession,
  injectAuthHeader,
  defineCommand,
  defineCommands,
  errs,
} from "@renxqoo/agent-data-cli";
import { homedir } from "node:os";
import { join } from "node:path";

const NAMESPACE = "tavily";
const STORE_DIR = join(homedir(), ".tavily-cli");

interface AuthStatusData {
  authenticated: boolean;
  source: string | null;
  type: string | null;
}

export function createTavilyAuth(): Plugin {
  const store = fileStore({ dir: STORE_DIR });
  const providers = defaultProviders();
  const authStyle = "bearer" as const;

  const authCommands = defineCommands({
    login: defineCommand({
      name: "login",
      description: "从环境变量 TAVILY_API_KEY 保存 API Key 到本地",
      async run() {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
          throw new errs.ConfigError({
            subtype: "unbound_env",
            message: "缺少 TAVILY_API_KEY 环境变量",
            hint: "在当前终端设置 TAVILY_API_KEY=tvly-xxxx 后重试，或直接使用该环境变量运行命令（无需 login）",
          });
        }
        await store.saveCredentials(NAMESPACE, { apiKey });
        return { data: { saved: true } };
      },
    }),

    logout: defineCommand({
      name: "logout",
      description: "清除本地保存的 Tavily API Key",
      async run() {
        await store.clearCredentials(NAMESPACE);
        return { data: { cleared: true } };
      },
    }),

    status: defineCommand<Record<string, never>, AuthStatusData>({
      name: "status",
      description: "检查当前凭证配置状态",
      async run() {
        const pctx: ProviderContext = {
          namespace: NAMESPACE,
          configStore: store,
          args: {},
          env: process.env,
        };
        const resolved = await resolveWithChain(providers, pctx);
        if (!resolved) {
          return {
            data: {
              authenticated: false,
              source: null,
              type: null,
            },
            meta: {
              hint: "设置 TAVILY_API_KEY 环境变量，或运行 `tavily auth login` 保存到本地",
            },
          };
        }
        return {
          data: {
            authenticated: true,
            source: resolved.token.source,
            type: resolved.token.type,
          },
        };
      },
    }),
  });

  return {
    name: `auth:${NAMESPACE}`,
    enforce: "pre",
    provides: {
      namespaces: {
        auth: authCommands,
      },
    },

    async beforeCommand(ctx: CommandContext) {
      const pctx: ProviderContext = {
        namespace: NAMESPACE,
        configStore: store,
        args: {},
        env: process.env,
      };
      const resolved = await resolveWithChain(providers, pctx);
      if (!resolved) {
        throw new errs.AuthenticationError({
          subtype: "no_credentials",
          message: "Tavily API Key 未配置",
          hint: "设置 TAVILY_API_KEY 环境变量，或运行 `tavily auth login` 保存到本地",
        });
      }

      // 包装 store 成 ctx.credentials (业务命令运行时可用)
      (ctx as { credentials: typeof ctx.credentials }).credentials = {
        get: async (ns) => (await store.loadCredentials(ns)) as Record<string, string> | null,
        save: (ns, d) => store.saveCredentials(ns, d),
        clear: (ns) => store.clearCredentials(ns),
      };

      setAuthSession(ctx, {
        token: resolved.token.token,
        type: resolved.token.type,
        source: resolved.token.source,
        refreshable: false,
      });
    },

    async beforeRequest(ctx, req) {
      const session = getAuthSession(ctx);
      if (session) {
        injectAuthHeader(req, session.token, authStyle);
      }
    },
  };
}
