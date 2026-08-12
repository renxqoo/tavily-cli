# Tavily Skill 评估执行报告

## 任务
搜索 Rust 异步编程（async/await）入门教程，找出相关性最高的 3 个页面，然后提取第 1 个页面的完整正文（markdown）。

## 执行过程

### 1. search 阶段
命令：
```bash
tavily search "Rust async/await programming tutorial" --max_results 3 --json
```
参数：`--max_results 3`（限定 3 条）、`--json`（结构化输出）。未指定 `--search_depth`，使用默认 `basic`（1 credit）。

结果：`ok: true`，返回 3 条结果，按 score 降序：

| # | 标题 | URL | score |
|---|------|-----|-------|
| 1 | Tutorial on using async / await in Rust - The Rust Programming Language Forum | https://users.rust-lang.org/t/tutorial-on-using-async-await-in-rust/76246 | 0.8773 |
| 2 | Introduction - Asynchronous Programming in Rust | https://rust-lang.github.io/async-book | 0.8525 |
| 3 | Fundamentals of Asynchronous Programming: Async, Await, Futures, and Streams | https://doc.rust-lang.org/book/ch17-00-async-await.html | 0.8273 |

### 2. extract 阶段
取第 1 条 URL 执行：
```bash
tavily extract "https://users.rust-lang.org/t/tutorial-on-using-async-await-in-rust/76246" --format markdown --json
```
参数：`--format markdown`、`--json`。未指定 `--extract_depth`，使用默认 `basic`。

结果：`ok: true`，`results` 含 1 条成功记录，`failed_results` 为空，`response_time: 0.01s`。

- title: Tutorial on using async / await in Rust
- url: https://users.rust-lang.org/t/tutorial-on-using-async-await-in-rust/76246
- raw_content 长度: 2151 字符（markdown）

## 提取结果摘要
提取到的 markdown 正文为 Rust 论坛的一个帖子页面。主要内容：
- 作者分享学习 Rust async/await 的心得，指向其外部教程链接 `https://developerlife.com/2022/03/12/rust-tokio/`（讲解用 Tokio 编写并发/并行代码，以异步 middleware runner 为教学示例，涵盖 async trait objects）。
- 页面底部为 Discourse 自动生成的「Related topics」表格，列出 5 个相关帖子（如 async Redux 库、async/await 开源项目、Reqwest 性能、Tokio 多线程聊天服务器等）。
- 末尾为 Discourse 页脚。

注：该页面本身是论坛引介帖，核心教程内容在外链（developerlife.com）上。extract 忠实提取了该 URL 的可见正文，未做外链跟随。

## 保存路径
- search.json: `/Users/wrr/work/tavily-cli/tavily-workspace/iteration-1/eval-2-search-extract/with_skill/outputs/search.json`
- extract.json: `/Users/wrr/work/tavily-cli/tavily-workspace/iteration-1/eval-2-search-extract/with_skill/outputs/extract.json`
- summary.md: `/Users/wrr/work/tavily-cli/tavily-workspace/iteration-1/eval-2-search-extract/with_skill/outputs/summary.md`

## 结论
两步均成功。search 返回 3 条按相关性排序的结果；extract 成功提取第 1 条 URL 的 markdown 正文（2151 字符），无失败项。
