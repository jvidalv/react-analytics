import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json" with { type: "json" };

// Get all peerDeps as externals, plus optional React Native/Expo packages
const external = [
  ...Object.keys(packageJson.peerDependencies),
  "react-native",
  "expo-router",
  "expo-device",
  "expo-application",
  "expo-constants",
  "@react-native-async-storage/async-storage",
  "react-router-dom",
  "next",
  "next/router",
  "next/navigation",
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        banner: "'use client';",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        banner: "'use client';",
      },
    ],
    external,
    plugins: [
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json", jsx: "react-jsx" }),
      babel({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        babelHelpers: "bundled",
        presets: [
          "@babel/preset-react",
          ["@babel/preset-typescript", { allowDeclareFields: true }],
        ],
      }),
    ],
  },
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
