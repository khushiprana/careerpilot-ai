import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content, className = '' }) => {
  return (
    <div className={`text-slate-800 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 mt-4 mb-2 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mt-3.5 mb-2 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-cyan-900 mt-3 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 text-slate-800 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-2.5 pl-1 text-slate-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-2.5 pl-1 text-slate-800 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-cyan-600">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 bg-cyan-50/70 p-3 rounded-r-xl my-3 text-slate-800 text-xs font-medium italic shadow-sm">
              {children}
            </blockquote>
          ),
          code({ node, inline, className, children, ...props }: any) {
            if (inline) {
              return (
                <code
                  className="bg-slate-100 text-cyan-900 border border-slate-200 text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock text={String(children).replace(/\n$/, '')} />
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2.5 font-semibold text-slate-900">{children}</th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 border-t border-slate-200">{children}</td>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 bg-cyan-50/60 px-1 py-0.5 rounded">
              {children}
            </strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 hover:text-cyan-900 underline font-semibold transition-colors"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans font-semibold flex items-center gap-1 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="pr-12 whitespace-pre-wrap">{text}</pre>
    </div>
  );
};
