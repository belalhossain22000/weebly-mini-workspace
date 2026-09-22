"use client";

import { useRef } from "react";

interface LineNumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LineNumberedTextarea({
  value,
  onChange,
}: LineNumberedTextareaProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = value.split("\n").length;

  function handleScroll() {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
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
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        className="flex-1 resize-none overflow-auto bg-transparent px-3 py-4 font-mono text-body-sm text-gray-800 outline-none dark:text-gray-200"
      />
    </div>
  );
}
