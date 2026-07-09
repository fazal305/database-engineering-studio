let normalizationState = {
    rawRows: [],
    functionalDependencies: [],
    steps: {
        firstNormalForm: { tables: [] },
        secondNormalForm: { tables: [] },
        thirdNormalForm: { tables: [] }
    },
    activeStep: "raw"
};

function renderNormalizationStudio() {
    const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">Normalization Studio</span>
        <h1 class="page-title">Normalize messy data step by step</h1>
        <p class="page-description">
          Paste denormalized JSON rows, manually declare functional dependencies, then run real 1NF, 2NF, and 3NF transformations.
          FD discovery is not guessed automatically because reliable dependency discovery needs human domain knowledge.
        </p>
      </div>
    </header>

    <div class="normalization-layout">
      <aside class="normalization-controls">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Messy Table JSON</h2>
          <textarea id="messyJsonInput" class="code-box" placeholder='[{"order_id":1001,"product_ids":"1,2"}]'></textarea>
          <div class="sql-actions mt-3">
            <button class="btn-app" id="loadMessyTableBtn">Load Table</button>
            <button class="btn-ghost" id="saveNormProjectBtn">Save Project</button>
          </div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Sample Messy Tables</h2>
          <div id="sampleMessyTables" class="d-grid gap-2"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Functional Dependencies</h2>
          <p class="card-text">
            Example: <strong>customer_id</strong> determines <strong>customer_name, customer_email</strong>.
          </p>

          <label class="form-label">Determinant columns</label>
          <input id="fdDeterminantInput" class="form-control mb-2" placeholder="customer_id">

          <label class="form-label">Dependent columns</label>
          <input id="fdDependentInput" class="form-control mb-3" placeholder="customer_name, customer_email">

          <button class="btn-app w-100" id="addFdBtn">Add Dependency</button>

          <div id="fdList" class="fd-list mt-3"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Run Steps</h2>
          <div class="d-grid gap-2">
            <button class="btn-ghost" id="run1nfBtn">Run 1NF</button>
            <button class="btn-ghost" id="run2nfBtn">Run 2NF</button>
            <button class="btn-ghost" id="run3nfBtn">Run 3NF</button>
          </div>
        </section>
      </aside>

      <main class="d-grid gap-3 align-content-start">
        <section class="card-panel panel-padding">
          <h2 class="card-title">Step Timeline</h2>
          <div id="stepTimeline"></div>
        </section>

        <section class="card-panel panel-padding">
          <h2 class="card-title">Normalization Output</h2>
          <div id="normalizationOutput"></div>
        </section>
      </main>
    </div>
  `;

    $("#app").html(renderShell("normalization-studio", content));
    renderSampleMessyTables();
    renderFunctionalDependencies();
    renderStepTimeline();
    renderNormalizationStep("raw", [{ name: "raw_messy_table", rows: normalizationState.rawRows }]);
    bindNormalizationEvents();
    setActiveNav();
}

function loadMessyTable(rawJson) {
    try {
        const rows = JSON.parse(rawJson);

        if (!Array.isArray(rows)) {
            throw new Error("Messy table must be a JSON array of row objects.");
        }

        normalizationState.rawRows = rows;
        normalizationState.steps = {
            firstNormalForm: { tables: [] },
            secondNormalForm: { tables: [] },
            thirdNormalForm: { tables: [] }
        };
        normalizationState.activeStep = "raw";

        renderStepTimeline();
        renderNormalizationStep("raw", [{ name: "raw_messy_table", rows }]);
        showStatus("Messy table loaded.", "success");
    } catch (error) {
        showStatus(error.message, "danger");
    }
}

function addFunctionalDependency(determinant, dependent) {
    if (!determinant.length || !dependent.length) {
        showStatus("Add determinant and dependent columns first.", "warning");
        return;
    }

    normalizationState.functionalDependencies.push({
        id: generateId("fd"),
        determinant,
        dependent
    });

    renderFunctionalDependencies();
    showStatus("Functional dependency added.", "success");
}

function removeFunctionalDependency(id) {
    normalizationState.functionalDependencies =
        normalizationState.functionalDependencies.filter((dependency) => dependency.id !== id);

    renderFunctionalDependencies();
}

function runFirstNormalForm() {
    if (!normalizationState.rawRows.length) {
        showStatus("Load a messy table first.", "warning");
        return;
    }

    normalizationState.steps.firstNormalForm.tables =
        flattenToFirstNormalForm(normalizationState.rawRows);

    normalizationState.activeStep = "firstNormalForm";
    renderStepTimeline();
    renderNormalizationStep("1NF", normalizationState.steps.firstNormalForm.tables);
}

function runSecondNormalForm() {
    if (!normalizationState.steps.firstNormalForm.tables.length) {
        runFirstNormalForm();
    }

    const firstTable = normalizationState.steps.firstNormalForm.tables[0];

    normalizationState.steps.secondNormalForm.tables = decomposeToSecondNormalForm(
        firstTable,
        normalizationState.functionalDependencies
    );

    normalizationState.activeStep = "secondNormalForm";
    renderStepTimeline();
    renderNormalizationStep("2NF", normalizationState.steps.secondNormalForm.tables);
}

function runThirdNormalForm() {
    if (!normalizationState.steps.secondNormalForm.tables.length) {
        runSecondNormalForm();
    }

    normalizationState.steps.thirdNormalForm.tables = decomposeToThirdNormalForm(
        normalizationState.steps.secondNormalForm.tables,
        normalizationState.functionalDependencies
    );

    normalizationState.activeStep = "thirdNormalForm";
    renderStepTimeline();
    renderNormalizationStep("3NF", normalizationState.steps.thirdNormalForm.tables);
}

function renderNormalizationStep(stepName, tables) {
    $("#normalizationOutput").html(
        tables?.length
            ? tables.map(renderNormTable).join("")
            : renderEmptyState("No normalization output yet.")
    );
}

function renderNormTable(table) {
    const rows = table.rows || [];
    const columns = Object.keys(rows[0] || {});

    return `
    <div class="norm-table-card mb-3">
      <div class="d-flex justify-content-between gap-2 align-items-start mb-2">
        <div>
          <span class="card-kicker">${escapeHtml(table.name)}</span>
          <h3 class="card-title">${escapeHtml(rows.length)} rows</h3>
        </div>
      </div>

      ${table.explanation ? `<p class="card-text">${escapeHtml(table.explanation)}</p>` : ""}

      ${rows.length
            ? `
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
        `
            : renderEmptyState("This table has no rows.")
        }
    </div>
  `;
}

function renderStepTimeline() {
    const steps = [
        { id: "raw", label: "Raw" },
        { id: "firstNormalForm", label: "1NF" },
        { id: "secondNormalForm", label: "2NF" },
        { id: "thirdNormalForm", label: "3NF" }
    ];

    $("#stepTimeline").html(`
    <div class="timeline-pills">
      ${steps
            .map(
                (step) => `
          <button class="timeline-pill ${normalizationState.activeStep === step.id ? "active" : ""
                    }" data-step-id="${step.id}">
            ${escapeHtml(step.label)}
          </button>
        `
            )
            .join("")}
    </div>
  `);
}

function applySampleMessyTable(sampleId) {
    const sample = normalizationSamples.find((item) => item.id === sampleId);

    if (!sample) return;

    normalizationState.rawRows = cloneData(sample.rawRows);
    normalizationState.functionalDependencies = cloneData(sample.functionalDependencies);
    normalizationState.steps = {
        firstNormalForm: { tables: [] },
        secondNormalForm: { tables: [] },
        thirdNormalForm: { tables: [] }
    };
    normalizationState.activeStep = "raw";

    $("#messyJsonInput").val(JSON.stringify(sample.rawRows, null, 2));
    renderFunctionalDependencies();
    renderStepTimeline();
    renderNormalizationStep("raw", [{ name: sample.name, rows: sample.rawRows }]);
    showStatus("Sample messy table loaded.", "success");
}

function saveNormalizationProject(name) {
    const workspace = loadWorkspace();

    if (!normalizationState.rawRows.length) {
        showStatus("Load a messy table before saving.", "warning");
        return;
    }

    workspace.normalizationProjects.unshift({
        id: generateId("norm"),
        name,
        rawRows: cloneData(normalizationState.rawRows),
        functionalDependencies: cloneData(normalizationState.functionalDependencies),
        steps: cloneData(normalizationState.steps),
        createdAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivityLog("Normalization Studio", "Saved project", `Saved normalization project '${name}'.`);
    showStatus("Normalization project saved.", "success");
}

function renderSampleMessyTables() {
    $("#sampleMessyTables").html(
        normalizationSamples
            .map(
                (sample) => `
        <button class="sample-table-card text-start" data-sample-id="${sample.id}">
          <strong>${escapeHtml(sample.name)}</strong>
          <p class="card-text mb-0">${escapeHtml(sample.description)}</p>
        </button>
      `
            )
            .join("")
    );
}

function renderFunctionalDependencies() {
    $("#fdList").html(
        normalizationState.functionalDependencies.length
            ? normalizationState.functionalDependencies
                .map(
                    (dependency) => `
            <div class="fd-item">
              <strong>${escapeHtml(dependency.determinant.join(", "))}</strong>
              <span class="card-text"> determines </span>
              <strong>${escapeHtml(dependency.dependent.join(", "))}</strong>
              <button class="btn-ghost remove-fd-btn mt-2" data-fd-id="${dependency.id}">Remove</button>
            </div>
          `
                )
                .join("")
            : renderEmptyState("No functional dependencies added.")
    );
}

function bindNormalizationEvents() {
    $(document).on("click", "#loadMessyTableBtn", function () {
        loadMessyTable($("#messyJsonInput").val().trim());
    });

    $(document).on("click", ".sample-table-card", function () {
        applySampleMessyTable($(this).data("sample-id"));
    });

    $(document).on("click", "#addFdBtn", function () {
        const determinant = $("#fdDeterminantInput")
            .val()
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        const dependent = $("#fdDependentInput")
            .val()
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        addFunctionalDependency(determinant, dependent);
        $("#fdDeterminantInput").val("");
        $("#fdDependentInput").val("");
    });

    $(document).on("click", ".remove-fd-btn", function () {
        removeFunctionalDependency($(this).data("fd-id"));
    });

    $(document).on("click", "#run1nfBtn", runFirstNormalForm);
    $(document).on("click", "#run2nfBtn", runSecondNormalForm);
    $(document).on("click", "#run3nfBtn", runThirdNormalForm);

    $(document).on("click", "#saveNormProjectBtn", function () {
        const name = prompt("Project name?", "Normalization Project");
        if (!name) return;

        saveNormalizationProject(name.trim());
    });

    $(document).on("click", ".timeline-pill", function () {
        const step = $(this).data("step-id");
        normalizationState.activeStep = step;
        renderStepTimeline();

        if (step === "raw") {
            renderNormalizationStep("raw", [
                { name: "raw_messy_table", rows: normalizationState.rawRows }
            ]);
        }

        if (step === "firstNormalForm") {
            renderNormalizationStep("1NF", normalizationState.steps.firstNormalForm.tables);
        }

        if (step === "secondNormalForm") {
            renderNormalizationStep("2NF", normalizationState.steps.secondNormalForm.tables);
        }

        if (step === "thirdNormalForm") {
            renderNormalizationStep("3NF", normalizationState.steps.thirdNormalForm.tables);
        }
    });
}

$(document).ready(renderNormalizationStudio);