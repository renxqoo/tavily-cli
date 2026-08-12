import { defineConfig } from "tsup";

/**
 * tsup (esbuild) 最小化打包配置：
 * - 全量 bundle：把 @renxqoo/agent-data-cli 及其依赖全部打进单文件
 *   （dependencies 因此可为空，安装时不拉依赖树）
 * - minify + treeshake：压缩并剔除未使用代码
 * - 单文件 CLI：splitting 关闭，输出仅 dist/index.js（含 shebang）
 * - 不产出 .d.ts / sourcemap：CLI 无需类型声明，进一步缩小体积
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  bundle: true,
  splitting: false,
  minify: true,
  treeshake: true,
  clean: true,
  dts: false,
  sourcemap: false,
  outDir: "dist",
});
