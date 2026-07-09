function renderDashboardHero() {
    const workspace = loadWorkspace();

    return `
    <section class="card-panel hero-panel">
      <div class="row g-4 align-items-center">
        <div class="col-lg-7">
          <span class="eyebrow">Frontend Portfolio Workspace</span>
          <h1 class="page-title">${escapeHtml(workspace.brand.name)}</h1>
          <p class="page-description">${escapeHtml(workspace.brand.tagline)}</p>

          <div class="hero-actions">
            <a href="schema-designer.html" class="btn-app" data-transition-link>Start Schema Design</a>
            <a href="sql-playground.html" class="btn-ghost" data-transition-link>Open SQL Playground</a>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="hero-glow"></div>
        </div>
      </div>
    </section>
  `;
}

function renderModuleCards() {
    const cards = modulesConfig
        .filter((module) => module.id !== "dashboard")
        .map(
            (module) => `
      <a href="${module.page}" class="module-card" data-transition-link>
        <span class="card-kicker">${escapeHtml(module.icon)}</span>
        <h3 class="card-title">${escapeHtml(module.title)}</h3>
        <p class="card-text">${escapeHtml(module.description)}</p>
      </a>
    `
        )
        .join("");

    return `
    <section class="dashboard-section">
      <div class="page-header">
        <div>
          <span class="eyebrow">Modules</span>
          <h2 class="card-title mt-2">Database tools in one connected studio</h2>
        </div>
      </div>

      <div class="grid-auto">
        ${cards}
      </div>
    </section>
  `;
}

function renderDashboardStats() {
    const workspace = loadWorkspace();
    const tables = workspace.database.tables;
    const totalRows = tables.reduce((sum, table) => sum + table.rows.length, 0);

    const stats = [
        { label: "Tables", value: tables.length },
        { label: "Relationships", value: workspace.database.relationships.length },
        { label: "Rows", value: totalRows },
        { label: "Saved Queries", value: workspace.savedQueries.length },
        { label: "Normalization Projects", value: workspace.normalizationProjects.length }
    ];

    return `
    <section class="dashboard-section">
      <div class="grid-auto">
        ${stats
            .map(
                (stat) => `
            <article class="stat-card">
              <span class="card-kicker">${escapeHtml(stat.label)}</span>
              <p class="stat-number">${escapeHtml(stat.value)}</p>
            </article>
          `
            )
            .join("")}
      </div>
    </section>
  `;
}

function renderRecentActivity() {
    const workspace = loadWorkspace();
    const recent = workspace.activityLog.slice(0, 8);

    return `
    <section class="dashboard-section card-panel panel-padding">
      <div class="page-header">
        <div>
          <span class="eyebrow">Activity</span>
          <h2 class="card-title mt-2">Recent workspace activity</h2>
        </div>
      </div>

      <div class="activity-list">
        ${recent.length
            ? recent
                .map(
                    (log) => `
                  <div class="activity-item">
                    <div>
                      <strong>${escapeHtml(log.action)}</strong>
                      <p class="card-text mb-0">${escapeHtml(log.detail)}</p>
                    </div>
                    <div class="activity-meta">
                      <div>${escapeHtml(log.module)}</div>
                      <div>${escapeHtml(formatTimestamp(log.createdAt))}</div>
                    </div>
                  </div>
                `
                )
                .join("")
            : renderEmptyState("No activity yet.")
        }
      </div>
    </section>
  `;
}

function renderQuickActions() {
    const actions = [
        {
            title: "New Schema",
            text: "Create or import tables, columns, keys, and relationships.",
            page: "schema-designer.html"
        },
        {
            title: "SQL Playground",
            text: "Run SELECT, INSERT, UPDATE, and DELETE statements locally.",
            page: "sql-playground.html"
        },
        {
            title: "Build a Query",
            text: "Use visual controls to generate runnable SQL.",
            page: "query-builder.html"
        },
        {
            title: "Normalize a Table",
            text: "Transform messy data through 1NF, 2NF, and 3NF.",
            page: "normalization-studio.html"
        }
    ];

    return `
    <section class="dashboard-section">
      <div class="grid-auto">
        ${actions
            .map(
                (action) => `
            <a href="${action.page}" class="action-card" data-transition-link>
              <span class="card-kicker">Quick Action</span>
              <h3 class="card-title">${escapeHtml(action.title)}</h3>
              <p class="card-text">${escapeHtml(action.text)}</p>
            </a>
          `
            )
            .join("")}
      </div>
    </section>
  `;
}

function renderDashboard() {
    const content = `
    ${renderDashboardHero()}
    ${renderDashboardStats()}
    ${renderModuleCards()}
    ${renderQuickActions()}
    ${renderRecentActivity()}
  `;

    $("#app").html(renderShell("dashboard", content));
    setActiveNav();
}

$(document).ready(renderDashboard);