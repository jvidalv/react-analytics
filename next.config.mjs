/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {Array<((config: NextConfig) => NextConfig)>} NextConfigPlugins
 */
import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        /** @type {import('rehype-pretty-code').Options} */
        {
          theme: "github-dark",
          keepBackground: false,
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className = ["highlighted"];
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ["word-highlight"];
          },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
