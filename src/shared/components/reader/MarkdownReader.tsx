import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownReader({ content }: { content: string }) {
  return <article className="reader-markdown">
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
      a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
      input: (props) => <input {...props} disabled />,
    }}>{content}</ReactMarkdown>
  </article>;
}
