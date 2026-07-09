let joinState = {
    leftTableId: "",
    rightTableId: "",
    joinType: "INNER",
    relation: null,
    leftIndex: 0,
    rightIndex: 0,
    matchedRows: [],
    playing: false,
    timer: null
};

function renderRelationalVisualizer() {
    const workspace = loadWorkspace();
    const tableOptions = workspace.database.tables
        .map((table) => `<option value="${table.id}">${escapeHtml(table.name)}</option>`)
        .join("");

    const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">Relational Visualizer</span>
        <h1 class="page-title">See how joins connect real rows</h1>
        <p class="page-description">
          Pick related tables and step through the actual row-matching process using the current schema and data.
        </p>
      </div>
    </header>

    <div class="visualizer-layout">
      <aside class="visualizer-controls">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Relationship Chain</h2>
          <label class="form-label">Starting Table</label>
          <select id="chainStartTable" class="form-select mb-3">
            ${tableOptions}
          </select>
          <button id="renderChainBtn" class="btn-app w-100">Render Chain</button>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Join Animation</h2>

          <label class="form-label">Left Table</label>
          <select id="leftTableSelect" class="form-select mb-3">
            ${tableOptions}
          </select>

          <label class="form-label">Right Table</label>
          <select id="rightTableSelect" class="form-select mb-3">
            ${tableOptions}
          </select>

          <label class="form-label">Join Type</label>
          <select id="joinTypeSelect" class="form-select mb-3">
            <option value="INNER">INNER JOIN</option>
            <option value="LEFT">LEFT JOIN</option>
          </select>

          <button id="prepareJoinBtn" class="btn-app w-100">Prepare Animation</button>

          <div class="animation-controls">
            <button id="stepJoinBtn" class="btn-ghost">Step</button>
            <button id="playJoinBtn" class="btn-ghost">Play</button>
            <button id="pauseJoinBtn" class="btn-ghost">Pause</button>
          </div>
        </section>
      </aside>

      <main class="d-grid gap-3">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Relationship Chain</h2>
          <div id="relationshipChain" class="relationship-chain"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Join Animation Stage</h2>
          <div id="joinAnimationStage"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Final Joined Result</h2>
          <div id="joinedResult"></div>
        </section>
      </main>
    </div>
  `;

    $("#app").html(renderShell("relational-visualizer", content));
    bindVisualizerEvents();

    const firstTable = workspace.database.tables[0];
    if (firstTable) renderRelationshipChain(firstTable.id);

    setActiveNav();
}

function findRelationBetween(database, leftTableId, rightTableId) {
    return database.relationships.find(
        (rel) =>
            (rel.fromTableId === leftTableId && rel.toTableId === rightTableId) ||
            (rel.fromTableId === rightTableId && rel.toTableId === leftTableId)
    );
}

function renderRelationshipChain(startTableId) {
    const workspace = loadWorkspace();
    const database = workspace.database;
    const startTable = getTableById(database, startTableId);

    if (!startTable) {
        $("#relationshipChain").html(renderEmptyState("No table selected."));
        return;
    }

    const visited = new Set();
    const chain = [];

    function walk(table) {
        if (!table || visited.has(table.id)) return;

        visited.add(table.id);
        chain.push(table);

        database.relationships
            .filter((rel) => rel.fromTableId === table.id || rel.toTableId === table.id)
            .forEach((rel) => {
                const nextId = rel.fromTableId === table.id ? rel.toTableId : rel.fromTableId;
                walk(getTableById(database, nextId));
            });
    }

    walk(startTable);

    $("#relationshipChain").html(`
    <div class="d-flex flex-wrap gap-3 align-items-stretch">
      ${chain
            .map(
                (table, index) => `
          ${index > 0 ? `<div class="chain-arrow">→</div>` : ""}
          <div class="chain-node">
            <span class="card-kicker">${escapeHtml(table.columns.length)} columns</span>
            <h3 class="card-title">${escapeHtml(table.name)}</h3>
            <p class="card-text mb-0">${escapeHtml(table.rows.length)} real rows in localStorage.</p>
          </div>
        `
            )
            .join("")}
    </div>
  `);
}

function renderJoinAnimation(leftTableId, rightTableId, joinType) {
    const workspace = loadWorkspace();
    const database = workspace.database;
    const leftTable = getTableById(database, leftTableId);
    const rightTable = getTableById(database, rightTableId);
    const relation = findRelationBetween(database, leftTableId, rightTableId);

    if (!leftTable || !rightTable) {
        $("#joinAnimationStage").html(renderEmptyState("Pick two tables first."));
        return;
    }

    if (!relation) {
        $("#joinAnimationStage").html(renderEmptyState("These tables do not have a saved relationship."));
        return;
    }

    joinState = {
        leftTableId,
        rightTableId,
        joinType,
        relation,
        leftIndex: 0,
        rightIndex: 0,
        matchedRows: [],
        playing: false,
        timer: null
    };

    renderJoinStage();
    renderFinalJoinedResult([]);
}

function getJoinFieldNames(leftTableId, rightTableId, relation) {
    if (relation.fromTableId === leftTableId) {
        return {
            leftField: relation.fromColumn,
            rightField: relation.toColumn
        };
    }

    return {
        leftField: relation.toColumn,
        rightField: relation.fromColumn
    };
}

function renderJoinStage() {
    const workspace = loadWorkspace();
    const database = workspace.database;
    const leftTable = getTableById(database, joinState.leftTableId);
    const rightTable = getTableById(database, joinState.rightTableId);

    if (!leftTable || !rightTable) return;

    const fields = getJoinFieldNames(leftTable.id, rightTable.id, joinState.relation);
    const currentLeft = leftTable.rows[joinState.leftIndex];
    const currentRight = rightTable.rows[joinState.rightIndex];

    $("#joinAnimationStage").html(`
    <p class="card-text">
      Matching <strong>${escapeHtml(leftTable.name)}.${escapeHtml(fields.leftField)}</strong>
      with <strong>${escapeHtml(rightTable.name)}.${escapeHtml(fields.rightField)}</strong>.
    </p>

    <div class="join-stage">
      <div class="join-table-card">
        <h3 class="card-title">${escapeHtml(leftTable.name)}</h3>
        ${leftTable.rows
            .map(
                (row, index) => `
            <div class="join-row ${index === joinState.leftIndex ? "highlight-current" : ""}">
              ${escapeHtml(JSON.stringify(row))}
            </div>
          `
            )
            .join("")}
      </div>

      <div class="join-table-card">
        <h3 class="card-title">${escapeHtml(rightTable.name)}</h3>
        ${rightTable.rows
            .map((row, index) => {
                const isChecking = index === joinState.rightIndex;
                const isMatch =
                    currentLeft &&
                    currentRight &&
                    isChecking &&
                    String(currentLeft[fields.leftField]) === String(row[fields.rightField]);

                return `
              <div class="join-row ${isChecking ? (isMatch ? "highlight-match" : "highlight-unmatched") : ""
                    }">
                ${escapeHtml(JSON.stringify(row))}
              </div>
            `;
            })
            .join("")}
      </div>
    </div>
  `);
}

function stepJoinAnimation() {
    const workspace = loadWorkspace();
    const database = workspace.database;
    const leftTable = getTableById(database, joinState.leftTableId);
    const rightTable = getTableById(database, joinState.rightTableId);

    if (!leftTable || !rightTable || !joinState.relation) return;

    const fields = getJoinFieldNames(leftTable.id, rightTable.id, joinState.relation);
    const leftRow = leftTable.rows[joinState.leftIndex];
    const rightRow = rightTable.rows[joinState.rightIndex];

    if (!leftRow) {
        pauseJoinAnimation();
        renderFinalJoinedResult(joinState.matchedRows);
        showStatus("Join animation complete.", "success");
        return;
    }

    if (rightRow && String(leftRow[fields.leftField]) === String(rightRow[fields.rightField])) {
        joinState.matchedRows.push({
            ...prefixRow(leftTable.name, leftRow),
            ...prefixRow(rightTable.name, rightRow)
        });
    }

    joinState.rightIndex++;

    if (joinState.rightIndex >= rightTable.rows.length) {
        const hasMatch = rightTable.rows.some(
            (row) => String(leftRow[fields.leftField]) === String(row[fields.rightField])
        );

        if (!hasMatch && joinState.joinType === "LEFT") {
            joinState.matchedRows.push(prefixRow(leftTable.name, leftRow));
        }

        joinState.rightIndex = 0;
        joinState.leftIndex++;
    }

    renderJoinStage();
    renderFinalJoinedResult(joinState.matchedRows);
}

function prefixRow(tableName, row) {
    const output = {};

    Object.keys(row).forEach((key) => {
        if (key !== "_id") output[`${tableName}.${key}`] = row[key];
    });

    return output;
}

function playJoinAnimation() {
    if (joinState.playing) return;

    joinState.playing = true;
    joinState.timer = setInterval(stepJoinAnimation, 850);
}

function pauseJoinAnimation() {
    joinState.playing = false;
    clearInterval(joinState.timer);
}

function renderFinalJoinedResult(rows) {
    if (!rows.length) {
        $("#joinedResult").html(renderEmptyState("No joined rows yet. Step through the animation."));
        return;
    }

    const columns = Object.keys(rows[0]);

    $("#joinedResult").html(`
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

function bindVisualizerEvents() {
    $(document).on("click", "#renderChainBtn", function () {
        renderRelationshipChain($("#chainStartTable").val());
    });

    $(document).on("click", "#prepareJoinBtn", function () {
        renderJoinAnimation(
            $("#leftTableSelect").val(),
            $("#rightTableSelect").val(),
            $("#joinTypeSelect").val()
        );
    });

    $(document).on("click", "#stepJoinBtn", stepJoinAnimation);
    $(document).on("click", "#playJoinBtn", playJoinAnimation);
    $(document).on("click", "#pauseJoinBtn", pauseJoinAnimation);
}

$(document).ready(renderRelationalVisualizer);