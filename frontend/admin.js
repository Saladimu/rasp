let csrfToken = "";
let lastApps = [];
let lastWebsites = [];

function show(el, on) {
  el.classList.toggle("hidden", !on);
}

function setAlert(id, message) {
  const el = document.getElementById(id);
  el.textContent = message || "";
  el.classList.toggle("show", Boolean(message));
}

async function api(path, options = {}) {
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  if (csrfToken && options.method && options.method !== "GET") {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const res = await fetch(path, Object.assign({}, options, { headers, credentials: "same-origin" }));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  if (data.csrf_token) csrfToken = data.csrf_token;
  return data;
}

async function refreshSession() {
  const data = await api("/api/auth/session");
  csrfToken = data.csrf_token || csrfToken;
  return data;
}

function fillForm(entry, kind) {
  const form = document.getElementById("app-form");
  form.id.value = entry?.id || "";
  form.kind.value = kind;
  form.name.value = entry?.name || "";
  form.description.value = entry?.description || "";
  form.url.value = entry?.url || "";
  const defaultIcon = kind === "website" ? "globe" : "layout-grid";
  form.icon.value = entry?.icon && !String(entry.icon).startsWith("custom:") ? entry.icon : defaultIcon;
  if (entry?.icon && String(entry.icon).startsWith("custom:")) {
    const option = document.createElement("option");
    option.value = entry.icon;
    option.textContent = "Custom icon";
    option.selected = true;
    form.icon.appendChild(option);
  }
  form.health_url.value = entry?.health_url || "";
  form.health_method.value = entry?.health_method || (kind === "website" ? "https" : "http");
  form.health_port.value = entry?.health_port || "";
  form.display_order.value = entry?.id
    ? (entry.display_order || 0)
    : nextDisplayOrder(kind === "website" ? lastWebsites : lastApps);
  form.monitoring_enabled.checked = entry?.monitoring_enabled !== false;
  form.visible.checked = entry?.visible !== false;
  const noun = kind === "website" ? "website" : "application";
  document.getElementById("modal-title").textContent = entry?.id ? `Edit ${noun}` : `Add ${noun}`;
  document.getElementById("url-label").firstChild.textContent = kind === "website" ? "Website URL " : "Application URL ";
  form.url.placeholder = kind === "website" ? "https://saladimu.my.id" : "http://127.0.0.1:8081";
  setAlert("form-error", "");
}

function nextDisplayOrder(items) {
  return (items || []).reduce((max, item) => Math.max(max, Number(item.display_order) || 0), 0) + 1;
}

function renderTable(targetId, items, kind) {
  const body = document.getElementById(targetId);
  body.innerHTML = (items || []).map((entry) => `
    <tr class="${entry.visible ? "" : "is-hidden"}">
      <td><strong>${escapeHtml(entry.name)}</strong><br><span class="muted">${escapeHtml(entry.description || "")}</span></td>
      <td>${escapeHtml(entry.url)}</td>
      <td>${escapeHtml(entry.health_method)} ${escapeHtml(entry.health_url || "")}<br><span class="muted">${entry.monitoring_enabled ? "Monitoring on" : "Monitoring off"}</span></td>
      <td>
        <label class="visibility-toggle">
          <input type="checkbox" data-kind="${kind}" data-visible="${entry.id}" ${entry.visible ? "checked" : ""}>
          ${entry.visible ? "Shown" : "Hidden"}
        </label>
      </td>
      <td>${entry.display_order}</td>
      <td class="actions">
        <button class="btn secondary" data-kind="${kind}" data-edit="${entry.id}">Edit</button>
        <button class="btn danger" data-kind="${kind}" data-delete="${entry.id}">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6" class="muted">No ${kind === "website" ? "websites" : "applications"} yet.</td></tr>`;
}

async function loadAdminLists() {
  const [appsData, sitesData] = await Promise.all([
    api("/api/admin/apps"),
    api("/api/admin/websites")
  ]);
  lastApps = appsData.apps || [];
  lastWebsites = sitesData.websites || [];
  renderTable("app-table", lastApps, "application");
  renderTable("website-table", lastWebsites, "website");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openModal(entry, kind) {
  fillForm(entry, kind);
  show(document.getElementById("modal"), true);
}

function closeModal() {
  show(document.getElementById("modal"), false);
}

function sectionStateKey(name) {
  return `admin-section-${name}`;
}

function setSectionCollapsed(section, collapsed) {
  section.classList.toggle("is-collapsed", collapsed);
  const toggle = section.querySelector(".section-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  const name = section.getAttribute("data-section");
  if (name) localStorage.setItem(sectionStateKey(name), collapsed ? "1" : "0");
}

function initCollapsibleSections() {
  document.querySelectorAll(".admin-section[data-section]").forEach((section) => {
    const name = section.getAttribute("data-section");
    const stored = localStorage.getItem(sectionStateKey(name));
    setSectionCollapsed(section, stored === "1");
    const toggle = section.querySelector(".section-toggle");
    if (!toggle || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", () => {
      setSectionCollapsed(section, !section.classList.contains("is-collapsed"));
    });
  });
}

async function loadAlertSettings() {
  const data = await api("/api/admin/alerts");
  const form = document.getElementById("alert-form");
  form.alert_enabled.checked = Boolean(data.alert_enabled);
  form.telegram_bot_token.value = "";
  form.telegram_bot_token.placeholder = data.telegram_configured ? "Saved. Leave blank to keep." : "Leave blank to keep current";
  form.telegram_chat_id.value = data.telegram_chat_id || "";
  form.webhook_url.value = data.webhook_url || "";
  form.fail_threshold.value = data.fail_threshold || 2;
  form.timezone.value = data.timezone || "UTC";
  form.quiet_start.value = data.quiet_start || "";
  form.quiet_end.value = data.quiet_end || "";
  setAlert("alert-error", "");
  setAlert("alert-ok", "");
}

async function enterAdmin(username) {
  document.getElementById("admin-user").textContent = username;
  show(document.getElementById("login-panel"), false);
  show(document.getElementById("admin-panel"), true);
  initCollapsibleSections();
  await loadAdminLists();
  await loadAlertSettings();
  await loadHealthcheckHosts();
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value
      })
    });
    await enterAdmin(data.username);
  } catch (err) {
    setAlert("login-error", err.message);
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  window.location.reload();
});

document.getElementById("add-btn").addEventListener("click", () => openModal(null, "application"));
document.getElementById("add-website-btn").addEventListener("click", () => openModal(null, "website"));
document.getElementById("cancel-btn").addEventListener("click", closeModal);

async function handleTableClick(event) {
  const kind = event.target.getAttribute("data-kind");
  const editId = event.target.getAttribute("data-edit");
  const deleteId = event.target.getAttribute("data-delete");
  const visibleId = event.target.getAttribute("data-visible");
  if (!kind) return;
  const endpoint = kind === "website" ? "websites" : "apps";
  if (visibleId) {
    await api(`/api/admin/${endpoint}/${visibleId}/visibility`, {
      method: "PUT",
      body: JSON.stringify({ visible: event.target.checked })
    });
    await loadAdminLists();
    return;
  }
  if (editId) {
    const data = await api(`/api/admin/${endpoint}`);
    const items = data.apps || data.websites || [];
    const entry = items.find((item) => String(item.id) === editId);
    openModal(entry, kind);
  }
  if (deleteId) {
    const noun = kind === "website" ? "website" : "application";
    if (!window.confirm(`Delete this ${noun}?`)) return;
    await api(`/api/admin/${endpoint}/${deleteId}`, { method: "DELETE" });
    await loadAdminLists();
  }
}

document.getElementById("app-table").addEventListener("click", handleTableClick);
document.getElementById("website-table").addEventListener("click", handleTableClick);

document.getElementById("icon-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/icons", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    body,
    credentials: "same-origin"
  });
  const data = await res.json();
  if (!res.ok) {
    setAlert("form-error", data.detail || "Icon upload failed");
    return;
  }
  const select = document.querySelector("select[name='icon']");
  let option = Array.from(select.options).find((item) => item.value === data.icon);
  if (!option) {
    option = document.createElement("option");
    option.value = data.icon;
    option.textContent = "Custom icon";
    select.appendChild(option);
  }
  option.selected = true;
});

document.getElementById("app-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const kind = form.kind.value || "application";
  const endpoint = kind === "website" ? "websites" : "apps";
  const payload = {
    name: form.name.value,
    description: form.description.value,
    url: form.url.value,
    icon: form.icon.value,
    health_url: form.health_url.value,
    health_method: form.health_method.value,
    health_port: form.health_port.value ? Number(form.health_port.value) : null,
    monitoring_enabled: form.monitoring_enabled.checked,
    visible: form.visible.checked,
    display_order: Number(form.display_order.value || 0),
    kind
  };
  try {
    if (form.id.value) {
      await api(`/api/admin/${endpoint}/${form.id.value}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api(`/api/admin/${endpoint}`, { method: "POST", body: JSON.stringify(payload) });
    }
    closeModal();
    await loadAdminLists();
  } catch (err) {
    setAlert("form-error", err.message);
  }
});

document.getElementById("alert-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    await api("/api/admin/alerts", {
      method: "PUT",
      body: JSON.stringify({
        alert_enabled: form.alert_enabled.checked,
        telegram_bot_token: form.telegram_bot_token.value || null,
        telegram_chat_id: form.telegram_chat_id.value,
        webhook_url: form.webhook_url.value,
        fail_threshold: Number(form.fail_threshold.value || 2),
        quiet_start: form.quiet_start.value,
        quiet_end: form.quiet_end.value,
        timezone: form.timezone.value || "UTC"
      })
    });
    await loadAlertSettings();
    setAlert("alert-ok", "Alert settings saved.");
  } catch (err) {
    setAlert("alert-error", err.message);
  }
});

async function loadHealthcheckHosts() {
  const data = await api("/api/admin/healthcheck-hosts");
  const extraHosts = data.extra_hosts || [];
  const hosts = data.hosts || [];
  const envLabel = (data.env_hosts || []).join(", ") || "none";
  document.getElementById("env-hosts").textContent = `From .env: ${envLabel}`;
  const body = document.getElementById("host-table");
  body.innerHTML = hosts.map((host) => {
    const extra = extraHosts.includes(host);
    return `
      <tr>
        <td>${escapeHtml(host)}</td>
        <td>${extra ? "Admin" : ".env"}</td>
        <td class="actions">
          ${extra ? `<button class="btn danger" data-remove-host="${escapeHtml(host)}" type="button">Remove</button>` : `<span class="muted">Locked</span>`}
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="3" class="muted">No hosts yet.</td></tr>`;
  setAlert("host-error", "");
}

document.getElementById("host-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    await api("/api/admin/healthcheck-hosts", {
      method: "POST",
      body: JSON.stringify({ host: form.host.value })
    });
    form.host.value = "";
    await loadHealthcheckHosts();
    setAlert("host-ok", "Host added. You can save the application now.");
  } catch (err) {
    setAlert("host-error", err.message);
    setAlert("host-ok", "");
  }
});

document.getElementById("host-table").addEventListener("click", async (event) => {
  const host = event.target.getAttribute("data-remove-host");
  if (!host) return;
  try {
    await api(`/api/admin/healthcheck-hosts/${encodeURIComponent(host)}`, { method: "DELETE" });
    await loadHealthcheckHosts();
    setAlert("host-ok", "Host removed.");
  } catch (err) {
    setAlert("host-error", err.message);
  }
});

document.getElementById("alert-test-btn").addEventListener("click", async () => {
  try {
    await api("/api/admin/alerts/test", { method: "POST", body: JSON.stringify({}) });
    setAlert("alert-ok", "Test alert sent.");
    setAlert("alert-error", "");
  } catch (err) {
    setAlert("alert-error", err.message);
    setAlert("alert-ok", "");
  }
});

refreshSession().then((session) => {
  if (session.authenticated) enterAdmin(session.username);
}).catch(() => {});
