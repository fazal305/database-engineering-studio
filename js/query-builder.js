let builderConfig = {
    selectColumns: [],
    fromTable: "",
    joins: [],
    whereConditions: [],
    groupBy: [],
    orderBy: []
};

function renderQueryBuilderPage() {
    const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">Query Builder 2.0</span>
        <h1 class="page-title">Build SQL visually</h1>
        <p class="page-description">
          Select tables, columns, joins, filters, grouping, and sorting while the exact SQL updates live.
        </p>
      </div>
    </header>

    <div class="builder-layout">
      <main id="builderForm" class="builder-form"></main>

      <aside class="sql-preview">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Generated SQL</h2>
          <textarea id="generatedSql" class="code-box" readonly></textarea>

          <div class="sql-actions mt-3">
            <button class="btn-app" id="runBuiltQueryBtn">Run</button>
            <button class="btn-ghost" id="copyBuiltSqlBtn">Copy</button>
            <button class="btn-ghost" id="saveBuiltQueryBtn">Save</button>
          </div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Results</h2>
          <div id="builtQueryResults">${renderEmptyState("Run the generated query to see results.")}</div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Saved Queries</h2>
          <div id="savedQueriesList" class="saved-query-list"></div>
        </section>
      </aside>
    </div>
  `;

    $("#app").html(renderShell("query-builder", content));
    initBuilderConfig();
    renderQueryBuilderForm();
    renderGeneratedSql();
    renderSavedQueries();
    bindQueryBuilderEvents();
    setActiveNav();
}

function initBuilderConfig() {
    const workspace = loadWorkspace();
    const firstTable = workspace.database.tables[0];

    if (!builderConfig.fromTable && firstTable) {
        builderConfig.fromTable = firstTable.name;
        builderConfig.selectColumns = firstTable.columns.map(
            (column) => `${firstTable.name}.${column.name}`
        );
    }
}

function getAvailableTables() {
    return loadWorkspace().database.tables;
}

function getBuilderTables() {
    const workspace = loadWorkspace();
    const tables = [];

    const fromTable = getTableByName(workspace.database, builderConfig.fromTable);
    if (fromTable) tables.push(fromTable);

    builderConfig.joins.forEach((join) => {
        const table = getTableByName(workspace.database, join.table);
        if (table && !tables.some((item) => item.id === table.id)) tables.push(table);
    });

    return tables;
}

function getBuilderColumns() {
    return getBuilderTables().flatMap((table) =>
        table.columns.map((column) => `${table.name}.${column.name}`)
    );
}

function renderQueryBuilderForm() {
    const tables = getAvailableTables();
    const builderTables = getBuilderTables();
    const allColumns = getBuilderColumns();

    $("#builderForm").html(`
    <section class="clause-panel">
      <h2 class="clause-title">FROM</h2>
      <label class="form-label">Base Table</label>
      <select id="fromTableSelect" class="form-select">
        ${tables
            .map(
                (table) => `
            <option value="${table.name}" ${table.name === builderConfig.fromTable ? "selected" : ""
                    }>${escapeHtml(table.name)}</option>
          `
            )
            .join("")}
      </select>
    </section>

    <section class="clause-panel">
      <div class="d-flex justify-content-between gap-2 align-items-center mb-2">
        <h2 class="clause-title mb-0">SELECT</h2>
        <button class="btn-ghost" id="selectAllColumnsBtn">Select All</button>
      </div>

      <div class="checkbox-grid">
        ${allColumns.length
            ? allColumns
                .map(
                    (column) => `
                  <label class="form-check">
                    <input class="form-check-input select-column-check" type="checkbox" value="${escapeHtml(column)}" ${builderConfig.selectColumns.includes(column) ? "checked" : ""
                        }>
                    <span class="form-check-label">${escapeHtml(column)}</span>
                  </label>
                `
                )
                .join("")
            : renderEmptyState("No columns available.")
        }
      </div>
    </section>

    <section class="clause-panel">
      <div class="d-flex justify-content-between gap-2 align-items-center mb-2">
        <h2 class="clause-title mb-0">JOIN</h2>
        <button class="btn-ghost" id="addJoinBtn">Add Join</button>
      </div>

      <div id="joinRows">
        ${builderConfig.joins.length
            ? builderConfig.joins.map(renderJoinRow).join("")
            : renderEmptyState("No joins added.")
        }
      </div>
    </section>

    <section class="clause-panel">
      <div class="d-flex justify-content-between gap-2 align-items-center mb-2">
        <h2 class="clause-title mb-0">WHERE</h2>
        <button class="btn-ghost" id="addWhereBtn">Add Condition</button>
      </div>

      <div id="whereRows">
        ${builderConfig.whereConditions.length
            ? builderConfig.whereConditions.map(renderWhereRow).join("")
            : renderEmptyState("No filters added.")
        }
      </div>
    </section>

    <section class="clause-panel">
      <h2 class="clause-title">GROUP BY</h2>
      <div class="checkbox-grid">
        ${allColumns
            .map(
                (column) => `
            <label class="form-check">
              <input class="form-check-input group-column-check" type="checkbox" value="${escapeHtml(column)}" ${builderConfig.groupBy.includes(column) ? "checked" : ""
                    }>
              <span class="form-check-label">${escapeHtml(column)}</span>
            </label>
          `
            )
            .join("")}
      </div>
    </section>

    <section class="clause-panel">
      <h2 class="clause-title">ORDER BY</h2>
      <div class="builder-row">
        <select id="orderFieldSelect" class="form-select">
          <option value="">None</option>
          ${allColumns
            .map(
                (column) => `
              <option value="${column}" ${builderConfig.orderBy[0]?.field === column ? "selected" : ""
                    }>${escapeHtml(column)}</option>
            `
            )
            .join("")}
        </select>

        <select id="orderDirectionSelect" class="form-select">
          <option value="ASC" ${builderConfig.orderBy[0]?.direction === "ASC" ? "selected" : ""
        }>ASC</option>
          <option value="DESC" ${builderConfig.orderBy[0]?.direction === "DESC" ? "selected" : ""
        }>DESC</option>
        </select>
      </div>
    </section>
  `);
}

function renderJoinRow(join, index) {
    const tables = getAvailableTables();
    const columns = getBuilderColumns();

    return `
    <div class="builder-row join-row" data-index="${index}">
      <select class="form-select join-type">
        <option value="INNER" ${join.type === "INNER" ? "selected" : ""}>INNER</option>
        <option value="LEFT" ${join.type === "LEFT" ? "selected" : ""}>LEFT</option>
      </select>

      <select class="form-select join-table">
        <option value="">Join table</option>
        ${tables
            .map(
                (table) => `
            <option value="${table.name}" ${join.table === table.name ? "selected" : ""
                    }>${escapeHtml(table.name)}</option>
          `
            )
            .join("")}
      </select>

      <input class="form-control join-on" placeholder="customers.id = orders.customer_id" value="${escapeHtml(join.on || "")}">

      <button class="btn-ghost remove-join-btn">Remove</button>
    </div>
  `;
}

function renderWhereRow(condition, index) {
    const columns = getBuilderColumns();

    return `
    <div class="builder-row where-row" data-index="${index}">
      <select class="form-select where-logical">
        <option value="AND" ${condition.logical === "AND" ? "selected" : ""}>AND</option>
        <option value="OR" ${condition.logical === "OR" ? "selected" : ""}>OR</option>
      </select>

      <select class="form-select where-field">
        ${columns
            .map(
                (column) => `
            <option value="${column}" ${condition.field === column ? "selected" : ""
                    }>${escapeHtml(column)}</option>
          `
            )
            .join("")}
      </select>

      <select class="form-select where-operator">
        ${["=", ">", "<"]
            .map(
                (operator) => `
            <option value="${operator}" ${condition.operator === operator ? "selected" : ""
                    }>${escapeHtml(operator)}</option>
          `
            )
            .join("")}
      </select>

      <input class="form-control where-value" placeholder="Value" value="${escapeHtml(condition.value || "")}">

      <button class="btn-ghost remove-where-btn">Remove</button>
    </div>
  `;
}

function updateBuilderSelectColumns(columns) {
    builderConfig.selectColumns = columns;
    renderGeneratedSql();
}

function updateBuilderJoins(joins) {
    builderConfig.joins = joins;
    renderQueryBuilderForm();
    renderGeneratedSql();
}

function updateBuilderWhereConditions(conditions) {
    builderConfig.whereConditions = conditions;
    renderGeneratedSql();
}

function updateBuilderGroupBy(fields) {
    builderConfig.groupBy = fields;
    renderGeneratedSql();
}

function updateBuilderOrderBy(fields) {
    builderConfig.orderBy = fields;
    renderGeneratedSql();
}

function collectJoinRows() {
    const joins = [];

    $(".join-row").each(function () {
        joins.push({
            type: $(this).find(".join-type").val(),
            table: $(this).find(".join-table").val(),
            on: $(this).find(".join-on").val().trim()
        });
    });

    return joins;
}

function collectWhereRows() {
    const conditions = [];

    $(".where-row").each(function () {
        conditions.push({
            logical: $(this).find(".where-logical").val(),
            field: $(this).find(".where-field").val(),
            operator: $(this).find(".where-operator").val(),
            value: $(this).find(".where-value").val()
        });
    });

    return conditions;
}

function renderGeneratedSql() {
    const sql = generateSqlFromBuilderConfig(builderConfig);
    $("#generatedSql").val(sql);
}

function runBuiltQuery() {
    const sql = $("#generatedSql").val().trim();

    if (!sql) {
        showStatus("Build a query first.", "warning");
        return;
    }

    const workspace = loadWorkspace();
    const startedAt = performance.now();

    try {
        const parsed = parseSql(tokenizeSql(sql));
        const result = executeSql(workspace.database, parsed);
        const executionMs = Number((performance.now() - startedAt).toFixed(2));

        renderBuiltResults({ ...result, executionMs });
        showStatus(result.message, "success");
    } catch (error) {
        $("#builtQueryResults").html(`
      <div class="status-message status-danger position-static">
        ${escapeHtml(error.message)}
      </div>
    `);
        showStatus(error.message, "danger");
    }
}

function renderBuiltResults(result) {
    const rows = result.rows || [];

    if (!rows.length) {
        $("#builtQueryResults").html(renderEmptyState(result.message));
        return;
    }

    const columns = Object.keys(rows[0]);

    $("#builtQueryResults").html(`
    <div class="result-summary">${escapeHtml(result.message)} Execution time: ${escapeHtml(result.executionMs)}ms.</div>
    <div class="table-wrap">
      <table class="app-table">
        <thead>
          <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
                (row) => `
              <tr>
                ${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

function saveBuiltQuery(name) {
    const workspace = loadWorkspace();
    const generatedSql = $("#generatedSql").val().trim();

    if (!generatedSql) {
        showStatus("Build SQL before saving.", "warning");
        return;
    }

    workspace.savedQueries.unshift({
        id: generateId("qb"),
        name,
        builderConfig: cloneData(builderConfig),
        generatedSql,
        createdAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivityLog("Query Builder", "Saved query", `Saved query '${name}'.`);
    renderSavedQueries();
    showStatus("Query saved.", "success");
}

function copyGeneratedSql() {
    copyText($("#generatedSql").val(), "Generated SQL copied.");
}

function renderSavedQueries() {
    const workspace = loadWorkspace();

    $("#savedQueriesList").html(
        workspace.savedQueries.length
            ? workspace.savedQueries
                .map(
                    (query) => `
            <div class="saved-query-card">
              <strong>${escapeHtml(query.name)}</strong>
              <p class="history-query">${escapeHtml(query.generatedSql)}</p>
              <button class="btn-ghost load-saved-query-btn" data-query-id="${query.id}">Load</button>
            </div>
          `
                )
                .join("")
            : renderEmptyState("No saved queries yet.")
    );
}

function loadSavedQuery(id) {
    const workspace = loadWorkspace();
    const query = workspace.savedQueries.find((item) => item.id === id);

    if (!query) return;

    builderConfig = cloneData(query.builderConfig);
    renderQueryBuilderForm();
    renderGeneratedSql();
    showStatus("Saved query loaded.", "success");
}

function bindQueryBuilderEvents() {
    $(document).on("change", "#fromTableSelect", function () {
        builderConfig.fromTable = $(this).val();
        builderConfig.joins = [];
        builderConfig.whereConditions = [];
        builderConfig.groupBy = [];
        builderConfig.orderBy = [];
        builderConfig.selectColumns = [];

        const table = getTableByName(loadWorkspace().database, builderConfig.fromTable);
        if (table) {
            builderConfig.selectColumns = table.columns.map(
                (column) => `${table.name}.${column.name}`
            );
        }

        renderQueryBuilderForm();
        renderGeneratedSql();
    });

    $(document).on("change", ".select-column-check", function () {
        updateBuilderSelectColumns(
            $(".select-column-check:checked")
                .map(function () {
                    return $(this).val();
                })
                .get()
        );
    });

    $(document).on("click", "#selectAllColumnsBtn", function () {
        builderConfig.selectColumns = getBuilderColumns();
        renderQueryBuilderForm();
        renderGeneratedSql();
    });

    $(document).on("click", "#addJoinBtn", function () {
        builderConfig.joins.push({
            type: "INNER",
            table: "",
            on: ""
        });
        renderQueryBuilderForm();
    });

    $(document).on("change input", ".join-type, .join-table, .join-on", function () {
        updateBuilderJoins(collectJoinRows());
    });

    $(document).on("click", ".remove-join-btn", function () {
        const index = Number($(this).closest(".join-row").data("index"));
        builderConfig.joins.splice(index, 1);
        renderQueryBuilderForm();
        renderGeneratedSql();
    });

    $(document).on("click", "#addWhereBtn", function () {
        const firstColumn = getBuilderColumns()[0] || "";
        builderConfig.whereConditions.push({
            logical: "AND",
            field: firstColumn,
            operator: "=",
            value: ""
        });
        renderQueryBuilderForm();
        renderGeneratedSql();
    });

    $(document).on("change input", ".where-logical, .where-field, .where-operator, .where-value", function () {
        updateBuilderWhereConditions(collectWhereRows());
    });

    $(document).on("click", ".remove-where-btn", function () {
        const index = Number($(this).closest(".where-row").data("index"));
        builderConfig.whereConditions.splice(index, 1);
        renderQueryBuilderForm();
        renderGeneratedSql();
    });

    $(document).on("change", ".group-column-check", function () {
        updateBuilderGroupBy(
            $(".group-column-check:checked")
                .map(function () {
                    return $(this).val();
                })
                .get()
        );
    });

    $(document).on("change", "#orderFieldSelect, #orderDirectionSelect", function () {
        const field = $("#orderFieldSelect").val();

        updateBuilderOrderBy(
            field
                ? [
                    {
                        field,
                        direction: $("#orderDirectionSelect").val()
                    }
                ]
                : []
        );
    });

    $(document).on("click", "#runBuiltQueryBtn", runBuiltQuery);
    $(document).on("click", "#copyBuiltSqlBtn", copyGeneratedSql);

    $(document).on("click", "#saveBuiltQueryBtn", function () {
        const name = prompt("Query name?", "Saved visual query");
        if (!name) return;

        saveBuiltQuery(name.trim());
    });

    $(document).on("click", ".load-saved-query-btn", function () {
        loadSavedQuery($(this).data("query-id"));
    });
}

$(document).ready(renderQueryBuilderPage);