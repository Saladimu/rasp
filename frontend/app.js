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
  lock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 20a5 5 0 0 1 5-5"/></svg>',
  "book-open": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6c-2-2-5-3-8-3v16c3 0 6 1 8 3 2-2 5-3 8-3V3c-3 0-6 1-8 3z"/></svg>',
  newspaper: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h12v14H4z"/><path d="M16 8h4v11a2 2 0 0 1-2 2H6"/><path d="M7 9h6M7 13h6M7 17h4"/></svg>',
  "pen-line": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  "file-text": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
  "external-link": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 15-5-5-8 8"/></svg>',
  palette: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H13a3 3 0 0 1 0-6h3a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14" cy="7.5" r="1"/></svg>',
  briefcase: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  "graduation-cap": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 10-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c2 1.5 4 2 6 2s4-.5 6-2v-5"/></svg>',
  "map-pin": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 8.6a5.1 5.1 0 0 0-8.8-3.6A5.1 5.1 0 0 0 3.2 8.6c0 6 8.8 11 8.8 11s8.8-5 8.8-11z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 19.8l1-6.1L3.2 9.4l6.1-.9z"/></svg>',
  code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-5 4 5 4M16 8l5 4-5 4M13 5l-2 14"/></svg>',
  rss: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/></svg>',
  "share-2": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5"/></svg>',
  "message-circle": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5A8.5 8.5 0 1 1 21 12z"/></svg>',
  phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.5a16 16 0 0 0 6.4 6.4l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
  "shopping-bag": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8h12l1 13H5z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
  "gamepad-2": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10h12a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z"/><path d="M8 15h4M10 13v4M17 14h.01M19 16h.01"/></svg>'
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

function applyServerInfo(info) {
  if (!info) return;
  setText("dashboard-name", info.dashboard_name);
  setText("dashboard-subtitle", info.dashboard_subtitle);
  setText("stat-hostname", info.hostname);
  setText("stat-cpu", info.cpu);
  setText("stat-ram", info.ram);
  setText("stat-disk", info.disk);
  setText("stat-uptime", info.uptime);
  document.getElementById("server-status").textContent = "Online";
  document.getElementById("server-dot").className = "dot online";
}

function applySummary(summary) {
  const data = summary || {};
  setText("sum-online", String(data.online || 0));
  setText("sum-offline", String(data.offline || 0));
  setText("sum-unknown", String(data.unknown || 0));
  setText("sum-uptime", data.uptime_24h != null ? `${data.uptime_24h}%` : "Not Available");
  setText("sum-alerts", data.alerts_enabled ? "On" : "Off");
}

function sparklineSvg(points) {
  const values = (points || []).slice(-36);
  if (!values.length) {
    return `<svg class="sparkline" viewBox="0 0 100 28" preserveAspectRatio="none"><path d="M0 14 H100" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35"/></svg>`;
  }
  const width = 100;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const coords = values.map((value, index) => {
    const x = Math.round(index * step);
    if (value === 1) return `${x},6`;
    if (value === 0) return `${x},22`;
    return `${x},14`;
  });
  return `<svg class="sparkline" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${coords.join(" ")}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function latencyBar(ms) {
  if (ms == null) return "";
  const pct = Math.max(8, Math.min(100, Math.round(ms / 12)));
  return `<div class="latency-bar"><span style="width:${pct}%"></span></div>`;
}

function renderCards(targetId, items, statuses, emptyText, buttonLabel) {
  const statusMap = new Map((statuses || []).map((item) => [item.id, item]));
  const grid = document.getElementById(targetId);
  grid.innerHTML = (items || []).map((app) => {
    const status = statusMap.get(app.id) || app;
    const state = status.status || "unknown";
    const latency = status.latency_ms != null ? `${status.latency_ms} ms` : "Latency N/A";
    const uptime = status.uptime_24h != null ? `${status.uptime_24h}% 24h` : "Uptime N/A";
    const avg = status.avg_latency_ms != null ? `avg ${status.avg_latency_ms} ms` : "";
    return `
      <article class="card card-${state}">
        <div class="card-head">
          <div class="icon-wrap">${iconMarkup(app.icon)}</div>
          <div class="status"><span class="dot ${state}"></span>${state}</div>
        </div>
        <h2>${escapeHtml(app.name)}</h2>
        <p>${escapeHtml(app.description || "")}</p>
        <div class="uptime-row">
          ${sparklineSvg(status.sparkline)}
          <div class="uptime-meta">${uptime}${avg ? `<br>${avg}` : ""}</div>
        </div>
        ${latencyBar(status.latency_ms)}
        <div class="card-foot">
          <div class="latency">${latency}<br>Checked ${formatTime(status.last_checked)}</div>
          <a class="btn" href="${escapeAttr(app.url)}" target="_blank" rel="noopener noreferrer">${buttonLabel}</a>
        </div>
      </article>
    `;
  }).join("") || `<p class='muted'>${emptyText}</p>`;
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

let pendingRetry = 0;

async function loadDashboard(refresh = false) {
  try {
    if (refresh) {
      await Promise.all([
        fetch("/api/status?refresh=true", { cache: "no-store" }),
        fetch("/api/websites/status?refresh=true", { cache: "no-store" })
      ]);
    }
    const res = await fetch("/api/dashboard", { cache: "no-store" });
    if (!res.ok) throw new Error("offline");
    const data = await res.json();
    applyServerInfo(data.server);
    applySummary(data.summary);
    renderCards("app-grid", data.apps || [], data.statuses || [], "No applications registered yet.", "Open Application");
    renderCards("website-grid", data.websites || [], data.website_statuses || [], "No personal websites registered yet.", "Open Website");
    const waiting = [...(data.statuses || []), ...(data.website_statuses || [])]
      .some((item) => item.status === "unknown" && item.message === "Waiting for first check");
    if (waiting) {
      clearTimeout(pendingRetry);
      pendingRetry = setTimeout(() => loadDashboard(false), 1200);
    }
  } catch (_err) {
    document.getElementById("server-status").textContent = "Offline";
    document.getElementById("server-dot").className = "dot offline";
  }
}

document.getElementById("refresh-btn").addEventListener("click", () => {
  loadDashboard(true);
});

let deferredPrompt = null;
const installBtn = document.getElementById("install-btn");
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove("hidden");
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

renderClock();
setInterval(renderClock, 1000);
loadDashboard();
setInterval(() => loadDashboard(false), 30000);
