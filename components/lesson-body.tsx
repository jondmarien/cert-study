import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx-components";

export function LessonBody({ source }: { source: string }) {
  return (
    <div className="study-prose">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          blockJS: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
}
