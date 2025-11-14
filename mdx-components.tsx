import type { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/mdx/code-blocks";
import Steps from "@/components/mdx/steps";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock {...props} />,
    Steps: Steps,
  };
}
