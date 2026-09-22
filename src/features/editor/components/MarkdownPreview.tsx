"use client";

import React, { useRef } from "react";

interface MarkdownPreviewProps {
  content: string;
}

function renderStyledLine(line: string) {
  if (!line) {
    return <span>&nbsp;</span>;
  }

  if (/^#{1,6}\s/.test(line)) {
    return (
      <span className="font-bold text-primary-500 dark:text-info">
        {line}
      </span>
    );
  }

  const checkboxMatch = line.match(/^(\s*-\s*\[)([ xX])(\])(.*)/);
  if (checkboxMatch) {
    const isChecked = checkboxMatch[2].toLowerCase() === "x";
    return (
      <span>
        <span className="text-gray-400 dark:text-gray-500">{checkboxMatch[1]}</span>
        <span className={isChecked ? "font-bold text-primary-500 dark:text-info" : "text-gray-400 dark:text-gray-500"}>
          {checkboxMatch[2]}
        </span>
        <span className="text-gray-400 dark:text-gray-500">{checkboxMatch[3]}</span>
        <span className={isChecked ? "text-gray-700 dark:text-gray-300" : "text-gray-800 dark:text-gray-200"}>
          {renderInlineElements(checkboxMatch[4])}
        </span>
      </span>
    );
  }

  return renderInlineElements(line);
}

function renderInlineElements(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const elements: (string | React.ReactNode)[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(text.slice(lastIdx, match.index));
    }
    elements.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="text-primary-500 dark:text-info underline hover:text-primary-600 dark:hover:text-primary-100 cursor-pointer"
      >
        [{match[1]}]({match[2]})
      </a>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    elements.push(text.slice(lastIdx));
  }

  return elements.length > 0 ? elements : text;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const lines = content.length > 0 ? content.split("\n") : [""];
  const lineCount = lines.length;

  function handleScroll() {
    if (lineNumbersRef.current && contentRef.current) {
      lineNumbersRef.current.scrollTop = contentRef.current.scrollTop;
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-white dark:bg-gray-900">
      <div
        ref={lineNumbersRef}
        className="select-none overflow-hidden px-3 py-4 text-right font-mono text-body-sm text-gray-300 dark:text-gray-600"
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto bg-transparent px-3 py-4 font-mono text-body-sm text-gray-800 outline-none dark:text-gray-200 select-text"
      >
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre">
            {renderStyledLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}
