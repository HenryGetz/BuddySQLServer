"use client";

import { useState, useEffect, useRef } from "react";
import { CompatibilityFeedback, QueryResult } from "@/types/database";
import {
  loadPracticeTranspiler,
  transpileTsqlToPracticeSql,
} from "@/lib/practiceTranspiler";

function toPracticeExecutionMessage(rawMessage: string): string {
  if (/no such table/i.test(rawMessage)) {
    return "This statement references a table that is not available in the practice database.";
  }

  if (/no such column/i.test(rawMessage)) {
    return "This statement references a column that does not exist in the current practice schema.";
  }

  if (/syntax error/i.test(rawMessage) || /near/i.test(rawMessage)) {
    return "This statement could not be executed here. Try simplifying SQL Server-specific syntax.";
  }

  return "This statement could not be executed in the SQL Server practice environment.";
}

export function useSqlJs() {
  const [SQL, setSQL] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitializing.current) return;
    isInitializing.current = true;

    async function initializeSql() {
      try {
        await loadPracticeTranspiler();

        // Check if the sql.js script is already loaded
        if (!(window as any).initSqlJs) {
          // Create script element
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js";
          script.async = true;

          // Wait for the script to load
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Failed to load SQL.js script"));
            document.head.appendChild(script);
          });
        }

        // Initialize SQL.js
        const initSqlJs = (window as any).initSqlJs;
        const SQL = await initSqlJs({
          locateFile: (file: string) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
        });

        // Create a new database
        const db = new SQL.Database();

        setSQL(SQL);
        setDb(db);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize SQL.js:", err);
        setError("Failed to load SQL engine. Please refresh the page.");
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    }

    initializeSql();

    // Cleanup function
    return () => {
      if (db) {
        try {
          db.close();
        } catch (err) {
          console.error("Error closing database:", err);
        }
      }
    };
  }, []); // Empty dependency array to run only once

  const executeAgainstDb = (
    sql: string,
    compatibility?: CompatibilityFeedback,
    usePracticeErrors: boolean = false,
  ): QueryResult => {
    if (!db) {
      return { results: null, error: { message: "Database not initialized" } };
    }

    try {
      const start = performance.now();
      const results = db.exec(sql);
      const end = performance.now();

      return {
        results,
        error: null,
        executionTime: parseFloat((end - start).toFixed(2)),
        compatibility,
      };
    } catch (err: any) {
      const rawMessage =
        err?.message || "An error occurred while executing the query";

      if (usePracticeErrors) {
        return {
          results: null,
          error: {
            message: toPracticeExecutionMessage(rawMessage),
            code: err?.code,
          },
          compatibility: {
            status: "failed",
            message:
              "The statement was parsed, but execution failed in this SQL Server practice environment.",
            hints: [
              "Try reducing the statement to core query logic.",
              "Avoid advanced SQL Server procedural or administrative syntax.",
            ],
          },
        };
      }

      return {
        results: null,
        error: {
          message: rawMessage,
          code: err?.code,
        },
      };
    }
  };

  // Executes user-authored SQL Server (T-SQL) by transpiling to SQLite first.
  const executeQuery = (sql: string): QueryResult => {
    const transpiled = transpileTsqlToPracticeSql(sql);

    if (!transpiled.success || !transpiled.sqliteSql) {
      return {
        results: null,
        error: { message: transpiled.compatibility.message },
        compatibility: transpiled.compatibility,
      };
    }

    if (
      window.localStorage.getItem("sql-playground-debug-transpiled-sql") ===
      "true"
    ) {
      console.debug("[practice-transpile]", transpiled.sqliteSql);
    }

    return executeAgainstDb(
      transpiled.sqliteSql,
      transpiled.compatibility,
      true,
    );
  };

  // Internal helper for app queries that should stay SQLite-native.
  const executeRawQuery = (sql: string): QueryResult => executeAgainstDb(sql);

  // Function to initialize a database with sample data
  const initializeDatabase = (sqlStatements: string): boolean => {
    if (!db) return false;

    try {
      db.run(sqlStatements);
      return true;
    } catch (err) {
      console.error("Error initializing database with sample data:", err);
      return false;
    }
  };

  return {
    SQL,
    db,
    isLoading,
    error,
    executeQuery,
    executeRawQuery,
    initializeDatabase,
  };
}
