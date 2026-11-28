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
  usb: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 9h16"/><path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/></svg>',
  bluetooth: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 7 10 10-5 4V3l5 4L7 17"/></svg>',
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

function powerTone(status) {
  if (status === "Clean Power Delivery") return "online";
  if (status === "Power Issue") return "offline";
  if (status === "Past Undervoltage" || status === "Past Throttle") return "warn";
  return "unknown";
}

function applyPowerDelivery(info) {
  const status = info.power || "Not Available";
  const raw = info.power_raw || "";
  const detail = info.power_detail || "";
  const card = document.getElementById("stat-power-card");
  const detailEl = document.getElementById("stat-power-detail");
  setText("stat-power", status);
  if (detailEl) {
    if (status === "Not Available") {
      detailEl.textContent = detail || "";
    } else {
      detailEl.textContent = [raw, detail].filter(Boolean).join(" · ");
    }
  }
  if (card) {
    card.className = `stat power-${powerTone(status)}`;
  }
}

function tempTone(value) {
  if (!value || value === "Not Available") return "unknown";
  const celsius = parseFloat(String(value).replace("°C", ""));
  if (Number.isNaN(celsius)) return "unknown";
  if (celsius < 60) return "online";
  if (celsius < 65) return "warn";
  return "offline";
}

function applyTemperature(info) {
  const value = info.temp || "Not Available";
  const card = document.getElementById("stat-temp-card");
  setText("stat-temp", value);
  const detailEl = document.getElementById("stat-temp-detail");
  if (detailEl) {
    detailEl.textContent = value !== "Not Available" ? (info.temp_detail || "") : "";
  }
  if (card) {
    card.className = `stat temp-${tempTone(value)}`;
  }
}

function applyServerInfo(info) {
  if (!info) return;
  setText("dashboard-name", info.dashboard_name);
  setText("dashboard-subtitle", info.dashboard_subtitle);
  setText("stat-hostname", info.hostname);
  setText("stat-device-model", info.device_model);
  setText("stat-os-release", info.os_pretty_name);
  setText("stat-kernel", info.kernel_arch);
  setText("stat-cpu", info.cpu);
  setText("stat-cpu-detail", info.cpu_detail);
  setText("stat-ram", info.ram);
  setText("stat-ram-detail", info.ram_detail);
  setText("stat-swap", info.swap);
  setText("stat-swap-detail", info.swap_detail);
  setText("stat-disk", info.disk);
  setText("stat-disk-detail", info.disk_detail);
  applyTemperature(info);
  applyPowerDelivery(info);
  setText("stat-uptime", info.uptime);
  document.getElementById("server-status").textContent = "Online";
  document.getElementById("server-dot").className = "dot online";
}

const THEME_ICONS = {
  dark: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>'
};

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme, toggle) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "light" ? "#eef3fb" : "#0b1220");
  try {
    localStorage.setItem("theme", next);
  } catch (_err) {}
  if (toggle) {
    toggle.innerHTML = THEME_ICONS[next];
    toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    toggle.setAttribute("title", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
}

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  let saved = "";
  try {
    saved = localStorage.getItem("theme") || "";
  } catch (_err) {
    saved = "";
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"), toggle);
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyTheme(currentTheme() === "dark" ? "light" : "dark", toggle);
  });
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

function usbButtonId(device) {
  return `unmount-${String(device || "").replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

const USB_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const GMT7_OFFSET_MS = 7 * 60 * 60 * 1000;

function formatUsbActivity(iso) {
  if (!iso) return "";
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(iso);
  const date = new Date(hasZone ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return "";
  const shifted = new Date(date.getTime() + GMT7_OFFSET_MS);
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const month = USB_MONTHS[shifted.getUTCMonth()];
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${day}-${month} ${hours}:${minutes}`;
}

function activityLine(lastActivity, label) {
  const stamp = formatUsbActivity(lastActivity) || "—";
  return `<p class="usb-activity">
        <span class="usb-folder">${escapeHtml(label || "—")}</span>
        <span class="usb-activity-time">last activity: ${escapeHtml(stamp)}</span>
      </p>`;
}

function emptyUsbCard(lastActivity) {
  return `
    <article class="card card-unknown usb-card usb-empty usb-unmounted">
      <div class="card-head usb-head">
        <div class="icon-wrap">${iconMarkup("usb")}</div>
        <h2>USB Drive</h2>
        <div class="status"><span class="dot unknown"></span>Unmounted</div>
      </div>
      ${activityLine(lastActivity, "/mnt/usb")}
      <div class="usb-meta">
        <span>Label: —</span>
        <span>Firmware: —</span>
        <span>Used / Size: —</span>
        <span>Avail: —</span>
        <span>Use%: —</span>
      </div>
      <div class="card-foot">
        <div class="latency">/mnt/usb</div>
        <button class="btn usb-mount" type="button" id="usb-mount-btn">Mount</button>
      </div>
    </article>
  `;
}

let bluetoothState = null;
let bluetoothLastActivity = "";
let wifiState = null;
let wifiLastActivity = "";
let wifiSelectedSsid = "";
let wifiBusy = false;
let adminAuthenticated = false;

function statusClasses(available, powered) {
  return {
    statusLabel: !available ? "Unavailable" : powered ? "On" : "Off",
    dotClass: !available ? "unknown" : powered ? "online" : "offline",
    themeClass: !available ? "bt-unavailable" : powered ? "bt-on" : "bt-off",
    cardClass: !available ? "card-unknown" : powered ? "card-online" : "card-offline",
  };
}

function bluetoothCardHtml() {
  const info = bluetoothState || {};
  const available = Boolean(info.available);
  const powered = Boolean(info.powered);
  const devices = Array.isArray(info.devices) ? info.devices : [];
  const { statusLabel, dotClass, themeClass, cardClass } = statusClasses(available, powered);
  const adapterLabel = info.name || info.adapter || "Bluetooth";
  let devicesMarkup;
  if (!available) {
    devicesMarkup = `<p class="bt-note">${escapeHtml(info.message || "Bluetooth hardware was not detected on this host.")}</p>`;
  } else if (!powered) {
    devicesMarkup = `<p class="bt-note">Bluetooth is off. Turn it on to connect devices.</p>`;
  } else if (devices.length === 0) {
    devicesMarkup = `<p class="bt-note">No devices connected.</p>`;
  } else {
    devicesMarkup = devices.map((device) => `
      <div class="bt-device">
        <span class="dot online"></span>
        <span class="bt-device-name">${escapeHtml(device.name || device.mac || "Unknown device")}</span>
        <span class="bt-device-mac">${escapeHtml(device.mac || "")}</span>
      </div>
    `).join("");
  }
  const countLabel = !available
    ? "No adapter"
    : `${devices.length} device${devices.length === 1 ? "" : "s"} connected`;
  return `
    <article class="card usb-card bt-card ${cardClass} ${themeClass}">
      <div class="card-head usb-head">
        <div class="icon-wrap">${iconMarkup("bluetooth")}</div>
        <h2>Bluetooth</h2>
        <div class="status bt-status ${dotClass}"><span class="dot ${dotClass}"></span>${statusLabel}</div>
      </div>
      ${activityLine(bluetoothLastActivity, adapterLabel)}
      <div class="bt-meta">
        <span>Name: ${escapeHtml(info.name || "—")}</span>
        <span>Address: ${escapeHtml(info.adapter || "—")}</span>
      </div>
      <div class="bt-devices">${devicesMarkup}</div>
      <p class="bt-error" id="bt-error"></p>
      <div class="card-foot bt-foot">
        <div class="latency">${escapeHtml(countLabel)}</div>
        <label class="bt-switch${available ? "" : " disabled"}">
          <input type="checkbox" class="bt-toggle-input" role="switch" aria-label="Toggle Bluetooth" ${powered ? "checked" : ""} ${available ? "" : "disabled"}>
          <span class="bt-switch-track"><span class="bt-switch-thumb"></span></span>
          <span class="bt-switch-text">${statusLabel}</span>
        </label>
      </div>
    </article>
  `;
}

function wifiSignalLabel(signal) {
  const value = String(signal || "").trim();
  if (!value) return "—";
  return /^\d+$/.test(value) ? `${value}%` : value;
}

function wifiNetworks() {
  const networks = wifiState?.networks;
  return Array.isArray(networks) ? networks.filter((item) => item && item.ssid) : [];
}

function wifiOptionLabel(network) {
  const signal = Math.max(0, Math.min(100, Number(network.signal) || 0));
  const state = network.active ? " (Connected)" : network.saved ? " (Saved)" : "";
  return `${network.ssid}${state} · ${signal}%`;
}

function wifiControlsVisible() {
  const info = wifiState || {};
  const enabled = info.enabled === undefined ? info.powered : info.enabled;
  return Boolean(adminAuthenticated && enabled);
}

function wifiDropdownValue(networks) {
  if (wifiSelectedSsid && networks.some((item) => item.ssid === wifiSelectedSsid)) {
    return wifiSelectedSsid;
  }
  const active = networks.find((item) => item.active);
  return active ? active.ssid : (networks[0]?.ssid || "");
}

function wifiControlsHtml() {
  const networks = wifiNetworks();
  const selected = wifiDropdownValue(networks);
  const options = networks.length
    ? networks.map((network) => `<option value="${escapeAttr(network.ssid)}"${network.ssid === selected ? " selected" : ""}>${escapeHtml(wifiOptionLabel(network))}</option>`).join("")
    : '<option value="">No networks found</option>';
  const hiddenClass = wifiControlsVisible() ? "" : " hidden";
  const connectDisabled = !networks.length || wifiBusy ? " disabled" : "";
  const rescanDisabled = wifiBusy ? " disabled" : "";
  return `
      <div class="wifi-select-wrap${hiddenClass}" id="wifi-select-wrap">
        <label class="wifi-select-label" for="wifi-ssid-select">Network</label>
        <div class="wifi-select-row">
          <select class="wifi-select" id="wifi-ssid-select" aria-label="Wi-Fi network"${networks.length ? "" : " disabled"}>${options}</select>
          <div class="wifi-actions">
            <button class="btn wifi-connect-btn" type="button" id="wifi-connect-btn"${connectDisabled}>Connect</button>
            <button class="btn secondary wifi-rescan-btn" type="button" id="wifi-rescan-btn"${rescanDisabled}>Rescan</button>
          </div>
        </div>
      </div>
  `;
}

function wifiCardHtml() {
  const info = wifiState || {};
  const available = Boolean(info.available);
  const powered = Boolean(info.powered);
  const { statusLabel, dotClass, themeClass, cardClass } = statusClasses(available, powered);
  const ssid = info.ssid || "";
  const note = !available
    ? info.message || "Wi-Fi hardware was not detected on this host."
    : !powered
      ? "Wi-Fi is off. Turn it on to connect."
      : ssid
        ? ""
        : "Not connected to a wireless network.";
  const countLabel = !available
    ? "No adapter"
    : powered
      ? ssid
        ? `Connected to ${ssid}`
        : "Not connected"
      : "Radio off";
  return `
    <article class="card usb-card wifi-card ${cardClass} ${themeClass}" id="wifi-card">
      <div class="card-head usb-head">
        <div class="icon-wrap">${iconMarkup("wifi")}</div>
        <h2>Wireless LAN</h2>
        <div class="status bt-status wifi-status ${dotClass}"><span class="dot ${dotClass}"></span>${statusLabel}</div>
      </div>
      ${activityLine(wifiLastActivity, ssid || info.interface || "Wi-Fi")}
      <div class="wifi-meta">
        <span>Interface: ${escapeHtml(info.interface || "—")}</span>
        <span>SSID: ${escapeHtml(ssid || "—")}</span>
        <span>Signal: ${escapeHtml(wifiSignalLabel(info.signal))}</span>
        <span>IP: ${escapeHtml(info.ip || "—")}</span>
      </div>
      ${note ? `<p class="bt-note">${escapeHtml(note)}</p>` : ""}
      <p class="bt-error" id="wifi-error"></p>
      ${wifiControlsHtml()}
      <div class="card-foot bt-foot">
        <div class="latency">${escapeHtml(countLabel)}</div>
        <label class="bt-switch${available ? "" : " disabled"}">
          <input type="checkbox" class="wifi-toggle-input" role="switch" aria-label="Toggle Wi-Fi" ${powered ? "checked" : ""} ${available ? "" : "disabled"}>
          <span class="bt-switch-track"><span class="bt-switch-thumb"></span></span>
          <span class="bt-switch-text">${statusLabel}</span>
        </label>
      </div>
    </article>
  `;
}

function renderWifiCard() {
  const card = document.querySelector("#usb-grid .wifi-card");
  if (!card) return;
  card.outerHTML = wifiCardHtml();
}

function syncWifiControls() {
  const wrap = document.getElementById("wifi-select-wrap");
  if (!wrap) return;
  wrap.classList.toggle("hidden", !wifiControlsVisible());
}

async function syncAdminSession() {
  adminAuthenticated = await checkAdminSession();
  syncWifiControls();
}

function setWifiBusy(busy) {
  wifiBusy = busy;
  document.querySelectorAll("#wifi-connect-btn, #wifi-rescan-btn").forEach((button) => {
    button.disabled = busy;
  });
}

function setWifiError(message) {
  const target = document.getElementById("wifi-error");
  if (!target) return;
  target.textContent = message || "";
  target.classList.toggle("show", Boolean(message));
}

async function postWifiAction(url, body) {
  const headers = Object.assign({ "Content-Type": "application/json" }, await csrfHeader());
  const res = await fetch(url, {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorDetail(data.detail, "Wi-Fi request failed"));
  }
  return data;
}

async function connectWifi() {
  if (wifiBusy) return;
  const select = document.getElementById("wifi-ssid-select");
  const ssid = (select?.value || wifiSelectedSsid || "").trim();
  if (!ssid) return;
  const network = wifiNetworks().find((item) => item.ssid === ssid);
  let password = null;
  if (!network || (!network.saved && !network.active)) {
    const answer = window.prompt(`Enter the password for ${ssid}`, "");
    if (answer === null) return;
    password = answer;
  }
  setWifiBusy(true);
  setWifiError("");
  let errorMessage = "";
  try {
    const payload = { ssid };
    if (password !== null) payload.password = password;
    const data = await postWifiAction("/api/admin/wifi/connect", payload);
    if (data.wifi) wifiState = data.wifi;
    wifiSelectedSsid = ssid;
  } catch (err) {
    errorMessage = err.message || "Wi-Fi connection failed";
  }
  setWifiBusy(false);
  renderWifiCard();
  if (errorMessage) setWifiError(errorMessage);
  else loadDashboard(false);
}

async function rescanWifi() {
  if (wifiBusy) return;
  setWifiBusy(true);
  setWifiError("");
  let errorMessage = "";
  try {
    const data = await postWifiAction("/api/admin/wifi/rescan");
    if (data.wifi) wifiState = data.wifi;
  } catch (err) {
    errorMessage = err.message || "Wi-Fi rescan failed";
  }
  setWifiBusy(false);
  renderWifiCard();
  if (errorMessage) setWifiError(errorMessage);
  else loadDashboard(false);
}

function renderUsbDrives(drives, lastActivity) {
  const grid = document.getElementById("usb-grid");
  const toolbar = document.getElementById("usb-toolbar");
  if (!grid) return;
  if (toolbar) toolbar.style.display = "";
  if (!drives || drives.length === 0) {
    grid.innerHTML = emptyUsbCard(lastActivity) + bluetoothCardHtml() + wifiCardHtml();
    return;
  }
  grid.innerHTML = drives.map((drive) => `
    <article class="card card-online usb-card">
      <div class="card-head usb-head">
        <div class="icon-wrap">${iconMarkup("usb")}</div>
        <h2>USB Drive</h2>
        <div class="status"><span class="dot online"></span>Mounted</div>
      </div>
      ${activityLine(lastActivity, drive.mountpoint)}
      <div class="usb-meta">
        <span>Label: ${escapeHtml(drive.label)}</span>
        <span>Firmware: ${escapeHtml(drive.firmware)}</span>
        <span>Used / Size: ${escapeHtml(drive.used)} / ${escapeHtml(drive.size)}</span>
        <span>Avail: ${escapeHtml(drive.avail || "—")}</span>
        <span>Use%: ${escapeHtml(drive.use_pct)}</span>
      </div>
      <div class="card-foot">
        <div class="latency">${escapeHtml(drive.fstype)} · ${escapeHtml(drive.device)}</div>
        <button class="btn danger usb-unmount" type="button" id="${usbButtonId(drive.device)}" data-device="${escapeAttr(drive.device)}" data-mountpoint="${escapeAttr(drive.mountpoint)}">Unmount</button>
      </div>
    </article>
  `).join("") + bluetoothCardHtml() + wifiCardHtml();
}

async function csrfHeader() {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return {};
    const data = await res.json();
    if (!data.authenticated || !data.csrf_token) {
      adminAuthenticated = false;
      return {};
    }
    adminAuthenticated = true;
    return { "X-CSRF-Token": data.csrf_token };
  } catch (_err) {
    return {};
  }
}

function errorDetail(value, fallback = "USB operation failed") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => item.msg || item).join("; ");
  return String(value);
}

function closeConfirm() {
  const overlay = document.getElementById("confirm-overlay");
  const error = document.getElementById("confirm-error");
  if (overlay) overlay.classList.add("hidden");
  if (error) {
    error.textContent = "";
    error.classList.remove("show");
  }
}

function showConfirmError(message) {
  const error = document.getElementById("confirm-error");
  if (!error) return;
  error.textContent = message;
  error.classList.add("show");
}

let confirmBusy = false;

function setConfirmAction(action, title, message, okLabel, danger) {
  const overlay = document.getElementById("confirm-overlay");
  const heading = document.getElementById("confirm-title");
  const text = document.getElementById("confirm-message");
  const ok = document.getElementById("confirm-ok");
  if (!overlay || !heading || !text || !ok) return;
  overlay.setAttribute("data-action", action);
  heading.textContent = title;
  text.textContent = message;
  ok.textContent = okLabel;
  ok.classList.toggle("danger", Boolean(danger));
  ok.disabled = false;
  overlay.classList.remove("hidden");
}

function confirmUnmount(device, mountpoint) {
  const overlay = document.getElementById("confirm-overlay");
  if (!overlay) return;
  overlay.setAttribute("data-device", device);
  overlay.setAttribute("data-mountpoint", mountpoint);
  setConfirmAction("unmount", "Unmount USB Drive", `Unmount ${device} from ${mountpoint}?`, "Unmount", true);
}

function confirmMount() {
  setConfirmAction("mount", "Mount USB Drive", "Mount USB drive at /mnt/usb?", "Mount", false);
}

function bindConfirmModal() {
  const overlay = document.getElementById("confirm-overlay");
  const ok = document.getElementById("confirm-ok");
  const cancel = document.getElementById("confirm-cancel");
  if (!overlay || !ok || !cancel) return;
  cancel.addEventListener("click", (event) => {
    event.preventDefault();
    if (!confirmBusy) closeConfirm();
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay && !confirmBusy) closeConfirm();
  });
  ok.addEventListener("click", async (event) => {
    event.preventDefault();
    if (confirmBusy) return;
    const action = overlay.getAttribute("data-action") || "unmount";
    const device = overlay.getAttribute("data-device") || "";
    const mountpoint = overlay.getAttribute("data-mountpoint") || "";
    confirmBusy = true;
    ok.disabled = true;
    try {
      if (action === "mount") {
        await mountDrive();
      } else {
        await unmountDrive(device, mountpoint);
      }
      closeConfirm();
    } catch (err) {
      showConfirmError(err.message || (action === "mount" ? "Mount failed" : "Unmount failed"));
    } finally {
      confirmBusy = false;
      ok.disabled = false;
    }
  });
}

function bindUsbGrid() {
  const grid = document.getElementById("usb-grid");
  if (!grid || grid.dataset.bound === "1") return;
  grid.dataset.bound = "1";
  grid.addEventListener("click", (event) => {
    const connectBtn = event.target.closest(".wifi-connect-btn");
    if (connectBtn) {
      event.preventDefault();
      event.stopPropagation();
      connectWifi();
      return;
    }
    const rescanBtn = event.target.closest(".wifi-rescan-btn");
    if (rescanBtn) {
      event.preventDefault();
      event.stopPropagation();
      rescanWifi();
      return;
    }
    const mountBtn = event.target.closest(".usb-mount");
    if (mountBtn) {
      event.preventDefault();
      event.stopPropagation();
      confirmMount();
      return;
    }
    const btn = event.target.closest(".usb-unmount");
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    confirmUnmount(btn.getAttribute("data-device") || "", btn.getAttribute("data-mountpoint") || "");
  });
  grid.addEventListener("change", (event) => {
    const select = event.target.closest("#wifi-ssid-select");
    if (select) {
      wifiSelectedSsid = select.value;
      return;
    }
    const bluetooth = event.target.closest(".bt-toggle-input");
    if (bluetooth) {
      setBluetoothPower(bluetooth.checked, bluetooth);
      return;
    }
    const wifi = event.target.closest(".wifi-toggle-input");
    if (wifi) setWifiPower(wifi.checked, wifi);
  });
}

async function unmountDrive(device, mountpoint) {
  const headers = Object.assign({ "Content-Type": "application/json" }, await csrfHeader());
  const res = await fetch("/api/usb/unmount", {
    method: "POST",
    headers,
    body: JSON.stringify({ device, mountpoint }),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorDetail(data.detail, "Unmount failed"));
  }
  renderUsbDrives([], data.last_activity || "");
  await loadDashboard(true);
}

async function mountDrive() {
  const headers = Object.assign({ "Content-Type": "application/json" }, await csrfHeader());
  const res = await fetch("/api/usb/mount", {
    method: "POST",
    headers,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorDetail(data.detail, "Mount failed"));
  }
  await loadDashboard(true);
}

async function setFeaturePower(url, enabled, input, errorId, fallback) {
  const error = document.getElementById(errorId);
  if (error) {
    error.textContent = "";
    error.classList.remove("show");
  }
  if (input) input.disabled = true;
  try {
    const headers = Object.assign({ "Content-Type": "application/json" }, await csrfHeader());
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ enabled }),
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(errorDetail(data.detail, fallback));
    }
    await loadDashboard(true);
  } catch (err) {
    if (input) {
      input.checked = !enabled;
      input.disabled = false;
    }
    const target = document.getElementById(errorId);
    if (target) {
      target.textContent = err.message || fallback;
      target.classList.add("show");
    }
  }
}

function setBluetoothPower(enabled, input) {
  return setFeaturePower("/api/bluetooth/power", enabled, input, "bt-error", "Bluetooth update failed");
}

function setWifiPower(enabled, input) {
  return setFeaturePower("/api/wifi/power", enabled, input, "wifi-error", "Wi-Fi update failed");
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
    bluetoothState = data.server?.bluetooth || null;
    bluetoothLastActivity = data.server?.bluetooth_last_activity || "";
    wifiState = data.server?.wifi || null;
    wifiLastActivity = data.server?.wifi_last_activity || "";
    renderUsbDrives(data.server?.usb_drives || [], data.server?.usb_last_activity || "");
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

async function checkAdminSession() {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch (_err) {
    return false;
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

bindUsbGrid();
bindConfirmModal();
renderClock();
setInterval(renderClock, 1000);
initTheme();
loadDashboard();
syncAdminSession();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncAdminSession();
});
setInterval(() => loadDashboard(false), 30000);
