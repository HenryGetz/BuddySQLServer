# Lesson Authoring

Each lesson lives in its own JSON file in this folder.

## File Naming

- Use `NNN-slug.json` where `NNN` matches the lesson `order`.
- Example: `010-ch7-7-join-on.json`

## Required Fields

- `id` (string)
- `slug` (string)
- `title` (string)
- `description` (string)
- `content` (markdown string)
- `deepDive` (markdown string)
- `order` (number)
- `category` (string)
- `initialQuery` (string)
- `challenge.description` (string)
- `challenge.success_message` (string)
- `challenge.validation_query` (string)

## Build Integration

- Run `npm run generate:lessons` to compile JSON lessons into `lib/generatedLessons.ts`.
- `npm run dev` and `npm run build` already run generation automatically.

