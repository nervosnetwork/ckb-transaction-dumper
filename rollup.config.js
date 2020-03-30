import executable from "rollup-plugin-executable";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import builtins from "builtin-modules";

module.exports = [
  {
    input: "cli.js",
    output: {
      file: "cli-dist.js",
      format: "cjs",
      sourcemap: false,
      banner: "#!/usr/bin/env node"
    },
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      terser(),
      executable()
    ],
    external: builtins
  }
];
