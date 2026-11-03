const ICONS = {
  folder: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  brain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5a5 5 0 0 0-4 8v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a5 5 0 0 0-4-8z"/><path d="M9 13h6M8 9a3 3 0 1 1 0-6 4 4 0 0 1 4 4M16 9a3 3 0 1 0 0-6 4 4 0 0 0-4 4"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>',
  "layout-grid": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  server: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="8" rx="2"/><rect x="3" y="12" width="18" height="8" rx="2"/><path d="M7 8h.01M7 16h.01"/></svg>',
  globe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
  database: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  cloud: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 18H7a4 4 0 1 1 1.3-7.8A6 6 0 1 1 18 18z"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/></svg>',
  terminal: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 17 6-5-6-5M12 19h8"/></svg>',
  camera: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  video: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
  mail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
  box: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8l-9-5-9 5v8l9 5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v10"/></svg>',
  cpu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  "hard-drive": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12l4 8H2zM2 12h20v8H2z"/><path d="M6 16h.01M10 16h.01"/></svg>',
  wifi: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};

function iconMarkup(icon) {
  if (icon && icon.startsWith("custom:")) {
    const file = icon.slice(7);
    return `<img src="/icons/${encodeURIComponent(file)}" alt="">`;
  }
  return ICONS[icon] || ICONS["layout-grid"];
}

function formatTime(iso) {
  if (!iso) return "Never";
  const date = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "Not Available";
}

function renderClock() {
  const now = new Date();
  setText("clock", now.toLocaleString());
}

async function loadServerInfo() {
  try {
    const res = await fetch("/api/server-info", { cache: "no-store" });
    if (!res.ok) throw new Error("offline");
    const info = await res.json();
    setText("dashboard-name", info.dashboard_name);
    setText("dashboard-subtitle", info.dashboard_subtitle);
    setText("stat-hostname", info.hostname);
    setText("stat-cpu", info.cpu);
    setText("stat-ram", info.ram);
    setText("stat-disk", info.disk);
    setText("stat-uptime", info.uptime);
    document.getElementById("server-status").textContent = "Online";
    document.getElementById("server-dot").className = "dot online";
  } catch (_err) {
    document.getElementById("server-status").textContent = "Offline";
    document.getElementById("server-dot").className = "dot offline";
  }
}

function renderApps(apps, statuses) {
  const statusMap = new Map((statuses || []).map((item) => [item.id, item]));
  const grid = document.getElementById("app-grid");
  grid.innerHTML = apps.map((app) => {
    const status = statusMap.get(app.id) || app;
    const state = status.status || "unknown";
    const latency = status.latency_ms != null ? `${status.latency_ms} ms` : "Latency N/A";
    return `
      <article class="card">
        <div class="card-head">
          <div class="icon-wrap">${iconMarkup(app.icon)}</div>
          <div class="status"><span class="dot ${state}"></span>${state}</div>
        </div>
        <h2>${escapeHtml(app.name)}</h2>
        <p>${escapeHtml(app.description || "")}</p>
        <div class="card-foot">
          <div class="latency">${latency}<br>Checked ${formatTime(status.last_checked)}</div>
          <a class="btn" href="${escapeAttr(app.url)}" target="_blank" rel="noopener noreferrer">Open Application</a>
        </div>
      </article>
    `;
  }).join("") || "<p class='muted'>No applications registered yet.</p>";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

async function loadApps(refresh = false) {
  const [appsRes, statusRes] = await Promise.all([
    fetch("/api/apps", { cache: "no-store" }),
    fetch(`/api/status${refresh ? "?refresh=true" : ""}`, { cache: "no-store" })
  ]);
  const appsData = await appsRes.json();
  const statusData = await statusRes.json();
  renderApps(appsData.apps || [], statusData.statuses || []);
}

document.getElementById("refresh-btn").addEventListener("click", () => {
  loadApps(true);
  loadServerInfo();
});

renderClock();
setInterval(renderClock, 1000);
loadServerInfo();
loadApps();
setInterval(() => loadApps(false), 45000);
setInterval(loadServerInfo, 30000);
