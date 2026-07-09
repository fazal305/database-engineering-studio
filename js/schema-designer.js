let selectedTableId = null;

function renderSchemaDesigner() {
  const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">Schema Designer</span>
        <h1 class="page-title">Design relational schemas visually</h1>
        <p class="page-description">
          Create tables, columns, primary keys, foreign keys, and export or import real CREATE TABLE SQL.
        </p>
      </div>
    </header>

    <div class="schema-toolbar">
      <button class="btn-app" id="addTableBtn">Add Table</button>
      <button class="btn-ghost" id="exportSqlBtn">Export SQL</button>
      <button class="btn-ghost" id="importSqlBtn">Import SQL</button>
    </div>

    <div class="schema-layout">
      <section class="card-panel panel-padding">
        <div id="schemaCanvas" class="er-canvas"></div>
      </section>

      <aside class="schema-side">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Selected Table</h2>
          <div id="tableEditor"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Starter Templates</h2>
          <div id="templateList" class="template-grid"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">SQL Output / Import</h2>
          <textarea id="schemaSqlBox" class="code-box schema-sql-box" placeholder="Exported or imported CREATE TABLE SQL appears here..."></textarea>
        </section>
      </aside>
    </div>
  `;

  $("#app").html(renderShell("schema-designer", content));
  bindSchemaEvents();
  renderSchemaCanvas();
  renderTableEditor();
  renderTemplateList();
  setActiveNav();
}

function renderSchemaCanvas() {
  const workspace = loadWorkspace();
  renderErDiagram(workspace.database, "#schemaCanvas");
  enableDragging();
}

function createTable(name, position) {
  const workspace = loadWorkspace();
  const now = new Date().toISOString();

  const table = {
    id: generateId("table"),
    name,
    position,
    columns: [
      {
        id: generateId("col"),
        name: "id",
        type: "INTEGER",
        primaryKey: true,
        nullable: false,
        foreignKey: null
      }
    ],
    rows: [],
    createdAt: now,
    updatedAt: now
  };

  workspace.database.tables.push(table);
  saveWorkspace(workspace);
  selectedTableId = table.id;
  addActivityLog("Schema Designer", "Created table", `Created table '${name}'.`);
  renderSchemaCanvas();
  renderTableEditor();
}

function moveTable(id, position) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, id);

  if (!table) return;

  table.position = position;
  table.updatedAt = new Date().toISOString();
  saveWorkspace(workspace);
}

function addColumn(tableId) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, tableId);

  if (!table) return;

  table.columns.push({
    id: generateId("col"),
    name: `column_${table.columns.length + 1}`,
    type: "TEXT",
    primaryKey: false,
    nullable: true,
    foreignKey: null
  });

  table.updatedAt = new Date().toISOString();
  saveWorkspace(workspace);
  renderSchemaCanvas();
  renderTableEditor();
}

function removeColumn(tableId, columnId) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, tableId);
  const column = table?.columns.find((item) => item.id === columnId);

  if (!table || !column) return;

  const isReferenced = workspace.database.relationships.some(
    (relationship) =>
      relationship.toTableId === tableId && relationship.toColumn === column.name
  );

  if (isReferenced && !confirm("This column is referenced by a foreign key. Delete anyway?")) {
    return;
  }

  table.columns = table.columns.filter((item) => item.id !== columnId);
  table.updatedAt = new Date().toISOString();

  workspace.database.relationships = workspace.database.relationships.filter(
    (relationship) =>
      !(
        relationship.fromTableId === tableId && relationship.fromColumn === column.name
      ) &&
      !(relationship.toTableId === tableId && relationship.toColumn === column.name)
  );

  saveWorkspace(workspace);
  renderSchemaCanvas();
  renderTableEditor();
}

function updateColumn(tableId, columnId, field, value) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, tableId);
  const column = table?.columns.find((item) => item.id === columnId);

  if (!table || !column) return;

  if (field === "primaryKey" || field === "nullable") {
    column[field] = Boolean(value);
  } else {
    column[field] = value;
  }

  table.updatedAt = new Date().toISOString();
  saveWorkspace(workspace);
  renderSchemaCanvas();
}

function setForeignKey(tableId, columnId, targetTableId, targetColumnName) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, tableId);
  const column = table?.columns.find((item) => item.id === columnId);

  if (!table || !column) return;

  workspace.database.relationships = workspace.database.relationships.filter(
    (relationship) =>
      !(relationship.fromTableId === tableId && relationship.fromColumn === column.name)
  );

  if (!targetTableId || !targetColumnName) {
    column.foreignKey = null;
  } else {
    const targetTable = getTableById(workspace.database, targetTableId);

    column.foreignKey = {
      tableId: targetTableId,
      columnName: targetColumnName
    };

    workspace.database.relationships.push({
      id: generateId("rel"),
      name: `${table.name}_${targetTable.name}`,
      fromTableId: table.id,
      fromColumn: column.name,
      toTableId: targetTable.id,
      toColumn: targetColumnName,
      cardinality: "many-to-one",
      createdAt: new Date().toISOString()
    });
  }

  table.updatedAt = new Date().toISOString();
  saveWorkspace(workspace);
  renderSchemaCanvas();
  renderTableEditor();
}

function deleteTable(id) {
  const workspace = loadWorkspace();
  const table = getTableById(workspace.database, id);

  if (!table) return;

  const isReferenced = workspace.database.relationships.some(
    (relationship) => relationship.toTableId === id || relationship.fromTableId === id
  );

  if (isReferenced && !confirm("This table has relationships. Delete it and related foreign keys?")) {
    return;
  }

  workspace.database.tables = workspace.database.tables.filter((item) => item.id !== id);
  workspace.database.relationships = workspace.database.relationships.filter(
    (relationship) => relationship.toTableId !== id && relationship.fromTableId !== id
  );

  workspace.database.tables.forEach((item) => {
    item.columns.forEach((column) => {
      if (column.foreignKey?.tableId === id) column.foreignKey = null;
    });
  });

  selectedTableId = null;
  saveWorkspace(workspace);
  addActivityLog("Schema Designer", "Deleted table", `Deleted table '${table.name}'.`);
  renderSchemaCanvas();
  renderTableEditor();
}

function exportSchemaSql() {
  const workspace = loadWorkspace();
  const sql = exportSchemaAsSql(workspace.database);

  $("#schemaSqlBox").val(sql);
  showStatus("Schema SQL exported.", "success");
}

function importSchemaSql(sqlText) {
  try {
    const workspace = loadWorkspace();
    const imported = importSqlAsSchema(sqlText);

    workspace.database = imported;
    saveWorkspace(workspace);
    addActivityLog("Schema Designer", "Imported SQL schema", "Imported CREATE TABLE SQL into schema state.");
    selectedTableId = workspace.database.tables[0]?.id || null;
    renderSchemaCanvas();
    renderTableEditor();
    showStatus("SQL schema imported.", "success");
  } catch (error) {
    showStatus(error.message, "danger");
  }
}

function applySchemaTemplate(templateId) {
  const template = schemaTemplates.find((item) => item.id === templateId);

  if (!template) return;

  if (!confirm(`Apply '${template.name}' template? This replaces the current schema.`)) {
    return;
  }

  const workspace = loadWorkspace();
  const next = buildWorkspaceFromTemplate(template);

  workspace.database = next.database;
  saveWorkspace(workspace);
  addActivityLog("Schema Designer", "Applied template", `Applied '${template.name}' schema template.`);
  selectedTableId = workspace.database.tables[0]?.id || null;
  renderSchemaCanvas();
  renderTableEditor();
}

function renderTemplateList() {
  $("#templateList").html(
    schemaTemplates
      .map(
        (template) => `
        <button class="template-card text-start" data-template-id="${template.id}">
          <strong>${escapeHtml(template.name)}</strong>
          <p class="card-text mb-0">${escapeHtml(template.description)}</p>
        </button>
      `
      )
      .join("")
  );
}

function renderTableEditor() {
  const workspace = loadWorkspace();
  const table = selectedTableId
    ? getTableById(workspace.database, selectedTableId)
    : workspace.database.tables[0];

  if (!table) {
    $("#tableEditor").html(renderEmptyState("Create a table to begin."));
    return;
  }

  selectedTableId = table.id;

  const tableOptions = workspace.database.tables
    .filter((item) => item.id !== table.id)
    .map(
      (item) =>
        `<option value="${item.id}">${escapeHtml(item.name)}</option>`
    )
    .join("");

  $("#tableEditor").html(`
    <div class="mb-3">
      <label class="form-label">Table Name</label>
      <input class="form-control" id="tableNameInput" value="${escapeHtml(table.name)}">
    </div>

    <div class="schema-mini-actions mb-3">
      <button class="btn-app" id="addColumnBtn">Add Column</button>
      <button class="btn-ghost" id="deleteTableBtn">Delete Table</button>
    </div>

    <div class="column-editor">
      ${table.columns
        .map((column) => {
          const fkTable = column.foreignKey?.tableId || "";
          const targetColumns = fkTable
            ? getTableById(workspace.database, fkTable)?.columns || []
            : [];

          return `
            <div class="column-editor-row" data-column-id="${column.id}">
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label">Column</label>
                  <input class="form-control column-field" data-field="name" value="${escapeHtml(column.name)}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type</label>
                  <select class="form-select column-field" data-field="type">
                    ${["INTEGER", "TEXT", "REAL", "BOOLEAN", "DATE"]
                      .map(
                        (type) =>
                          `<option value="${type}" ${
                            column.type === type ? "selected" : ""
                          }>${type}</option>`
                      )
                      .join("")}
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Foreign Key Table</label>
                  <select class="form-select fk-table">
                    <option value="">None</option>
                    ${tableOptions.replace(
                      `value="${fkTable}"`,
                      `value="${fkTable}" selected`
                    )}
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Foreign Key Column</label>
                  <select class="form-select fk-column">
                    <option value="">None</option>
                    ${targetColumns
                      .map(
                        (targetColumn) =>
                          `<option value="${targetColumn.name}" ${
                            column.foreignKey?.columnName === targetColumn.name
                              ? "selected"
                              : ""
                          }>${escapeHtml(targetColumn.name)}</option>`
                      )
                      .join("")}
                  </select>
                </div>
                <div class="col-12 d-flex flex-wrap gap-3 align-items-center mt-2">
                  <label class="form-check">
                    <input class="form-check-input column-check" data-field="primaryKey" type="checkbox" ${
                      column.primaryKey ? "checked" : ""
                    }>
                    <span class="form-check-label">Primary Key</span>
                  </label>
                  <label class="form-check">
                    <input class="form-check-input column-check" data-field="nullable" type="checkbox" ${
                      column.nullable ? "checked" : ""
                    }>
                    <span class="form-check-label">Nullable</span>
                  </label>
                  <button class="btn-ghost remove-column-btn ms-auto">Remove</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `);
}

function enableDragging() {
  let draggingId = null;
  let offsetX = 0;
  let offsetY = 0;

  $(".table-node-header").on("mousedown", function (event) {
    const node = $(this).closest(".table-node");
    draggingId = node.data("table-id");
    selectedTableId = draggingId;

    offsetX = event.pageX - node.position().left;
    offsetY = event.pageY - node.position().top;

    renderTableEditor();
  });

  $(document)
    .off("mousemove.schemaDrag")
    .on("mousemove.schemaDrag", function (event) {
      if (!draggingId) return;

      const canvasOffset = $("#schemaCanvas").offset();
      const x = Math.max(20, event.pageX - canvasOffset.left - offsetX);
      const y = Math.max(20, event.pageY - canvasOffset.top - offsetY);

      $(`[data-table-id="${draggingId}"]`).css({ left: x, top: y });
    })
    .off("mouseup.schemaDrag")
    .on("mouseup.schemaDrag", function () {
      if (!draggingId) return;

      const node = $(`[data-table-id="${draggingId}"]`);
      moveTable(draggingId, {
        x: parseInt(node.css("left"), 10),
        y: parseInt(node.css("top"), 10)
      });

      draggingId = null;
      renderSchemaCanvas();
    });

  $(".table-node").on("click", function () {
    selectedTableId = $(this).data("table-id");
    renderTableEditor();
  });
}

function bindSchemaEvents() {
  $(document).on("click", "#addTableBtn", function () {
    const name = prompt("Table name?", `table_${Date.now().toString().slice(-4)}`);
    if (!name) return;

    createTable(name.trim(), { x: 90, y: 90 });
  });

  $(document).on("click", "#exportSqlBtn", exportSchemaSql);

  $(document).on("click", "#importSqlBtn", function () {
    const sqlText = $("#schemaSqlBox").val().trim();

    if (!sqlText) {
      showStatus("Paste CREATE TABLE SQL first.", "warning");
      return;
    }

    importSchemaSql(sqlText);
  });

  $(document).on("click", ".template-card", function () {
    applySchemaTemplate($(this).data("template-id"));
  });

  $(document).on("input", "#tableNameInput", function () {
    const workspace = loadWorkspace();
    const table = getTableById(workspace.database, selectedTableId);

    if (!table) return;

    table.name = $(this).val().trim() || table.name;
    table.updatedAt = new Date().toISOString();
    saveWorkspace(workspace);
    renderSchemaCanvas();
  });

  $(document).on("click", "#addColumnBtn", function () {
    addColumn(selectedTableId);
  });

  $(document).on("click", "#deleteTableBtn", function () {
    deleteTable(selectedTableId);
  });

  $(document).on("input change", ".column-field", function () {
    const columnId = $(this).closest(".column-editor-row").data("column-id");
    updateColumn(selectedTableId, columnId, $(this).data("field"), $(this).val());
  });

  $(document).on("change", ".column-check", function () {
    const columnId = $(this).closest(".column-editor-row").data("column-id");
    updateColumn(selectedTableId, columnId, $(this).data("field"), $(this).is(":checked"));
  });

  $(document).on("click", ".remove-column-btn", function () {
    const columnId = $(this).closest(".column-editor-row").data("column-id");
    removeColumn(selectedTableId, columnId);
  });

  $(document).on("change", ".fk-table", function () {
    renderTableEditor();
  });

  $(document).on("change", ".fk-column", function () {
    const row = $(this).closest(".column-editor-row");
    const columnId = row.data("column-id");
    const targetTableId = row.find(".fk-table").val();
    const targetColumnName = $(this).val();

    setForeignKey(selectedTableId, columnId, targetTableId, targetColumnName);
  });
}

$(document).ready(renderSchemaDesigner);