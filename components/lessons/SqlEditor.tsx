"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { QueryResult } from "@/types/database";
import { ResultTable } from "./ResultTable";
import { gradeQuery, GradeOptions, GradeResult } from "@/lib/queryGrader";
import QueryFeedback from "./QueryFeedback";

interface SqlEditorProps {
  initialQuery: string | undefined;
  onExecuteQuery: (sql: string) => QueryResult;
  onSaveProgress?: (completed: boolean, query: string) => void;
  expectedQuery?: string;
  gradeOptions?: GradeOptions;
  disableFeedback?: boolean;
  children?: React.ReactNode;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  initialQuery,
  onExecuteQuery,
  onSaveProgress,
  expectedQuery,
  gradeOptions = {},
  disableFeedback = false,
  children,
}) => {
  const [query, setQuery] = useState(initialQuery || "");
  const [queryResult, setQueryResult] = useState<QueryResult>({
    results: null,
    error: null,
  });
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  const isRunShortcut = (key: string, ctrlKey: boolean, metaKey: boolean) =>
    ((ctrlKey || metaKey) && key === "Enter") || key === "F5";

  const executeQuery = useCallback(() => {
    setIsLoading(true);

    try {
      const result = onExecuteQuery(query);
      setQueryResult(result);

      // Only grade the query if feedback is not disabled
      if (!disableFeedback) {
        // Grade the query using our grading system
        const options: GradeOptions = {
          ...gradeOptions,
          expectedQuery: expectedQuery || gradeOptions.expectedQuery,
        };

        const grade = gradeQuery(
          query,
          result.results,
          !!result.error,
          options,
        );
        setGradeResult(grade);

        // Update progress if callback is provided
        if (onSaveProgress) {
          onSaveProgress(grade.isCorrect, query);
        }
      } else {
        // Reset grade result if feedback is disabled
        setGradeResult(null);
      }
    } catch (err) {
      console.error("Error executing query:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    disableFeedback,
    expectedQuery,
    gradeOptions,
    onExecuteQuery,
    onSaveProgress,
    query,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isRunShortcut(e.key, e.ctrlKey, e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (!isRunShortcut(event.key, event.ctrlKey, event.metaKey)) {
        return;
      }

      const activeElement = document.activeElement;
      if (!editorRef.current?.contains(activeElement)) {
        return;
      }

      event.preventDefault();
      executeQuery();
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, [executeQuery]);

  return (
    <div
      ref={editorRef}
      className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 bg-gray-50 border-b">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type your SQL Server (T-SQL) query here..."
        />
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={executeQuery}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Running..." : "Run SQL Server (T-SQL) code"}
          </button>
          <span className="text-sm text-gray-600">
            Shortcut: Ctrl/Cmd+Enter or F5
          </span>
        </div>
      </div>

      {children}

      <div className="p-4">
        {/* Display query feedback only if not disabled */}
        {!disableFeedback && gradeResult && (
          <QueryFeedback gradeResult={gradeResult} />
        )}

        {queryResult.error ? (
          <div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
            <p className="font-semibold">Execution message</p>
            <p className="font-mono text-sm">{queryResult.error.message}</p>
          </div>
        ) : queryResult.results && queryResult.results.length > 0 ? (
          <div className="mt-4">
            {queryResult.executionTime && (
              <div className="mb-2 text-sm text-gray-600">
                Query executed in {queryResult.executionTime}ms
              </div>
            )}
            <ResultTable results={queryResult.results[0]} />
          </div>
        ) : (
          <div className="mt-4 p-4 text-gray-600 text-center border border-dashed border-gray-300 rounded-md">
            {queryResult.results
              ? "Query executed successfully but returned no results."
              : "Run a SQL Server (T-SQL) statement to see results."}
          </div>
        )}
      </div>
    </div>
  );
};
