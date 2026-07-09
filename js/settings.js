const themePresets = [
    {
        id: "midnight",
        name: "Midnight Cyan",
        theme: defaultWorkspace.theme
    },
    {
        id: "emerald",
        name: "Emerald Terminal",
        theme: {
            ...defaultWorkspace.theme,
            bg: "#03140c",
            bgSoft: "#062416",
            card: "rgba(7, 34, 21, 0.9)",
            primary: "#34d399",
            secondary: "#22c55e",
            success: "#86efac",
            warning: "#fde047",
            danger: "#fb7185"
        }
    },
    {
        id: "violet",
        name: "Violet Studio",
        theme: {
            ...defaultWorkspace.theme,
            bg: "#10051f",
            bgSoft: "#190b33",
            card: "rgba(28, 14, 54, 0.9)",
            primary: "#c084fc",
            secondary: "#38bdf8",
            success: "#4ade80",
            warning: "#facc15",
            danger: "#fb7185"
        }
    }
];

function renderSettingsPage() {
    const content = `
    <header class="page-header">
      <div>
        <span class="eyebrow">Settings</span>
        <h1 class="page-title">Customize the whole workspace</h1>
        <p class="page-description">
          Edit brand text, theme tokens, transitions, result sizing, sidebar behavior, and workspace data.
        </p>
      </div>
    </header>

    <div class="settings-layout">
      <aside class="settings-nav card-panel panel-padding">
        <a class="btn-ghost" href="#brand">Brand</a>
        <a class="btn-ghost" href="#theme">Theme</a>
        <a class="btn-ghost" href="#workspace">Workspace</a>
      </aside>

      <main>
        <section id="brand" class="settings-section">
          <h2 class="card-title">Brand Settings</h2>
          <div id="brandSettings"></div>
        </section>

        <section id="theme" class="settings-section">
          <h2 class="card-title">Theme Customizer</h2>
          <div id="themeCustomizer"></div>
        </section>

        <section id="workspace" class="settings-section">
          <h2 class="card-title">Workspace Data</h2>
          <div id="workspaceSettings"></div>
        </section>
      </main>
    </div>
  `;

    $("#app").html(renderShell("settings", content));
    renderSettingsForm();
    renderThemeCustomizer();
    renderWorkspaceSettings();
    bindSettingsEvents();
    setActiveNav();
}

function renderSettingsForm() {
    const workspace = loadWorkspace();

    $("#brandSettings").html(`
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">App Name</label>
        <input id="brandNameInput" class="form-control" value="${escapeHtml(workspace.brand.name)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Tagline</label>
        <input id="brandTaglineInput" class="form-control" value="${escapeHtml(workspace.brand.tagline)}">
      </div>
      <div class="col-12">
        <button class="btn-app" id="saveBrandBtn">Save Brand</button>
      </div>
    </div>
  `);
}

function saveBrandSettings() {
    const workspace = loadWorkspace();

    workspace.brand.name = $("#brandNameInput").val().trim() || defaultWorkspace.brand.name;
    workspace.brand.tagline = $("#brandTaglineInput").val().trim() || defaultWorkspace.brand.tagline;

    saveWorkspace(workspace);
    showStatus("Brand settings saved.", "success");
    renderSettingsPage();
}

function renderThemeCustomizer() {
    const workspace = loadWorkspace();
    const theme = workspace.theme;

    const colorTokens = [
        ["bg", "Background"],
        ["bgSoft", "Soft Background"],
        ["text", "Text"],
        ["muted", "Muted Text"],
        ["primary", "Primary"],
        ["secondary", "Secondary"],
        ["success", "Success"],
        ["warning", "Warning"],
        ["danger", "Danger"]
    ];

    $("#themeCustomizer").html(`
    <h3 class="card-title mt-3">Theme Presets</h3>
    <div class="preset-grid mb-4">
      ${themePresets
            .map(
                (preset) => `
          <button class="preset-card text-start" data-preset-id="${preset.id}">
            <strong>${escapeHtml(preset.name)}</strong>
            <div class="preset-swatches">
              <span class="preset-swatch" style="background:${preset.theme.primary}"></span>
              <span class="preset-swatch" style="background:${preset.theme.secondary}"></span>
              <span class="preset-swatch" style="background:${preset.theme.bgSoft}"></span>
            </div>
          </button>
        `
            )
            .join("")}
    </div>

    <h3 class="card-title">Live Preview</h3>
    <div class="preview-strip mb-4">
      <div class="preview-block" style="background:var(--bg)">BG</div>
      <div class="preview-block" style="background:var(--bg-soft)">Soft</div>
      <div class="preview-block" style="background:var(--primary)">Primary</div>
      <div class="preview-block" style="background:var(--secondary)">Secondary</div>
      <div class="preview-block" style="background:var(--card)">Card</div>
    </div>

    <div class="theme-grid">
      ${colorTokens
            .map(
                ([key, label]) => `
          <div class="color-control">
            <label class="form-label mb-0">${escapeHtml(label)}</label>
            <input type="color" class="theme-token-input" data-token="${key}" value="${escapeHtml(theme[key])}">
          </div>
        `
            )
            .join("")}

      <div>
        <label class="form-label">Card Background</label>
        <input class="form-control theme-token-input" data-token="card" value="${escapeHtml(theme.card)}">
      </div>

      <div>
        <label class="form-label">Font Family</label>
        <select class="form-select theme-token-input" data-token="fontFamily">
          ${[
            "Inter, sans-serif",
            "Arial, sans-serif",
            "Verdana, sans-serif",
            "Georgia, serif",
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        ]
            .map(
                (font) =>
                    `<option value="${font}" ${theme.fontFamily === font ? "selected" : ""
                    }>${escapeHtml(font)}</option>`
            )
            .join("")}
        </select>
      </div>

      <div>
        <label class="form-label">Border Radius: <span id="radiusValue">${escapeHtml(theme.radius)}</span>px</label>
        <input type="range" min="4" max="36" class="form-range theme-token-input" data-token="radius" value="${escapeHtml(theme.radius)}">
      </div>
    </div>

    <div class="workspace-actions mt-4">
      <button class="btn-ghost" id="resetThemeBtn">Reset Default Theme</button>
    </div>
  `);
}

function updateThemeToken(name, value) {
    const workspace = loadWorkspace();

    workspace.theme[name] = name === "radius" ? Number(value) : value;
    saveWorkspace(workspace);
    applyThemeSettings(workspace);

    if (name === "radius") {
        $("#radiusValue").text(value);
    }
}

function applyThemePreset(presetId) {
    const preset = themePresets.find((item) => item.id === presetId);

    if (!preset) return;

    const workspace = loadWorkspace();
    workspace.theme = cloneData(preset.theme);

    saveWorkspace(workspace);
    applyThemeSettings(workspace);
    renderThemeCustomizer();
    showStatus("Theme preset applied.", "success");
}

function resetThemeToDefault() {
    const workspace = loadWorkspace();

    workspace.theme = cloneData(defaultWorkspace.theme);
    saveWorkspace(workspace);
    applyThemeSettings(workspace);
    renderThemeCustomizer();
    showStatus("Theme reset.", "success");
}

function setTransitionSpeed(ms) {
    const workspace = loadWorkspace();
    workspace.settings.transitionSpeedMs = Number(ms);
    saveWorkspace(workspace);
}

function setLoaderDelay(ms) {
    const workspace = loadWorkspace();
    workspace.settings.loaderDelayMs = Number(ms);
    saveWorkspace(workspace);
}

function setDefaultPageSize(size) {
    const workspace = loadWorkspace();
    workspace.settings.defaultPageSize = Number(size);
    saveWorkspace(workspace);
}

function toggleCompactSidebar() {
    const workspace = loadWorkspace();
    workspace.settings.compactSidebar = $("#compactSidebarInput").is(":checked");
    saveWorkspace(workspace);
    showStatus("Sidebar preference saved.", "success");
}

function renderWorkspaceSettings() {
    const workspace = loadWorkspace();

    $("#workspaceSettings").html(`
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <label class="form-label">Transition Speed (ms)</label>
        <input type="number" id="transitionSpeedInput" class="form-control" value="${escapeHtml(workspace.settings.transitionSpeedMs)}">
      </div>

      <div class="col-md-4">
        <label class="form-label">Loader Delay (ms)</label>
        <input type="number" id="loaderDelayInput" class="form-control" value="${escapeHtml(workspace.settings.loaderDelayMs)}">
      </div>

      <div class="col-md-4">
        <label class="form-label">Default Page Size</label>
        <input type="number" id="pageSizeInput" class="form-control" value="${escapeHtml(workspace.settings.defaultPageSize)}">
      </div>

      <div class="col-12">
        <label class="form-check">
          <input id="compactSidebarInput" type="checkbox" class="form-check-input" ${workspace.settings.compactSidebar ? "checked" : ""
        }>
          <span class="form-check-label">Compact sidebar mode</span>
        </label>
      </div>
    </div>

    <div class="workspace-actions">
      <button class="btn-app" id="exportWorkspaceBtn">Export Workspace JSON</button>
      <label class="btn-ghost mb-0">
        Import Workspace JSON
        <input type="file" id="importWorkspaceInput" accept="application/json" hidden>
      </label>
      <button class="btn-ghost" id="resetDemoBtn">Reset Demo Data</button>
      <button class="btn-ghost" id="clearWorkspaceBtn">Clear LocalStorage</button>
    </div>
  `);
}

function exportWorkspace() {
    downloadJson("database-engineering-studio-workspace.json", loadWorkspace());
}

function importWorkspace(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const data = JSON.parse(reader.result);
            const workspace = deepMerge(defaultWorkspace, data);

            saveWorkspace(workspace);
            showStatus("Workspace imported.", "success");
            renderSettingsPage();
        } catch (error) {
            showStatus("Invalid workspace JSON.", "danger");
        }
    };

    reader.readAsText(file);
}

function resetDemoWorkspace() {
    if (!confirm("Reset to demo data? Current workspace data will be replaced.")) return;

    const workspace = seedDemoData();
    saveWorkspace(workspace);
    showStatus("Demo data restored.", "success");
    renderSettingsPage();
}

function clearWorkspace() {
    if (!confirm("Clear all localStorage data for this studio?")) return;

    localStorage.removeItem(workspaceKey);
    showStatus("Workspace cleared. Demo data will reload.", "success");
    renderSettingsPage();
}

function bindSettingsEvents() {
    $(document).on("click", "#saveBrandBtn", saveBrandSettings);

    $(document).on("input change", ".theme-token-input", function () {
        updateThemeToken($(this).data("token"), $(this).val());
    });

    $(document).on("click", ".preset-card", function () {
        applyThemePreset($(this).data("preset-id"));
    });

    $(document).on("click", "#resetThemeBtn", resetThemeToDefault);

    $(document).on("input", "#transitionSpeedInput", function () {
        setTransitionSpeed($(this).val());
    });

    $(document).on("input", "#loaderDelayInput", function () {
        setLoaderDelay($(this).val());
    });

    $(document).on("input", "#pageSizeInput", function () {
        setDefaultPageSize($(this).val());
    });

    $(document).on("change", "#compactSidebarInput", toggleCompactSidebar);

    $(document).on("click", "#exportWorkspaceBtn", exportWorkspace);
    $(document).on("change", "#importWorkspaceInput", importWorkspace);
    $(document).on("click", "#resetDemoBtn", resetDemoWorkspace);
    $(document).on("click", "#clearWorkspaceBtn", clearWorkspace);
}

$(document).ready(renderSettingsPage);