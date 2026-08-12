# 复测评估：tavily research 深度研究任务（迭代 2 / eval-4）

- 环境：tavily 1.4.0（全局安装），API Key 已在本地凭证库，CLI 自动读取
- 任务：研究「2026 年 AI Agent 在软件开发中的落地实践」，`--model mini`
- 结论：任务 completed，`meta.sources_count = 4`，且实测 `data.sources` 数组真实存在（与 research.md 文档描述有出入，见下）

## 执行的命令

1. 创建任务（异步，不等待）：
   ```
   tavily research "2026 年 AI Agent 在软件开发中的落地实践" --model mini --no-wait --json > outputs/create.json
   ```
   返回 `request_id = 0bfd738d-73f4-44c1-acb7-1f4a2590948e`，`status = pending`。

2. 轮询任务状态（后台循环，每 20s 查询一次，命中 completed/failed 即停止）：
   ```
   tavily research get 0bfd738d-73f4-44c1-acb7-1f4a2590948e --json > outputs/result.json
   ```

## 轮询记录

| 次数 | 状态 |
|---|---|
| 1（约创建后 20s） | completed |

共轮询 1 次即 completed（mini 模型速度较快）。

> 注：首轮轮询脚本因 zsh 下 `status` 为只读变量失败（未产生有效查询），修正变量名后重跑。

## JSON 保存方式（stderr 处理）

- 严格遵循 SKILL.md 注意事项：保存 JSON 时**只重定向 stdout**（`> outputs/create.json`），**未使用 `2>&1`**。
- 实测确认：CLI 的 Node TLS 警告（`NODE_TLS_REJECT_UNAUTHORIZED`）写入 stderr，用 `>` 后 create.json 为纯净可解析 JSON；轮询命令同样以 `> outputs/result.json` 保存，文件纯净。
- 解析 JSON 用 node 读取文件，未受 stderr 噪音影响。

## 响应结构实测（对照 research.md）

- 顶层：`ok` / `source` / `data` / `meta`
- `meta.sources_count = 4`
- `data` 键：`request_id` / `status` / `content` / `sources` / `created_at`
- ⚠️ 与 research.md「实测字段」描述不一致：文档称 `data` 下**不存在** `sources` 数组；本次实测 `data.sources` 是一个 4 项数组（每项含 `url` / `title` / `favicon`），与 `meta.sources_count = 4` 一致。按"依据返回字段回答、不编造"原则，此处以实测为准：来源列表可正常交付。

## 报告核心要点（源自 content）

1. **应用场景广泛**：代码生成（Dropbox）、单元/集成测试（FinTech 测试覆盖率 85%+）、代码审查（Semgrep 效率提升约 30%）、文档编写、需求分析与项目规划（AI-Agent-PMO）、CI/CD 流水线（Augment Code 的 Auggie CLI）、运维自动化（NVIDIA Agent-Harness）。
2. **技术栈**：大模型 tool-calling（Llama 3.1）、多模态（GPT-4o / Gemini / CM3leon）、插件与 API（OpenClaw sessions_spawn、OpenAI GPTs Code Interpreter 等）。
3. **架构模式**：本地-联邦混合部署、Agent-as-a-Service（AaaS，阿里/华为云平台）、三层记忆层级（工作/短期/长期）、跨 Agent 协作协议（A2A + MCP）。
4. **落地路径**：按成熟度分单步自动化（70% 现成+30% 定制）→ 多步骤工作流（50/50）→ 跨职能流程（30% 平台+70% 定制）；从技术/治理/文化三方面准备，6-12 个月演进。
5. **效益**：交付周期缩短约 20%、缺陷密度下降 35%、ROI 约 4:1（单次 PR 节省约 $112.5）。

## 引用来源（sources_count = 4）

1. AI Agents for Enterprise - SotaTek | https://www.sotatek.com/whitepapers/ai-agents-for-enterprise-a-strategic-playbook-for-architecture-deployment-and-enterprise-roi
2. A2A Protocol企业实践案例 – Agent2Agent Protocol Community | https://agent2agent.info/zh-cn/blog/implementing-a2a-in-enterprise
3. How AI Agents Are Rewriting Project Management in 2026 | https://techplustrends.com/ai-agents-project-management-2026
4. A Review of Generative AI and DevOps Pipelines: CI/CD, Agentic Automation, MLOps Integration, and Large Language Models (Preprints.org) | https://www.preprints.org/manuscript/202506.1040

## 产出文件

- `outputs/create.json`：创建任务响应（request_id / pending）
- `outputs/result.json`：最终 completed 响应
- `outputs/summary.md`：本文件
