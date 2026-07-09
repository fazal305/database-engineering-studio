let currentSamples = [];

function renderSqlPlayground() {
    const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">SQL Playground</span>
        <h1 class="page-title">Run SQL against your browser schema</h1>
        <p class="page-description">
          This is a real in-browser JavaScript SQL interpreter for a defined SQL subset.
          It runs against localStorage tables only — it is not a live database server connection.
        </p>
      </div>
    </header>

    <div class="sql-layout">
      <main class="d-grid gap-3">
        <section class="card-panel sql-editor-panel">
          <div class="sql-help mb-3">
            Supported subset: SELECT ... FROM ... JOIN ... ON ... WHERE ... GROUP BY ...
            ORDER BY ... LIMIT ..., plus basic INSERT, UPDATE, and DELETE.
          </div>

          <label class="form-label" for="sqlEditor">SQL Statement</label>
          <textarea id="sqlEditor" class="sql-editor" spellcheck="false">SELECT * FROM customers</textarea>

          <div class="sql-actions">
            <button class="btn-app" id="runSqlBtn">Run SQL</button>
            <button class="btn-ghost" id="clearSqlBtn">Clear</button>
            <button class="btn-ghost" id="copySqlBtn">Copy SQL</button>
          </div>
        </section>

        <section class="card-panel sql-results-panel">
          <div class="page-header mb-2">
            <div>
              <span class="eyebrow">Output</span>
              <h2 class="card-title mt-2">Results</h2>
            </div>
          </div>
          <div id="sqlResults">${renderEmptyState("Run a query to see results.")}</div>
        </section>
      </main>

      <aside class="d-grid gap-3 align-content-start">
        <section class="card-panel sql-history-panel">
          <h2 class="card-title">Sample Queries</h2>
          <div id="sampleQueryList" class="sample-query-list"></div>
        </section>

        <section class="card-panel sql-history-panel">
          <h2 class="card-title">Query History</h2>
          <div id="sqlHistoryList" class="history-list"></div>
        </section>
      </aside>
    </div>
  `;

    $("#app").html(renderShell("sql-playground", content));
    renderSampleQueries();
    renderSqlHistory();
    bindSqlEvents();
    setActiveNav();
}

function buildSampleQueries() {
    const workspace = loadWorkspace();
    const database = workspace.database;

    const samples = [];

    database.tables.forEach((table) => {
        samples.push({
            id: generateId("sample"),
            name: `View ${table.name}`,
            sql: `SELECT * FROM ${table.name}`
        });
    });

    database.relationships.forEach((relationship) => {
        const fromTable = getTableById(database, relationship.fromTableId);
        const toTable = getTableById(database, relationship.toTableId);

        if (!fromTable || !toTable) return;

        samples.push({
            id: generateId("sample"),
            name: `${toTable.name} with ${fromTable.name}`,
            sql: `SELECT * FROM ${toTable.name} INNER JOIN ${fromTable.name} ON ${toTable.name}.${relationship.toColumn} = ${fromTable.name}.${relationship.fromColumn}`
        });
    });

    const firstTable = database.tables[0];

    if (firstTable) {
        const writableColumns = firstTable.columns.filter((column) => !column.primaryKey);
        const idColumn = firstTable.columns.find((column) => column.primaryKey) || firstTable.columns[0];

        if (writableColumns.length) {
            samples.push({
                id: generateId("sample"),
                name: `Update ${firstTable.name}`,
                sql: `UPDATE ${firstTable.name} SET ${writableColumns[0].name} = 'updated value' WHERE ${idColumn.name} = 1`
            });
        }

        samples.push({
            id: generateId("sample"),
            name: `Delete from ${firstTable.name}`,
            sql: `DELETE FROM ${firstTable.name} WHERE ${idColumn.name} = 999`
        });
    }

    currentSamples = samples;
    return samples;
}

function renderSampleQueries() {
    const samples = buildSampleQueries();

    $("#sampleQueryList").html(
        samples.length
            ? samples
                .map(
                    (sample) => `
            <button class="sample-query-item text-start" data-sample-id="${sample.id}">
              <strong>${escapeHtml(sample.name)}</strong>
              <p class="history-query mb-0">${escapeHtml(sample.sql)}</p>
            </button>
          `
                )
                .join("")
            : renderEmptyState("Create tables to generate sample queries.")
    );
}

function runSqlStatement(sqlText) {
    const startedAt = performance.now();
    const workspace = loadWorkspace();

    try {
        const tokens = tokenizeSql(sqlText);
        const parsedQuery = parseSql(tokens);
        const result = executeSql(workspace.database, parsedQuery);
        const executionMs = Number((performance.now() - startedAt).toFixed(2));

        workspace.sqlHistory.unshift({
            id: generateId("sql"),
            queryText: sqlText,
            rowsReturned: result.rowsReturned || result.rowsAffected || 0,
            executionMs,
            status: "success",
            createdAt: new Date().toISOString()
        });

        workspace.sqlHistory = workspace.sqlHistory.slice(0, 40);
        saveWorkspace(workspace);

        addActivityLog(
            "SQL Playground",
            "Ran SQL statement",
            `${result.message} Execution time: ${executionMs}ms.`
        );

        renderSqlResults({
            ...result,
            executionMs
        });

        renderSqlHistory();
        renderSampleQueries();
    } catch (error) {
        renderParseError(error);

        workspace.sqlHistory.unshift({
            id: generateId("sql"),
            queryText: sqlText,
            rowsReturned: 0,
            executionMs: Number((performance.now() - startedAt).toFixed(2)),
            status: "error",
            createdAt: new Date().toISOString()
        });

        workspace.sqlHistory = workspace.sqlHistory.slice(0, 40);
        saveWorkspace(workspace);
        renderSqlHistory();
    }
}

function renderSqlResults(result) {
    if (result.type === "mutation") {
        $("#sqlResults").html(`
      <div class="result-summary">
        ${escapeHtml(result.message)} Execution time: ${escapeHtml(result.executionMs)}ms.
      </div>
    `);
        showStatus(result.message, "success");
        return;
    }

    const rows = result.rows || [];
    const columns = Object.keys(rows[0] || {});

    if (!rows.length) {
        $("#sqlResults").html(`
      <div class="result-summary">
        ${escapeHtml(result.message)} Execution time: ${escapeHtml(result.executionMs)}ms.
      </div>
      ${renderEmptyState("No rows returned.")}
    `);
        return;
    }

    $("#sqlResults").html(`
    <div class="result-summary">
      ${escapeHtml(result.message)} Execution time: ${escapeHtml(result.executionMs)}ms.
    </div>

    <div class="table-wrap">
      <table class="app-table">
        <thead>
          <tr>
            ${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
                (row) => `
              <tr>
                ${columns
                        .map((column) => `<td>${escapeHtml(row[column])}</td>`)
                        .join("")}
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

function renderSqlHistory() {
    const workspace = loadWorkspace();
    const history = workspace.sqlHistory.slice(0, 12);

    $("#sqlHistoryList").html(
        history.length
            ? history
                .map(
                    (item) => `
            <div class="history-item">
              <p class="history-query">${escapeHtml(item.queryText)}</p>
              <div class="d-flex justify-content-between gap-2 align-items-center">
                <span class="badge-soft">${escapeHtml(item.status)}</span>
                <button class="btn-ghost rerun-history-btn" data-history-id="${item.id}">Run</button>
              </div>
              <small class="card-text">${escapeHtml(formatTimestamp(item.createdAt))}</small>
            </div>
          `
                )
                .join("")
            : renderEmptyState("No SQL history yet.")
    );
}

function rerunHistoryStatement(id) {
    const workspace = loadWorkspace();
    const item = workspace.sqlHistory.find((history) => history.id === id);

    if (!item) return;

    $("#sqlEditor").val(item.queryText);
    runSqlStatement(item.queryText);
}

function renderParseError(error) {
    $("#sqlResults").html(`
    <div class="status-message status-danger position-static">
      <strong>SQL Error:</strong> ${escapeHtml(error.message)}
    </div>
  `);

    showStatus(error.message, "danger");
}

function loadSampleQuery(sampleId) {
    const sample = currentSamples.find((item) => item.id === sampleId);

    if (!sample) return;

    $("#sqlEditor").val(sample.sql);
}

function bindSqlEvents() {
    $(document).on("click", "#runSqlBtn", function () {
        const sqlText = $("#sqlEditor").val().trim();

        if (!sqlText) {
            showStatus("Write a SQL statement first.", "warning");
            return;
        }

        runSqlStatement(sqlText);
    });

    $(document).on("click", "#clearSqlBtn", function () {
        $("#sqlEditor").val("");
        $("#sqlResults").html(renderEmptyState("Run a query to see results."));
    });

    $(document).on("click", "#copySqlBtn", function () {
        copyText($("#sqlEditor").val(), "SQL copied.");
    });

    $(document).on("click", ".rerun-history-btn", function () {
        rerunHistoryStatement($(this).data("history-id"));
    });

    $(document).on("click", ".sample-query-item", function () {
        loadSampleQuery($(this).data("sample-id"));
    });
}

$(document).ready(renderSqlPlayground);