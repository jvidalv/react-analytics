/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {Array<((config: NextConfig) => NextConfig)>} NextConfigPlugins
 */
import createMDX from "@next/mdx";

/** @type {NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Next.js 16: Turbopack is now the default bundler for dev and build
  // Image optimization settings (Next.js 16 defaults to quality: [75] only)
  images: {
    // Explicitly configure quality levels if you need more than the default
    qualities: [50, 75, 100],
  },
};

const withMDX = createMDX({
  // Simplified MDX config for Turbopack compatibility
  // rehype-pretty-code has serialization issues with Turbopack
});

export default withMDX(nextConfig);
