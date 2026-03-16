"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SqlEditor } from "@/components/lessons/SqlEditor";
import { initializeDatabase } from "@/lib/lessons";
import { useSqlJs } from "@/hooks/useSqlJs";
import Loading from "@/components/ui/loading";
import TableSchemaViewer from "@/components/sandbox/TableSchemaViewer";

const practiceExamples = [
  {
    id: "top-query",
    title: "TOP + ORDER BY",
    sql: "SELECT TOP 5 customer_id, first_name, last_name FROM Customers ORDER BY customer_id;",
  },
  {
    id: "where-order",
    title: "SELECT + WHERE",
    sql: "SELECT name AS ProductName, price FROM Products WHERE price > 100 ORDER BY price DESC;",
  },
  {
    id: "join",
    title: "JOIN + aliases",
    sql: "SELECT TOP 6 c.first_name AS FirstName, c.last_name AS LastName, o.order_id AS OrderId, o.total_amount AS OrderTotal FROM Customers c INNER JOIN Orders o ON c.customer_id = o.customer_id ORDER BY o.total_amount DESC;",
  },
  {
    id: "group-by",
    title: "GROUP BY",
    sql: "SELECT p.category AS Category, COUNT(*) AS ProductCount, AVG(p.price) AS AvgPrice FROM Products p GROUP BY p.category ORDER BY AvgPrice DESC;",
  },
  {
    id: "create-table",
    title: "CREATE TABLE",
    sql: "CREATE TABLE PracticeSales (SaleId INT PRIMARY KEY, CustomerName NVARCHAR(100), TotalAmount DECIMAL(10,2));",
  },
  {
    id: "insert",
    title: "INSERT INTO",
    sql: "INSERT INTO PracticeSales (SaleId, CustomerName, TotalAmount) VALUES (1, 'Ada Lovelace', 145.75), (2, 'Grace Hopper', 220.00), (3, 'Katherine Johnson', 89.50);",
  },
  {
    id: "select-created",
    title: "Query created table",
    sql: "SELECT TOP 2 SaleId, CustomerName, TotalAmount FROM PracticeSales WHERE TotalAmount >= 100 ORDER BY TotalAmount DESC;",
  },
];

export default function SandboxPage() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [selectedExampleId, setSelectedExampleId] = useState(
    practiceExamples[0].id,
  );

  const {
    isLoading,
    error,
    executeQuery,
    executeRawQuery,
    initializeDatabase: initDb,
    db,
  } = useSqlJs();

  const selectedExample =
    practiceExamples.find((example) => example.id === selectedExampleId) ||
    practiceExamples[0];

  useEffect(() => {
    if (db && !dbInitialized) {
      const sql = initializeDatabase();
      const success = initDb(sql);
      if (success) {
        setDbInitialized(true);
      }
    }
  }, [db, dbInitialized, initDb]);

  const handleExecuteQuery = (sql: string) => {
    const result = executeQuery(sql);
    return result;
  };

  if (isLoading) {
    return (
      <Loading
        title="Loading SQL engine..."
        subtitle="This may take a moment to initialize"
      />
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading SQL Engine
          </h3>
          <p className="text-red-700">{error}</p>
          <p className="mt-4 text-red-600">
            Try refreshing the page or check your console for more details.
          </p>
        </div>
      </div>
    );
  }

  if (!dbInitialized) {
    return <Loading title="Initializing database..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            SQL Server Practice Lab
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Write and run SQL Server (T-SQL) statements in a browser-based SQL
            Server practice environment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Practice Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <TableSchemaViewer executeQuery={executeRawQuery} />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>SQL Server (T-SQL) Quick Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Pick an example to load into the editor. These samples are
                  designed for SQL Server-style practice.
                </p>
                <div className="flex flex-wrap gap-2">
                  {practiceExamples.map((example) => (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => setSelectedExampleId(example.id)}
                      className={`px-3 py-1.5 text-sm rounded-md border cursor-pointer ${
                        selectedExampleId === example.id
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {example.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SQL Server (T-SQL) Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Run SQL Server-style queries and practice common SQL Server
                  (T-SQL) patterns.
                </p>
                <SqlEditor
                  initialQuery={selectedExample.sql}
                  onExecuteQuery={handleExecuteQuery}
                  disableFeedback={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
