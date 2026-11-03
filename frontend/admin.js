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

function fillForm(app) {
  const form = document.getElementById("app-form");
  form.id.value = app?.id || "";
  form.name.value = app?.name || "";
  form.description.value = app?.description || "";
  form.url.value = app?.url || "";
  form.icon.value = app?.icon && !String(app.icon).startsWith("custom:") ? app.icon : "layout-grid";
  if (app?.icon && String(app.icon).startsWith("custom:")) {
    const option = document.createElement("option");
    option.value = app.icon;
    option.textContent = "Custom icon";
    option.selected = true;
    form.icon.appendChild(option);
  }
  form.health_url.value = app?.health_url || "";
  form.health_method.value = app?.health_method || "http";
  form.health_port.value = app?.health_port || "";
  form.display_order.value = app?.display_order || 0;
  form.monitoring_enabled.checked = app?.monitoring_enabled !== false;
  document.getElementById("modal-title").textContent = app?.id ? "Edit application" : "Add application";
  setAlert("form-error", "");
}

async function loadAdminApps() {
  const data = await api("/api/admin/apps");
  const body = document.getElementById("app-table");
  body.innerHTML = data.apps.map((app) => `
    <tr>
      <td><strong>${escapeHtml(app.name)}</strong><br><span class="muted">${escapeHtml(app.description || "")}</span></td>
      <td>${escapeHtml(app.url)}</td>
      <td>${escapeHtml(app.health_method)} ${escapeHtml(app.health_url || "")}<br><span class="muted">${app.monitoring_enabled ? "Monitoring on" : "Monitoring off"}</span></td>
      <td>${app.display_order}</td>
      <td class="actions">
        <button class="btn secondary" data-edit="${app.id}">Edit</button>
        <button class="btn danger" data-delete="${app.id}">Delete</button>
      </td>
    </tr>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openModal(app) {
  fillForm(app);
  show(document.getElementById("modal"), true);
}

function closeModal() {
  show(document.getElementById("modal"), false);
}

async function enterAdmin(username) {
  document.getElementById("admin-user").textContent = username;
  show(document.getElementById("login-panel"), false);
  show(document.getElementById("admin-panel"), true);
  await loadAdminApps();
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

document.getElementById("add-btn").addEventListener("click", () => openModal(null));
document.getElementById("cancel-btn").addEventListener("click", closeModal);

document.getElementById("app-table").addEventListener("click", async (event) => {
  const editId = event.target.getAttribute("data-edit");
  const deleteId = event.target.getAttribute("data-delete");
  if (editId) {
    const data = await api("/api/admin/apps");
    const app = data.apps.find((item) => String(item.id) === editId);
    openModal(app);
  }
  if (deleteId) {
    if (!window.confirm("Delete this application?")) return;
    await api(`/api/admin/apps/${deleteId}`, { method: "DELETE" });
    await loadAdminApps();
  }
});

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
  const payload = {
    name: form.name.value,
    description: form.description.value,
    url: form.url.value,
    icon: form.icon.value,
    health_url: form.health_url.value,
    health_method: form.health_method.value,
    health_port: form.health_port.value ? Number(form.health_port.value) : null,
    monitoring_enabled: form.monitoring_enabled.checked,
    display_order: Number(form.display_order.value || 0)
  };
  try {
    if (form.id.value) {
      await api(`/api/admin/apps/${form.id.value}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/admin/apps", { method: "POST", body: JSON.stringify(payload) });
    }
    closeModal();
    await loadAdminApps();
  } catch (err) {
    setAlert("form-error", err.message);
  }
});

refreshSession().then((session) => {
  if (session.authenticated) enterAdmin(session.username);
}).catch(() => {});
