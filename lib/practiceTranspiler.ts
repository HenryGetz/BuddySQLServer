export type PracticeCompatibilityStatus = "success" | "caveat" | "failed";

export interface PracticeCompatibility {
  status: PracticeCompatibilityStatus;
  message: string;
  hints?: string[];
}

export interface PracticeTranspileOutcome {
  success: boolean;
  sqliteSql?: string;
  compatibility: PracticeCompatibility;
}

interface PolyglotModule {
  Dialect: {
    TSQL: string;
    SQLite: string;
  };
  transpile: (
    sql: string,
    read: string,
    write: string,
  ) => {
    success: boolean;
    sql?: string[];
  };
}

const POLYGLOT_CDN_URL =
  "https://cdn.jsdelivr.net/npm/@polyglot-sql/sdk@0.1.14/dist/cdn/polyglot.esm.js";

const unsupportedPattern =
  /\b(DECLARE|CURSOR|EXEC(?:UTE)?|RAISERROR|THROW|TRY|CATCH|MERGE|WHILE|GOTO|PROCEDURE|FUNCTION|TRIGGER)\b/i;

const caveatPattern =
  /\b(TOP\s+\d+|RIGHT\s+JOIN|FULL\s+JOIN|NVARCHAR|DATETIME|GETDATE\(\))\b/i;

let polyglotModule: PolyglotModule | null = null;
let polyglotLoadPromise: Promise<PolyglotModule> | null = null;

function normalizeTsqlInput(sql: string): string {
  // "GO" is a SQL Server batch separator, not SQL syntax.
  return sql.replace(/^\s*GO\s*$/gim, ";").trim();
}

function buildCompatibility(
  status: PracticeCompatibilityStatus,
  message: string,
  hints: string[] = [],
): PracticeCompatibility {
  return {
    status,
    message,
    ...(hints.length > 0 ? { hints } : {}),
  };
}

async function importPolyglotFromCdn(): Promise<PolyglotModule> {
  const loadedPolyglot = (await import(
    /* webpackIgnore: true */ POLYGLOT_CDN_URL
  )) as unknown as PolyglotModule;

  if (
    !loadedPolyglot?.transpile ||
    !loadedPolyglot?.Dialect?.TSQL ||
    !loadedPolyglot?.Dialect?.SQLite
  ) {
    throw new Error("Polyglot module loaded with an unexpected shape");
  }

  return loadedPolyglot;
}

export async function loadPracticeTranspiler(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (polyglotModule) {
    return;
  }

  if (!polyglotLoadPromise) {
    polyglotLoadPromise = importPolyglotFromCdn();
  }

  polyglotModule = await polyglotLoadPromise;
}

export function transpileTsqlToPracticeSql(
  sql: string,
): PracticeTranspileOutcome {
  const normalizedSql = normalizeTsqlInput(sql);

  if (!normalizedSql) {
    return {
      success: false,
      compatibility: buildCompatibility(
        "failed",
        "Enter a SQL Server (T-SQL) statement before running the query.",
      ),
    };
  }

  if (!polyglotModule) {
    return {
      success: false,
      compatibility: buildCompatibility(
        "failed",
        "The SQL Server practice engine is still loading. Please try again in a moment.",
      ),
    };
  }

  const containsLikelyUnsupportedSyntax =
    unsupportedPattern.test(normalizedSql);

  try {
    const result = polyglotModule.transpile(
      normalizedSql,
      polyglotModule.Dialect.TSQL,
      polyglotModule.Dialect.SQLite,
    );

    if (!result.success || !result.sql || result.sql.length === 0) {
      return {
        success: false,
        compatibility: buildCompatibility(
          "failed",
          "This SQL Server feature is not supported in this practice environment yet.",
          [
            "Try a simpler query-focused statement (SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY).",
            "Remove procedural SQL Server (T-SQL) syntax such as DECLARE, EXEC, or TRY-CATCH.",
          ],
        ),
      };
    }

    const sqliteSql = result.sql.join("\n").trim();
    const hasCaveat =
      containsLikelyUnsupportedSyntax || caveatPattern.test(normalizedSql);

    return {
      success: true,
      sqliteSql,
      compatibility: hasCaveat
        ? buildCompatibility(
            "caveat",
            "Executed in SQL Server practice mode.",
            [
              "Some advanced SQL Server features are not supported in this practice environment yet.",
              "If results look unexpected, simplify the statement or run it in smaller parts.",
            ],
          )
        : buildCompatibility(
            "success",
            "Executed in SQL Server practice mode.",
          ),
    };
  } catch {
    return {
      success: false,
      compatibility: buildCompatibility(
        "failed",
        "This statement could not be executed in the SQL Server practice environment.",
        [
          "Try simplifying the statement.",
          "Remove advanced procedural or administrative SQL Server syntax.",
        ],
      ),
    };
  }
}
