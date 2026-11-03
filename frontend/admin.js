let csrfToken = "";

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
  form.display_order.value = entry?.display_order || 0;
  form.monitoring_enabled.checked = entry?.monitoring_enabled !== false;
  form.visible.checked = entry?.visible !== false;
  const noun = kind === "website" ? "website" : "application";
  document.getElementById("modal-title").textContent = entry?.id ? `Edit ${noun}` : `Add ${noun}`;
  document.getElementById("url-label").firstChild.textContent = kind === "website" ? "Website URL " : "Application URL ";
  form.url.placeholder = kind === "website" ? "https://saladimu.my.id" : "http://127.0.0.1:8081";
  setAlert("form-error", "");
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
  renderTable("app-table", appsData.apps, "application");
  renderTable("website-table", sitesData.websites, "website");
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

async function enterAdmin(username) {
  document.getElementById("admin-user").textContent = username;
  show(document.getElementById("login-panel"), false);
  show(document.getElementById("admin-panel"), true);
  await loadAdminLists();
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

refreshSession().then((session) => {
  if (session.authenticated) enterAdmin(session.username);
}).catch(() => {});
