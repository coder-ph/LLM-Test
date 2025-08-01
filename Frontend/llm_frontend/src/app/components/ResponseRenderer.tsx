import React from 'react';
import Markdown from 'react-markdown';

interface ResponseRendererProps {
  content: string;
}

const ResponseRenderer = ({ content }: ResponseRendererProps) => {
  return (
    <Markdown
      components={{
        li: ({ children, ...props }) => (
          <li className="mb-2 list-disc" {...props}>
            {children}
          </li>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc pl-5" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal pl-5" {...props}>
            {children}
          </ol>
        ),
        p: ({ children, ...props }) => (
          <p className="mb-4" {...props}>
            {children}
          </p>
        ),
      }}
    >
      {content}
    </Markdown>
  );
};

export default ResponseRenderer;