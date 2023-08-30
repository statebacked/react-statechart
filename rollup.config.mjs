import typescript from "@rollup/plugin-typescript";
import autoprefixer from "autoprefixer";
import postcss from "rollup-plugin-postcss";
import postcssSvg from "postcss-svg";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      dir: "dist/mjs",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    postcss({
      plugins: [autoprefixer(), postcssSvg()],
      sourceMap: true,
      extract: true,
      minimize: true,
    }),
  ],
};
