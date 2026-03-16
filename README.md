# SQL Playground

An interactive browser SQL learning app, now with a **SQL Server practice mode** in `/sandbox`.

This is a learning simulator, not a real SQL Server engine. User-entered SQL Server (T-SQL) is transpiled internally and executed in-browser.

## Features

- **Interactive SQL Lessons**: Step-by-step tutorials covering SQL basics to more advanced topics
- **Live SQL Editor**: Execute queries and see results immediately
- **Built-in Database**: Practice with a pre-populated e-commerce database
- **Instant Feedback**: Get helpful error messages and validation for your queries
- **Progress Tracking**: Your progress is saved automatically to local storage
- **Zero Backend Required**: Everything runs client-side using SQL.js
- **SQL Server (T-SQL) Practice Lab**: SQL Server-style practice workflow with compatibility feedback
- **Dark Mode Toggle**: Theme switch in the top navigation with local persistence
- **Keyboard-First Command Palette**: `Ctrl/Cmd+K` global command menu with nested pages and quick navigation

## Technology Stack

- **Frontend**: React, Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **SQL Engine**: SQL.js (SQLite compiled to WebAssembly)
- **State Management**: React hooks with local storage persistence

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HenryGetz/BuddySQLServer.git
   cd BuddySQLServer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. Open [http://localhost:3000/sandbox](http://localhost:3000/sandbox) for SQL Server practice mode.

## SQL Server Practice Mode (MVP)

### Internal execution flow

1. Learner writes SQL Server (T-SQL) in the sandbox editor.
2. App transpiles it with Polyglot (SQL Server (T-SQL) -> SQLite).
3. App executes transpiled SQL in SQL.js (browser/WASM).
4. Learner sees only SQL Server practice-oriented UX and feedback.

Normal UI does not show transpiled SQL. For local debugging only, set:

`localStorage.setItem("sql-playground-debug-transpiled-sql", "true")`

### Dark mode

- Toggle is in the header (`moon/sun` button).
- Persisted to `localStorage` key `sql-playground-theme`.
- Uses class-based theme switching (`dark` on `<html>`).
- Sandbox editor, cards, buttons, tables, results, and error/compatibility panels are readable in both themes.

### Keyboard shortcuts

- `Ctrl/Cmd+K`: Open/close the global command palette
- `g` then `i`: Jump directly to `/sandbox` (when not typing in a form field)
- In any SQL Server (T-SQL) editor box:
`Ctrl/Cmd+Enter` or `F5` runs the current SQL Server (T-SQL) statement

The command palette includes:

- nested command pages (`Go to ->`, `Settings ->`)
- `Backspace` to return to previous palette page when search is empty
- focus trapping and focus restore on close
- `aria-live` polite announcements for command result counts while searching

### Compatibility feedback

Sandbox statements return one of:

- `success`: statement executed in practice mode.
- `caveat`: executed but SQL Server-specific behavior may differ.
- `failed`: transpilation or execution failed in this practice environment.

Learner-facing messages avoid SQLite implementation jargon.

### Quick practice examples in sandbox

- `TOP + ORDER BY`
- `SELECT + WHERE`
- `JOIN + aliases`
- `GROUP BY`
- `CREATE TABLE`
- `INSERT INTO`
- `Query created table`

## Supported vs unsupported (current)

### Commonly working patterns

- Basic `SELECT`, `WHERE`, `ORDER BY`
- `JOIN`
- `GROUP BY` and simple aggregates
- `TOP` in many query cases
- Basic `CREATE TABLE` / `INSERT`

### Commonly failing patterns

- Procedural SQL Server (T-SQL) (`DECLARE`, variables, control flow)
- SQL Server administrative/procedural constructs (`EXEC`, stored proc flows)
- More advanced SQL Server-specific syntax not mapped by current transpiler/runtime

## Local browser validation done for this MVP

- App and sandbox load successfully.
- Main sandbox UI renders (schema panel, quick examples, editor, result area).
- Editor accepts SQL Server (T-SQL) input and runs through existing flow.
- Working scenarios confirmed in browser: `TOP`, `SELECT+WHERE`, `JOIN`, `GROUP BY`, `CREATE TABLE`, `INSERT`, follow-up `SELECT`.
- Failure scenarios confirmed in browser with readable messaging: variable/procedural and unsupported proc calls.
- Theme toggle verified in browser for both light and dark modes.
- Dark mode persistence verified via `localStorage` and page reload.
- No fatal runtime console errors were observed during these manual flows.

## Project Structure

- `/app`: Next.js app directory structure with pages and layouts
- `/components`: React components organized by purpose
- `/hooks`: Custom React hooks including SQL.js integration
- `/lib`: Utility functions, database initialization, and lesson content
- `/types`: TypeScript type definitions
- `/public`: Static assets

## Key Components

- **SqlEditor**: Interactive SQL editor with query execution and feedback
- **LessonContent**: Markdown-rendered lesson content with code highlighting
- **useSqlJs**: Custom hook to initialize and interact with SQL.js
- **lessons.ts**: Content and structure of all SQL lessons

## Database Schema

The application includes a sample e-commerce database with the following tables:

- **Customers**: customer information
- **Products**: product catalog
- **Orders**: order information
- **Order_Items**: individual items within orders

## Available Lessons

1. Introduction to SQL
2. SELECT Basics
3. Filtering with WHERE
4. Sorting Results
5. Aggregate Functions
6. Grouping Data
7. Basic JOINs

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [SQL.js](https://github.com/sql-js/sql.js/) - SQLite compiled to WebAssembly
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
