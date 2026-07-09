const workspaceKey = "databaseEngineeringStudioWorkspace";

const defaultWorkspace = {
    brand: {
        name: "Database Engineering Studio",
        tagline:
            "Design schemas, run SQL, visualize joins, build queries, and learn normalization — all in the browser."
    },
    settings: {
        compactSidebar: false,
        transitionSpeedMs: 320,
        loaderDelayMs: 180,
        defaultPageSize: 25
    },
    theme: {
        bg: "#040712",
        bgSoft: "#07111f",
        card: "rgba(10, 18, 36, 0.9)",
        text: "#f7fbff",
        muted: "#9aabc7",
        primary: "#22d3ee",
        secondary: "#a855f7",
        success: "#4ade80",
        warning: "#facc15",
        danger: "#fb7185",
        radius: 18,
        fontFamily: "Inter, sans-serif"
    },
    database: {
        tables: [],
        relationships: []
    },
    sqlHistory: [],
    savedQueries: [],
    normalizationProjects: [],
    activityLog: []
};

const modulesConfig = [
    {
        id: "dashboard",
        title: "Dashboard",
        shortTitle: "Dashboard",
        icon: "⌘",
        page: "index.html",
        description: "Overview, workspace stats, activity, and quick actions."
    },
    {
        id: "schema-designer",
        title: "Database Schema Designer",
        shortTitle: "Schema Designer",
        icon: "▦",
        page: "schema-designer.html",
        description: "Design tables, columns, keys, relationships, and export SQL."
    },
    {
        id: "sql-playground",
        title: "SQL Playground",
        shortTitle: "SQL Playground",
        icon: "SQL",
        page: "sql-playground.html",
        description: "Run a real in-browser SQL subset against localStorage tables."
    },
    {
        id: "relational-visualizer",
        title: "Relational Database Visualizer",
        shortTitle: "Visualizer",
        icon: "↔",
        page: "relational-visualizer.html",
        description: "Visualize relationships and animate real join matching."
    },
    {
        id: "query-builder",
        title: "Query Builder 2.0",
        shortTitle: "Query Builder",
        icon: "QB",
        page: "query-builder.html",
        description: "Build SELECT queries visually and export runnable SQL."
    },
    {
        id: "normalization-studio",
        title: "Normalization Studio",
        shortTitle: "Normalization",
        icon: "NF",
        page: "normalization-studio.html",
        description: "Normalize messy tables through 1NF, 2NF, and 3NF."
    },
    {
        id: "settings",
        title: "Settings",
        shortTitle: "Settings",
        icon: "⚙",
        page: "settings.html",
        description: "Customize theme, transitions, data import/export, and demo data."
    }
];

const schemaTemplates = [
    {
        id: "ecommerce",
        name: "E-Commerce",
        description: "Customers, products, orders, and order items.",
        tables: [
            {
                name: "customers",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "name", type: "TEXT", primaryKey: false, nullable: false },
                    { name: "email", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [
                    { id: 1, name: "Ayesha Khan", email: "ayesha@example.com" },
                    { id: 2, name: "Bilal Ahmed", email: "bilal@example.com" }
                ]
            },
            {
                name: "products",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "name", type: "TEXT", primaryKey: false, nullable: false },
                    { name: "price", type: "REAL", primaryKey: false, nullable: false }
                ],
                rows: [
                    { id: 1, name: "Mechanical Keyboard", price: 8500 },
                    { id: 2, name: "USB-C Hub", price: 4200 }
                ]
            },
            {
                name: "orders",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "customer_id", type: "INTEGER", primaryKey: false, nullable: false },
                    { name: "status", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [
                    { id: 1, customer_id: 1, status: "completed" },
                    { id: 2, customer_id: 2, status: "pending" }
                ]
            }
        ],
        relationships: [
            {
                name: "customer_orders",
                fromTable: "orders",
                fromColumn: "customer_id",
                toTable: "customers",
                toColumn: "id",
                cardinality: "many-to-one"
            }
        ]
    },
    {
        id: "blog",
        name: "Blog",
        description: "Authors, posts, and comments.",
        tables: [
            {
                name: "authors",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "name", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [{ id: 1, name: "Fazal Abbas" }]
            },
            {
                name: "posts",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "author_id", type: "INTEGER", primaryKey: false, nullable: false },
                    { name: "title", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [{ id: 1, author_id: 1, title: "Learning SQL Visually" }]
            }
        ],
        relationships: [
            {
                name: "author_posts",
                fromTable: "posts",
                fromColumn: "author_id",
                toTable: "authors",
                toColumn: "id",
                cardinality: "many-to-one"
            }
        ]
    },
    {
        id: "school",
        name: "School",
        description: "Students, courses, and enrollments.",
        tables: [
            {
                name: "students",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "name", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [{ id: 1, name: "Sara" }]
            },
            {
                name: "courses",
                columns: [
                    { name: "id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "title", type: "TEXT", primaryKey: false, nullable: false }
                ],
                rows: [{ id: 1, title: "Database Systems" }]
            },
            {
                name: "enrollments",
                columns: [
                    { name: "student_id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "course_id", type: "INTEGER", primaryKey: true, nullable: false },
                    { name: "grade", type: "TEXT", primaryKey: false, nullable: true }
                ],
                rows: [{ student_id: 1, course_id: 1, grade: "A" }]
            }
        ],
        relationships: [
            {
                name: "student_enrollments",
                fromTable: "enrollments",
                fromColumn: "student_id",
                toTable: "students",
                toColumn: "id",
                cardinality: "many-to-one"
            },
            {
                name: "course_enrollments",
                fromTable: "enrollments",
                fromColumn: "course_id",
                toTable: "courses",
                toColumn: "id",
                cardinality: "many-to-one"
            }
        ]
    }
];

const normalizationSamples = [
    {
        id: "orders-export",
        name: "Denormalized Orders Export",
        description: "A messy order export with repeated products and customer details.",
        rawRows: [
            {
                order_id: 1001,
                order_date: "2026-07-01",
                customer_id: 1,
                customer_name: "Ayesha Khan",
                customer_email: "ayesha@example.com",
                product_ids: "1,2",
                product_names: "Keyboard,Mouse",
                product_prices: "8500,2200"
            },
            {
                order_id: 1002,
                order_date: "2026-07-02",
                customer_id: 2,
                customer_name: "Bilal Ahmed",
                customer_email: "bilal@example.com",
                product_ids: "2",
                product_names: "Mouse",
                product_prices: "2200"
            }
        ],
        functionalDependencies: [
            {
                id: "fd_customer",
                determinant: ["customer_id"],
                dependent: ["customer_name", "customer_email"]
            },
            {
                id: "fd_product",
                determinant: ["product_ids"],
                dependent: ["product_names", "product_prices"]
            },
            {
                id: "fd_order",
                determinant: ["order_id"],
                dependent: ["order_date", "customer_id"]
            }
        ]
    }
];

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function generateId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function formatTimestamp(dateString) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
}

function formatBytes(bytes) {
    const sizes = ["B", "KB", "MB", "GB"];
    if (!bytes) return "0 B";
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`;
}

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function deepMerge(base, incoming) {
    const output = cloneData(base);

    Object.keys(incoming || {}).forEach((key) => {
        if (
            incoming[key] &&
            typeof incoming[key] === "object" &&
            !Array.isArray(incoming[key]) &&
            output[key]
        ) {
            output[key] = deepMerge(output[key], incoming[key]);
            return;
        }

        output[key] = incoming[key];
    });

    return output;
}

function loadWorkspace() {
    const stored = localStorage.getItem(workspaceKey);

    if (!stored) {
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }

    try {
        return deepMerge(defaultWorkspace, JSON.parse(stored));
    } catch (error) {
        console.error(error);
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }
}

function saveWorkspace(workspace) {
    localStorage.setItem(workspaceKey, JSON.stringify(workspace));
    applyThemeSettings(workspace);
}

function resetWorkspace() {
    const fresh = cloneData(defaultWorkspace);
    saveWorkspace(fresh);
    return fresh;
}

function createTableFromConfig(tableConfig, index) {
    const tableId = generateId("table");
    const now = new Date().toISOString();

    return {
        id: tableId,
        name: tableConfig.name,
        position: tableConfig.position || { x: 80 + index * 300, y: 80 + index * 70 },
        columns: tableConfig.columns.map((column) => ({
            id: generateId("col"),
            name: column.name,
            type: column.type || "TEXT",
            primaryKey: Boolean(column.primaryKey),
            nullable: column.nullable !== false,
            foreignKey: null
        })),
        rows: (tableConfig.rows || []).map((row) => ({
            _id: generateId("row"),
            ...row
        })),
        createdAt: now,
        updatedAt: now
    };
}

function buildWorkspaceFromTemplate(template) {
    const workspace = cloneData(defaultWorkspace);
    const tables = template.tables.map(createTableFromConfig);
    const now = new Date().toISOString();

    template.relationships.forEach((relationship) => {
        const fromTable = tables.find((table) => table.name === relationship.fromTable);
        const toTable = tables.find((table) => table.name === relationship.toTable);

        if (!fromTable || !toTable) return;

        const fromColumn = fromTable.columns.find(
            (column) => column.name === relationship.fromColumn
        );

        if (fromColumn) {
            fromColumn.foreignKey = {
                tableId: toTable.id,
                columnName: relationship.toColumn
            };
        }

        workspace.database.relationships.push({
            id: generateId("rel"),
            name: relationship.name,
            fromTableId: fromTable.id,
            fromColumn: relationship.fromColumn,
            toTableId: toTable.id,
            toColumn: relationship.toColumn,
            cardinality: relationship.cardinality || "many-to-one",
            createdAt: now
        });
    });

    workspace.database.tables = tables;
    return workspace;
}

function seedDemoData() {
    const workspace = buildWorkspaceFromTemplate(schemaTemplates[0]);
    const now = new Date().toISOString();

    workspace.sqlHistory = [
        {
            id: generateId("sql"),
            queryText:
                "SELECT customers.name, orders.status FROM customers INNER JOIN orders ON customers.id = orders.customer_id",
            rowsReturned: 2,
            executionMs: 1.2,
            status: "success",
            createdAt: now
        },
        {
            id: generateId("sql"),
            queryText: "SELECT * FROM products ORDER BY price DESC LIMIT 5",
            rowsReturned: 2,
            executionMs: 0.7,
            status: "success",
            createdAt: now
        }
    ];

    workspace.savedQueries = [
        {
            id: generateId("qb"),
            name: "Customer Orders",
            builderConfig: {
                selectColumns: ["customers.name", "orders.status"],
                fromTable: "customers",
                joins: [
                    {
                        type: "INNER",
                        table: "orders",
                        on: "customers.id = orders.customer_id"
                    }
                ],
                whereConditions: [],
                groupBy: [],
                orderBy: [{ field: "customers.name", direction: "ASC" }]
            },
            generatedSql:
                "SELECT customers.name, orders.status FROM customers INNER JOIN orders ON customers.id = orders.customer_id ORDER BY customers.name ASC",
            createdAt: now
        }
    ];

    workspace.normalizationProjects = [
        {
            id: generateId("norm"),
            name: normalizationSamples[0].name,
            rawRows: normalizationSamples[0].rawRows,
            functionalDependencies: normalizationSamples[0].functionalDependencies,
            steps: {
                firstNormalForm: { tables: [] },
                secondNormalForm: { tables: [] },
                thirdNormalForm: { tables: [] }
            },
            createdAt: now
        }
    ];

    workspace.activityLog = [
        {
            id: generateId("log"),
            module: "Schema Designer",
            action: "Seeded demo schema",
            detail: "Created customers, products, and orders tables.",
            createdAt: now
        },
        {
            id: generateId("log"),
            module: "SQL Playground",
            action: "Added sample history",
            detail: "Added two runnable SQL examples.",
            createdAt: now
        },
        {
            id: generateId("log"),
            module: "Normalization Studio",
            action: "Added sample project",
            detail: "Added denormalized orders export sample.",
            createdAt: now
        }
    ];

    return workspace;
}

function addActivityLog(module, action, detail) {
    const workspace = loadWorkspace();
    workspace.activityLog.unshift({
        id: generateId("log"),
        module,
        action,
        detail,
        createdAt: new Date().toISOString()
    });
    workspace.activityLog = workspace.activityLog.slice(0, 50);
    saveWorkspace(workspace);
}

function applyThemeSettings(workspaceArg) {
    const workspace = workspaceArg || loadWorkspace();
    const theme = workspace.theme || defaultWorkspace.theme;
    const root = document.documentElement;

    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--bg-soft", theme.bgSoft);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--danger", theme.danger);
    root.style.setProperty("--radius", `${theme.radius}px`);
    root.style.setProperty("--font-family", theme.fontFamily);
}

function renderSidebar(activePage) {
    const workspace = loadWorkspace();
    const compactClass = workspace.settings.compactSidebar ? "compact-sidebar" : "";

    return `
    <aside class="sidebar ${compactClass}">
      <a class="sidebar-brand" href="index.html" data-transition-link>
        <span class="brand-mark">DB</span>
        <span>
          <p class="brand-title">${escapeHtml(workspace.brand.name)}</p>
          <p class="brand-subtitle">${escapeHtml(workspace.brand.tagline)}</p>
        </span>
      </a>

      <nav class="sidebar-nav">
        ${modulesConfig
            .map(
                (item) => `
            <a class="nav-link ${item.id === activePage ? "active" : ""
                    }" href="${item.page}" data-page="${item.id}" data-transition-link>
              <span class="nav-icon">${escapeHtml(item.icon)}</span>
              <span>${escapeHtml(item.shortTitle)}</span>
            </a>`
            )
            .join("")}
      </nav>
    </aside>
  `;
}

function setActiveNav() {
    const current = location.pathname.split("/").pop() || "index.html";

    $(".nav-link").each(function () {
        const href = $(this).attr("href");
        $(this).toggleClass("active", href === current);
    });
}

function showStatus(message, type = "success") {
    $(".status-message").remove();

    const status = $(`
    <div class="status-message status-${escapeHtml(type)}">
      ${escapeHtml(message)}
    </div>
  `);

    $("body").append(status);

    setTimeout(() => {
        status.fadeOut(200, function () {
            $(this).remove();
        });
    }, 2800);
}

function renderEmptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function downloadJson(filename, data) {
    downloadTextFile(filename, JSON.stringify(data, null, 2));
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

function copyText(text, message = "Copied to clipboard.") {
    navigator.clipboard
        .writeText(text)
        .then(() => showStatus(message, "success"))
        .catch(() => showStatus("Clipboard access failed.", "danger"));
}

function getTableById(database, id) {
    return database.tables.find((table) => table.id === id);
}

function getTableByName(database, name) {
    return database.tables.find(
        (table) => table.name.toLowerCase() === String(name).toLowerCase()
    );
}

function tokenizeSql(sqlText) {
    const tokens = [];
    let index = 0;

    while (index < sqlText.length) {
        const char = sqlText[index];

        if (/\s/.test(char)) {
            index++;
            continue;
        }

        if ("(),;*=<>".includes(char)) {
            tokens.push({ type: "symbol", value: char });
            index++;
            continue;
        }

        if (char === "'" || char === '"') {
            const quote = char;
            let value = "";
            index++;

            while (index < sqlText.length && sqlText[index] !== quote) {
                value += sqlText[index];
                index++;
            }

            index++;
            tokens.push({ type: "string", value });
            continue;
        }

        if (/[0-9]/.test(char)) {
            let value = "";
            while (index < sqlText.length && /[0-9.]/.test(sqlText[index])) {
                value += sqlText[index];
                index++;
            }
            tokens.push({ type: "number", value: Number(value) });
            continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
            let value = "";
            while (index < sqlText.length && /[a-zA-Z0-9_.]/.test(sqlText[index])) {
                value += sqlText[index];
                index++;
            }
            tokens.push({ type: "word", value });
            continue;
        }

        throw new Error(`Unexpected character "${char}" at position ${index}.`);
    }

    return tokens;
}

function makeParser(tokens) {
    let cursor = 0;

    function peek(offset = 0) {
        return tokens[cursor + offset];
    }

    function consume() {
        return tokens[cursor++];
    }

    function match(value) {
        const token = peek();
        return token && String(token.value).toUpperCase() === value.toUpperCase();
    }

    function expect(value) {
        if (!match(value)) {
            throw new Error(`Expected "${value}" but found "${peek()?.value || "end"}".`);
        }
        return consume();
    }

    function readIdentifier() {
        const token = consume();

        if (!token || !["word", "string"].includes(token.type)) {
            throw new Error(`Expected identifier but found "${token?.value || "end"}".`);
        }

        return token.value;
    }

    function readValue() {
        const token = consume();

        if (!token) throw new Error("Expected value but found end of query.");

        if (["string", "number"].includes(token.type)) return token.value;
        return token.value;
    }

    function readCsvUntil(stopWords) {
        const values = [];
        let current = [];

        while (peek() && !stopWords.includes(String(peek().value).toUpperCase())) {
            const token = consume();

            if (token.value === ",") {
                if (current.length) values.push(current.join(" "));
                current = [];
            } else {
                current.push(token.value);
            }
        }

        if (current.length) values.push(current.join(" "));
        return values;
    }

    function parseWhere() {
        if (!match("WHERE")) return null;

        consume();
        const conditions = [];

        while (peek() && !["GROUP", "ORDER", "LIMIT", ";"].includes(String(peek().value).toUpperCase())) {
            const field = readIdentifier();
            const operator = consume()?.value;
            const value = readValue();
            conditions.push({ field, operator, value });

            if (match("AND") || match("OR")) {
                conditions.push({ logical: consume().value.toUpperCase() });
            }
        }

        return conditions;
    }

    function parseSelect() {
        expect("SELECT");
        const columns = readCsvUntil(["FROM"]);
        expect("FROM");
        const fromTable = readIdentifier();

        const joins = [];
        while (match("INNER") || match("LEFT") || match("JOIN")) {
            let type = "INNER";

            if (match("INNER") || match("LEFT")) {
                type = consume().value.toUpperCase();
            }

            expect("JOIN");
            const table = readIdentifier();
            expect("ON");
            const left = readIdentifier();
            expect("=");
            const right = readIdentifier();
            joins.push({ type, table, on: `${left} = ${right}` });
        }

        const whereConditions = parseWhere();

        let groupBy = [];
        if (match("GROUP")) {
            consume();
            expect("BY");
            groupBy = readCsvUntil(["ORDER", "LIMIT", ";"]);
        }

        let orderBy = [];
        if (match("ORDER")) {
            consume();
            expect("BY");
            const field = readIdentifier();
            let direction = "ASC";

            if (match("ASC") || match("DESC")) {
                direction = consume().value.toUpperCase();
            }

            orderBy = [{ field, direction }];
        }

        let limit = null;
        if (match("LIMIT")) {
            consume();
            limit = Number(readValue());
        }

        return {
            type: "select",
            selectColumns: columns,
            fromTable,
            joins,
            whereConditions,
            groupBy,
            orderBy,
            limit
        };
    }

    function parseInsert() {
        expect("INSERT");
        expect("INTO");

        const table = readIdentifier();
        const columns = [];

        if (match("(")) {
            consume();

            while (peek() && !match(")")) {
                if (match(",")) {
                    consume();
                } else {
                    columns.push(readIdentifier());
                }
            }

            expect(")");
        }

        expect("VALUES");
        expect("(");

        const values = [];
        while (peek() && !match(")")) {
            if (match(",")) {
                consume();
            } else {
                values.push(readValue());
            }
        }

        expect(")");
        return { type: "insert", table, columns, values };
    }

    function parseUpdate() {
        expect("UPDATE");
        const table = readIdentifier();
        expect("SET");

        const updates = [];

        while (peek() && !match("WHERE")) {
            if (match(",")) {
                consume();
                continue;
            }

            const field = readIdentifier();
            expect("=");
            const value = readValue();
            updates.push({ field, value });
        }

        const whereConditions = parseWhere();
        return { type: "update", table, updates, whereConditions };
    }

    function parseDelete() {
        expect("DELETE");
        expect("FROM");
        const table = readIdentifier();
        const whereConditions = parseWhere();
        return { type: "delete", table, whereConditions };
    }

    return {
        parse() {
            if (!tokens.length) throw new Error("Query is empty.");

            if (match("SELECT")) return parseSelect();
            if (match("INSERT")) return parseInsert();
            if (match("UPDATE")) return parseUpdate();
            if (match("DELETE")) return parseDelete();

            throw new Error(`Unsupported SQL statement "${peek().value}".`);
        }
    };
}

function parseSql(tokens) {
    return makeParser(tokens).parse();
}

function normalizeField(field) {
    return String(field || "").split(".").pop();
}

function getValueByField(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) return row[field];

    const normalized = normalizeField(field);
    const direct = Object.keys(row).find(
        (key) => key.toLowerCase() === normalized.toLowerCase()
    );

    if (direct) return row[direct];

    return undefined;
}

function compareValue(rowValue, operator, expectedValue) {
    const left = rowValue;
    const right = expectedValue;

    switch (operator) {
        case "=":
            return String(left) === String(right);
        case ">":
            return Number(left) > Number(right);
        case "<":
            return Number(left) < Number(right);
        default:
            throw new Error(`Unsupported operator "${operator}".`);
    }
}

function rowMatchesConditions(row, conditions) {
    if (!conditions || !conditions.length) return true;

    let result = true;
    let pendingLogical = "AND";

    conditions.forEach((condition) => {
        if (condition.logical) {
            pendingLogical = condition.logical;
            return;
        }

        const current = compareValue(
            getValueByField(row, condition.field),
            condition.operator,
            condition.value
        );

        if (pendingLogical === "AND") result = result && current;
        if (pendingLogical === "OR") result = result || current;
    });

    return result;
}

function qualifyRows(table) {
    return table.rows.map((row) => {
        const output = { ...row };

        table.columns.forEach((column) => {
            output[`${table.name}.${column.name}`] = row[column.name];
        });

        return output;
    });
}

function applyJoins(database, baseRows, joins) {
    let rows = baseRows;

    joins.forEach((join) => {
        const rightTable = getTableByName(database, join.table);
        if (!rightTable) throw new Error(`Table "${join.table}" not found.`);

        const [leftField, rightField] = join.on.split("=").map((part) => part.trim());
        const rightRows = qualifyRows(rightTable);
        const joinedRows = [];

        rows.forEach((leftRow) => {
            const matches = rightRows.filter(
                (rightRow) =>
                    String(getValueByField(leftRow, leftField)) ===
                    String(getValueByField(rightRow, rightField))
            );

            if (matches.length) {
                matches.forEach((match) => {
                    joinedRows.push({ ...leftRow, ...match });
                });
            } else if (join.type === "LEFT") {
                joinedRows.push({ ...leftRow });
            }
        });

        rows = joinedRows;
    });

    return rows;
}

function executeSelect(database, parsedQuery) {
    const table = getTableByName(database, parsedQuery.fromTable);
    if (!table) throw new Error(`Table "${parsedQuery.fromTable}" not found.`);

    let rows = qualifyRows(table);
    rows = applyJoins(database, rows, parsedQuery.joins || []);
    rows = rows.filter((row) => rowMatchesConditions(row, parsedQuery.whereConditions));

    if (parsedQuery.orderBy?.length) {
        const order = parsedQuery.orderBy[0];

        rows.sort((a, b) => {
            const first = getValueByField(a, order.field);
            const second = getValueByField(b, order.field);

            if (first > second) return order.direction === "DESC" ? -1 : 1;
            if (first < second) return order.direction === "DESC" ? 1 : -1;
            return 0;
        });
    }

    if (parsedQuery.limit) {
        rows = rows.slice(0, parsedQuery.limit);
    }

    const columns =
        parsedQuery.selectColumns.length === 1 && parsedQuery.selectColumns[0] === "*"
            ? Object.keys(rows[0] || {}).filter((key) => key !== "_id")
            : parsedQuery.selectColumns;

    const outputRows = rows.map((row) => {
        const output = {};
        columns.forEach((column) => {
            output[column] = getValueByField(row, column);
        });
        return output;
    });

    return {
        type: "result",
        rows: outputRows,
        rowsReturned: outputRows.length,
        message: `${outputRows.length} row(s) returned.`
    };
}

function executeInsert(database, parsedQuery) {
    const table = getTableByName(database, parsedQuery.table);
    if (!table) throw new Error(`Table "${parsedQuery.table}" not found.`);

    const row = { _id: generateId("row") };
    const columns = parsedQuery.columns.length
        ? parsedQuery.columns
        : table.columns.map((column) => column.name);

    columns.forEach((column, index) => {
        row[column] = parsedQuery.values[index] ?? null;
    });

    table.rows.push(row);
    table.updatedAt = new Date().toISOString();

    return {
        type: "mutation",
        rowsAffected: 1,
        message: "1 row inserted."
    };
}

function executeUpdate(database, parsedQuery) {
    const table = getTableByName(database, parsedQuery.table);
    if (!table) throw new Error(`Table "${parsedQuery.table}" not found.`);

    let affected = 0;

    table.rows.forEach((row) => {
        if (rowMatchesConditions(row, parsedQuery.whereConditions)) {
            parsedQuery.updates.forEach((update) => {
                row[update.field] = update.value;
            });

            affected++;
        }
    });

    table.updatedAt = new Date().toISOString();

    return {
        type: "mutation",
        rowsAffected: affected,
        message: `${affected} row(s) updated.`
    };
}

function executeDelete(database, parsedQuery) {
    const table = getTableByName(database, parsedQuery.table);
    if (!table) throw new Error(`Table "${parsedQuery.table}" not found.`);

    const before = table.rows.length;
    table.rows = table.rows.filter(
        (row) => !rowMatchesConditions(row, parsedQuery.whereConditions)
    );
    table.updatedAt = new Date().toISOString();

    const affected = before - table.rows.length;

    return {
        type: "mutation",
        rowsAffected: affected,
        message: `${affected} row(s) deleted.`
    };
}

function executeSql(database, parsedQuery) {
    if (parsedQuery.type === "select") return executeSelect(database, parsedQuery);
    if (parsedQuery.type === "insert") return executeInsert(database, parsedQuery);
    if (parsedQuery.type === "update") return executeUpdate(database, parsedQuery);
    if (parsedQuery.type === "delete") return executeDelete(database, parsedQuery);

    throw new Error(`Unsupported parsed query type "${parsedQuery.type}".`);
}

function generateSqlFromBuilderConfig(config) {
    if (!config || !config.fromTable) return "";

    const selectColumns = config.selectColumns?.length
        ? config.selectColumns.join(", ")
        : "*";

    let sql = `SELECT ${selectColumns} FROM ${config.fromTable}`;

    (config.joins || []).forEach((join) => {
        if (join.table && join.on) {
            sql += ` ${join.type || "INNER"} JOIN ${join.table} ON ${join.on}`;
        }
    });

    if (config.whereConditions?.length) {
        const whereText = config.whereConditions
            .filter((condition) => condition.field && condition.operator)
            .map((condition, index) => {
                const logical = index > 0 ? ` ${condition.logical || "AND"} ` : "";
                const value =
                    Number.isFinite(Number(condition.value)) && condition.value !== ""
                        ? condition.value
                        : `'${String(condition.value).replaceAll("'", "''")}'`;

                return `${logical}${condition.field} ${condition.operator} ${value}`;
            })
            .join("");

        if (whereText) sql += ` WHERE ${whereText}`;
    }

    if (config.groupBy?.length) {
        sql += ` GROUP BY ${config.groupBy.join(", ")}`;
    }

    if (config.orderBy?.length) {
        const firstOrder = config.orderBy[0];
        if (firstOrder.field) {
            sql += ` ORDER BY ${firstOrder.field} ${firstOrder.direction || "ASC"}`;
        }
    }

    return sql;
}

function exportSchemaAsSql(database) {
    return database.tables
        .map((table) => {
            const columnLines = table.columns.map((column) => {
                let line = `  ${column.name} ${column.type}`;

                if (column.primaryKey) line += " PRIMARY KEY";
                if (!column.nullable) line += " NOT NULL";

                if (column.foreignKey) {
                    const targetTable = getTableById(database, column.foreignKey.tableId);
                    if (targetTable) {
                        line += ` REFERENCES ${targetTable.name}(${column.foreignKey.columnName})`;
                    }
                }

                return line;
            });

            return `CREATE TABLE ${table.name} (\n${columnLines.join(",\n")}\n);`;
        })
        .join("\n\n");
}

function importSqlAsSchema(sqlText) {
    const createStatements = sqlText
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

    const tables = [];
    const relationships = [];

    createStatements.forEach((statement, index) => {
        const match = statement.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]+)\)/i);
        if (!match) return;

        const [, tableName, body] = match;
        const tableId = generateId("table");
        const now = new Date().toISOString();

        const columns = body
            .split(",")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const parts = line.split(/\s+/);
                const name = parts[0];
                const type = parts[1] || "TEXT";
                const upper = line.toUpperCase();

                return {
                    id: generateId("col"),
                    name,
                    type,
                    primaryKey: upper.includes("PRIMARY KEY"),
                    nullable: !upper.includes("NOT NULL"),
                    foreignKey: null,
                    rawReference: line.match(/REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_]+)\)/i)
                };
            });

        tables.push({
            id: tableId,
            name: tableName,
            position: { x: 90 + index * 310, y: 90 + index * 80 },
            columns,
            rows: [],
            createdAt: now,
            updatedAt: now
        });
    });

    tables.forEach((table) => {
        table.columns.forEach((column) => {
            if (!column.rawReference) return;

            const targetTable = tables.find((item) => item.name === column.rawReference[1]);
            if (!targetTable) return;

            column.foreignKey = {
                tableId: targetTable.id,
                columnName: column.rawReference[2]
            };

            relationships.push({
                id: generateId("rel"),
                name: `${table.name}_${targetTable.name}`,
                fromTableId: table.id,
                fromColumn: column.name,
                toTableId: targetTable.id,
                toColumn: column.rawReference[2],
                cardinality: "many-to-one",
                createdAt: new Date().toISOString()
            });

            delete column.rawReference;
        });
    });

    return { tables, relationships };
}

function renderErDiagram(database, containerEl) {
    const container = $(containerEl);
    container.empty();

    const svg = $(`
    <svg class="relationship-svg">
      <defs>
        <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--primary)"></path>
        </marker>
      </defs>
    </svg>
  `);

    container.append(svg);

    database.tables.forEach((table) => {
        const node = $(`
      <div class="table-node" data-table-id="${table.id}" style="left:${table.position.x}px; top:${table.position.y}px;">
        <div class="table-node-header">
          <h3 class="table-node-title">${escapeHtml(table.name)}</h3>
          <span class="badge-soft">${table.rows.length} rows</span>
        </div>
        <div>
          ${table.columns
                .map(
                    (column) => `
              <div class="column-row">
                <span>${column.primaryKey ? "🔑 " : ""}${escapeHtml(column.name)}</span>
                <span>${escapeHtml(column.type)}${column.foreignKey ? " ↗" : ""}</span>
              </div>`
                )
                .join("")}
        </div>
      </div>
    `);

        container.append(node);
    });

    setTimeout(() => {
        database.relationships.forEach((relationship) => {
            const from = container.find(`[data-table-id="${relationship.fromTableId}"]`);
            const to = container.find(`[data-table-id="${relationship.toTableId}"]`);

            if (!from.length || !to.length) return;

            const fromPos = from.position();
            const toPos = to.position();

            const x1 = fromPos.left + from.outerWidth();
            const y1 = fromPos.top + from.outerHeight() / 2;
            const x2 = toPos.left;
            const y2 = toPos.top + to.outerHeight() / 2;

            svg.append(
                `<path class="relationship-line" d="M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80
                } ${y2}, ${x2} ${y2}"></path>`
            );
        });
    }, 20);
}

function flattenToFirstNormalForm(rawRows) {
    const flattened = [];

    rawRows.forEach((row) => {
        const multiKeys = Object.keys(row).filter(
            (key) => typeof row[key] === "string" && row[key].includes(",")
        );

        if (!multiKeys.length) {
            flattened.push({ ...row });
            return;
        }

        const maxParts = Math.max(
            ...multiKeys.map((key) => String(row[key]).split(",").length)
        );

        for (let index = 0; index < maxParts; index++) {
            const output = {};

            Object.keys(row).forEach((key) => {
                if (multiKeys.includes(key)) {
                    output[key] = String(row[key]).split(",")[index]?.trim() || null;
                } else {
                    output[key] = row[key];
                }
            });

            flattened.push(output);
        }
    });

    return [
        {
            name: "first_normal_form_table",
            rows: flattened,
            explanation:
                "Repeating comma-separated groups were split into atomic row values."
        }
    ];
}

function decomposeToSecondNormalForm(table, functionalDependencies) {
    const baseRows = table.rows || [];
    const resultTables = [
        {
            name: table.name || "base_table",
            rows: baseRows.map((row) => ({ ...row })),
            explanation: "Base table after 1NF."
        }
    ];

    functionalDependencies.forEach((dependency) => {
        if (!dependency.determinant?.length || !dependency.dependent?.length) return;

        const columns = [...dependency.determinant, ...dependency.dependent];
        const seen = new Set();
        const rows = [];

        baseRows.forEach((row) => {
            const key = dependency.determinant.map((column) => row[column]).join("|");
            if (seen.has(key)) return;
            seen.add(key);

            const output = {};
            columns.forEach((column) => {
                output[column] = row[column];
            });
            rows.push(output);
        });

        resultTables.push({
            name: `${dependency.determinant.join("_")}_details`,
            rows,
            explanation: `${dependency.determinant.join(
                ", "
            )} determines ${dependency.dependent.join(
                ", "
            )}; this removes partial dependency style redundancy.`
        });
    });

    return resultTables;
}

function decomposeToThirdNormalForm(tables, functionalDependencies) {
    const output = cloneData(tables);

    functionalDependencies.forEach((dependency) => {
        if (!dependency.determinant?.length || !dependency.dependent?.length) return;

        const sourceTable = output.find((table) => {
            const firstRow = table.rows?.[0] || {};
            return [...dependency.determinant, ...dependency.dependent].every((column) =>
                Object.prototype.hasOwnProperty.call(firstRow, column)
            );
        });

        if (!sourceTable) return;

        const seen = new Set();
        const rows = [];

        sourceTable.rows.forEach((row) => {
            const key = dependency.determinant.map((column) => row[column]).join("|");
            if (seen.has(key)) return;
            seen.add(key);

            const nextRow = {};
            [...dependency.determinant, ...dependency.dependent].forEach((column) => {
                nextRow[column] = row[column];
            });

            rows.push(nextRow);
        });

        output.push({
            name: `${dependency.determinant.join("_")}_lookup_3nf`,
            rows,
            explanation: `Transitive dependency candidate separated using determinant ${dependency.determinant.join(
                ", "
            )}.`
        });
    });

    return output;
}

function ensureTransitionOverlay() {
    if ($(".transition-overlay").length) return $(".transition-overlay");

    const workspace = loadWorkspace();

    const overlay = $(`
    <div class="transition-overlay">
      <div class="loader-card">
        <div class="loader-ring"></div>
        <p class="loader-text">${escapeHtml(workspace.settings.loaderText || "Loading workspace...")
        }</p>
      </div>
    </div>
  `);

    $("body").append(overlay);
    return overlay;
}

function showTransitionOverlay(withLoader = false) {
    const overlay = ensureTransitionOverlay();
    overlay.removeClass("hidden");

    if (withLoader) overlay.addClass("show-loader");
    else overlay.removeClass("show-loader");
}

function hideTransitionOverlay() {
    const overlay = ensureTransitionOverlay();
    const workspace = loadWorkspace();

    setTimeout(() => {
        overlay.addClass("hidden");
        overlay.removeClass("show-loader");
    }, Number(workspace.settings.transitionSpeedMs) || 260);
}

function navigateWithTransition(url) {
    const workspace = loadWorkspace();
    const overlay = ensureTransitionOverlay();
    let loaderTimer = null;

    overlay.removeClass("hidden").removeClass("show-loader");

    loaderTimer = setTimeout(() => {
        overlay.addClass("show-loader");
    }, Number(workspace.settings.loaderDelayMs) || 180);

    setTimeout(() => {
        clearTimeout(loaderTimer);
        window.location.href = url;
    }, Number(workspace.settings.transitionSpeedMs) || 320);
}

function initPageTransitions() {
    ensureTransitionOverlay();

    $(document).on("click", "a[data-transition-link]", function (event) {
        const href = $(this).attr("href");

        if (!href || href.startsWith("#") || href.startsWith("http")) return;

        event.preventDefault();
        navigateWithTransition(href);
    });

    hideTransitionOverlay();
}

function renderShell(activePage, contentHtml) {
    return `
    <div class="app-shell">
      ${renderSidebar(activePage)}
      <main class="main-content">
        <div class="page-container">
          ${contentHtml}
        </div>
      </main>
    </div>
  `;
}

function getAllSchemaColumns(database) {
    return database.tables.flatMap((table) =>
        table.columns.map((column) => `${table.name}.${column.name}`)
    );
}

$(document).ready(function () {
    applyThemeSettings();
    initPageTransitions();
    setActiveNav();
});