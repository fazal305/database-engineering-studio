# Database Engineering Studio

A browser-based database workspace for designing schemas visually,
running real SQL against them, visualizing how joins actually connect
rows, building queries visually while seeing the exact SQL they
generate, and learning normalization step by step.

## Live Links

- GitHub Repository: [fazal305/database-engineering-studio](https://github.com/fazal305/database-engineering-studio)
- Live Demo: [https://fazal305.github.io/database-engineering-studio/](https://fazal305.github.io/database-engineering-studio/)

## Overview

Database Engineering Studio is a multi-page frontend developer tool built for learning and demonstrating core database engineering concepts inside the browser. It combines schema design, SQL execution, relational visualization, visual query building, and normalization practice into one connected localStorage-powered workspace.

The project is intentionally honest about its scope: it does not connect to a real database server. Instead, it includes a real JavaScript SQL tokenizer, parser, and interpreter for a defined SQL subset that runs against browser-stored tables.

## Modules

- Dashboard
- Database Schema Designer
- SQL Playground
- Relational Database Visualizer
- Query Builder 2.0
- Normalization Studio
- Settings

## Features

- Multi-page browser application
- Sticky sidebar navigation
- Smooth page transitions with loader fallback
- Dynamic theme system using CSS custom properties
- Shared localStorage workspace state
- Visual schema designer with tables, columns, primary keys, and foreign keys
- ER diagram rendering from real schema relationships
- SQL export using real `CREATE TABLE` statements
- SQL import for reasonably simple `CREATE TABLE` scripts
- SQL Playground with real parsing and execution for a defined subset
- Query history with one-click rerun
- Visual join animation using real table rows
- Query Builder that generates runnable SQL
- Saved visual queries
- Normalization Studio with 1NF, 2NF, and 3NF transformations
- Workspace JSON export and import
- Demo data reset
- Responsive developer-tool UI

## Technologies Used

- HTML5
- CSS3 dynamic custom properties
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- SVG (ER diagrams, join visualizer)
- LocalStorage
- Blob API
- Clipboard API

## Learning Outcomes

- Designing multi-page frontend architecture without build tools
- Managing shared application state through localStorage
- Creating dynamic UI from configuration and state
- Building an ER diagram from real schema metadata
- Implementing a scoped SQL tokenizer, parser, and interpreter
- Generating SQL from visual form controls
- Visualizing relational joins using actual row matching
- Understanding normalization through functional dependencies
- Creating dynamic theme systems with CSS variables
- Building a professional portfolio-grade developer tool

## Architecture Notes

Database Engineering Studio uses a no-build, multi-page frontend architecture. Each module has its own HTML page, page-specific CSS file, and page-specific JavaScript file. Shared helpers, configuration, localStorage state, SQL parsing/execution helpers, theme logic, ER rendering, normalization helpers, and page transitions live in `js/shared.js`.

The Schema Designer, SQL Playground, Relational Visualizer, and Query Builder all read from and write to the same shared database state model in localStorage. This means a table created in the Schema Designer is immediately available in the SQL Playground, the Relational Visualizer, and Query Builder 2.0.

The CSS architecture uses one global `styles.css` file for shared layout, tokens, sidebar, cards, buttons, tables, overlays, and common UI patterns. Each page also has its own CSS file for module-specific layouts. Colors and major design values are controlled through CSS variables written at runtime from `workspace.theme`.

The transition system is handled globally through `js/shared.js`. Every page receives a full-screen overlay, smooth fade behavior, internal-link interception, transition timing from settings, and a loader fallback when navigation takes longer than the configured delay.

The SQL Playground is intentionally scoped. It is not a real database engine and does not connect to a database server. It includes a real in-browser tokenizer, parser, and JavaScript interpreter for a defined SQL subset, including basic `SELECT`, `JOIN`, `WHERE`, `ORDER BY`, `LIMIT`, `INSERT`, `UPDATE`, and `DELETE`.

The ER diagram and join animation are rendered from live schema and row data, not canned examples. Foreign-key relationships are stored in the shared workspace and used by both the Schema Designer and Relational Visualizer.

The Normalization Studio uses manually declared functional dependencies. It does not pretend to automatically discover all dependencies from arbitrary data, because that requires domain knowledge and is not reliably solvable from sample rows alone. Instead, the user declares dependencies and the studio uses those rules to demonstrate 1NF, 2NF, and 3NF decomposition.

## Folder Structure

```text
database-engineering-studio/
  index.html
  schema-designer.html
  sql-playground.html
  relational-visualizer.html
  query-builder.html
  normalization-studio.html
  settings.html

  styles.css

  css/
    dashboard.css
    schema-designer.css
    sql-playground.css
    relational-visualizer.css
    query-builder.css
    normalization-studio.css
    settings.css

  js/
    shared.js
    dashboard.js
    schema-designer.js
    sql-playground.js
    relational-visualizer.js
    query-builder.js
    normalization-studio.js
    settings.js

  README.md
  LICENSE
  .gitignore
```
How To Run Locally
git clone https://github.com/fazal305/database-engineering-studio.git
cd database-engineering-studio

Then open:

index.html

You can also use the VS Code Live Server extension for a smoother local development experience.

Sample Workflow
Open the Schema Designer.
Create a few related tables such as customers, orders, and products.
Add columns, primary keys, and foreign keys.
Export the schema as SQL.
Re-import the SQL to rebuild the schema.
Open the SQL Playground.
Run a query such as:
SELECT customers.name, orders.status
FROM customers
INNER JOIN orders
ON customers.id = orders.customer_id
ORDER BY customers.name ASC
Open Query Builder 2.0.
Build the same query visually and compare the generated SQL.
Open the Relational Visualizer.
Watch a join animate row by row.
Open the Normalization Studio.
Load a messy sample table and run it through 1NF, 2NF, and 3NF.
Open Settings and customize the theme, transitions, and workspace data.

Future Improvements
Full SQL subset coverage including subqueries, more join types, and aggregate functions
Automatic functional-dependency suggestion from sample data
Multi-schema workspaces
Query performance and index-aware execution stats
Shareable read-only schema links
Undo and redo across all modules
License

MIT License