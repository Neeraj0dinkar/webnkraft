/*
 * webnKraft Admin Dashboard
 * Requires @supabase/supabase-js v2 to be loaded before this file.
 */

const SUPABASE_URL = "https://pcqnjersuxikgygemuef.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2WqOqYdSooRt8QpRIqkEZA_RfgFSBW8";
const ADMIN_EMAIL = "neeraj0dinkar0@gmail.com";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const els = {
  adminEmail: document.getElementById("adminEmail"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  searchInput: document.getElementById("searchInput"),
  dashboardContent: document.getElementById("dashboardContent"),
  totalCount: document.getElementById("totalCount"),
  newCount: document.getElementById("newCount"),
  contactedCount: document.getElementById("contactedCount"),
  proposalCount: document.getElementById("proposalCount"),
  detailModal: document.getElementById("detailModal"),
  detailSubmitted: document.getElementById("detailSubmitted"),
  detailContent: document.getElementById("detailContent"),
  closeModal: document.getElementById("closeModal"),
  saveDetails: document.getElementById("saveDetails")
};

let enquiries = [];
let selectedEnquiry = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatArray(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (value == null || value === "") return "—";
  return String(value);
}

function statusBadge(status) {
  const normalized = String(status || "new").toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `<span class="status-badge status-${escapeHtml(normalized)}">${escapeHtml(label)}</span>`;
}

function priorityBadge(priority) {
  const normalized = String(priority || "medium").toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `<span class="priority-badge priority-${escapeHtml(normalized)}">${escapeHtml(label)}</span>`;
}

function injectDashboardStyles() {
  if (document.getElementById("webnkraft-dashboard-styles")) return;

  const style = document.createElement("style");
  style.id = "webnkraft-dashboard-styles";
  style.textContent = `
    .admin-error {
      padding: 24px;
      margin: 12px 0;
      border: 1px solid #f1b7b7;
      border-radius: 10px;
      background: #fff5f5;
      color: #9b1c1c;
      line-height: 1.6;
    }
    .admin-error strong { display:block; margin-bottom:6px; }
    .table-wrap { width:100%; overflow-x:auto; }
    .enquiry-table { width:100%; border-collapse:collapse; min-width:1080px; }
    .enquiry-table th, .enquiry-table td { padding:14px 12px; border-bottom:1px solid #e8ebf1; text-align:left; vertical-align:top; }
    .enquiry-table th { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:#667085; background:#fafbfc; }
    .enquiry-table td { font-size:14px; color:#172033; }
    .customer-name { font-weight:700; }
    .customer-business { color:#667085; margin-top:3px; }
    .contact-link { color:#4f46e5; text-decoration:none; }
    .contact-link:hover { text-decoration:underline; }
    .row-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .view-btn, .quick-save { border:1px solid #d7dce5; background:#fff; border-radius:7px; padding:7px 10px; cursor:pointer; font-weight:600; }
    .view-btn:hover, .quick-save:hover { background:#f6f7fb; }
    .quick-status { border:1px solid #d7dce5; border-radius:7px; padding:7px 8px; background:#fff; }
    .status-badge, .priority-badge { display:inline-block; border-radius:999px; padding:4px 9px; font-size:12px; font-weight:700; }
    .status-new { background:#eef2ff; color:#3730a3; }
    .status-contacted { background:#ecfeff; color:#155e75; }
    .status-proposal { background:#fff7ed; color:#9a3412; }
    .status-won { background:#ecfdf3; color:#166534; }
    .status-lost { background:#fef2f2; color:#991b1b; }
    .priority-low { background:#f2f4f7; color:#475467; }
    .priority-medium { background:#eff6ff; color:#1d4ed8; }
    .priority-high { background:#fff1f2; color:#be123c; }
    .empty-state { padding:42px 20px; text-align:center; color:#667085; }
    .detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; padding:24px; }
    .detail-item.full { grid-column:1/-1; }
    .detail-label { display:block; color:#667085; font-size:12px; margin-bottom:6px; font-weight:600; }
    .detail-value { color:#172033; font-size:14px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
    .detail-input, .detail-select, .detail-textarea { width:100%; box-sizing:border-box; border:1px solid #d7dce5; border-radius:8px; padding:10px 11px; font-size:14px; background:#fff; }
    .detail-textarea { min-height:100px; resize:vertical; }
    .detail-readonly { background:#f8fafc; border-radius:8px; padding:10px 11px; }
    .modal-actions { padding:18px 24px; border-top:1px solid #e8ebf1; display:flex; justify-content:flex-end; gap:10px; }
    .save-details { border:0; background:#635bff; color:#fff; border-radius:9px; padding:11px 20px; font-weight:700; cursor:pointer; }
    .save-details:disabled { opacity:.6; cursor:not-allowed; }
    .detail-success { color:#166534; font-weight:600; }
    @media(max-width:650px){ .detail-grid{grid-template-columns:1fr}.detail-item.full{grid-column:auto} }
  `;
  document.head.appendChild(style);
}

function showError(title, message) {
  els.dashboardContent.className = "admin-error";
  els.dashboardContent.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(message)}`;
}

function updateStats() {
  els.totalCount.textContent = enquiries.length;
  els.newCount.textContent = enquiries.filter(item => item.status === "new").length;
  els.contactedCount.textContent = enquiries.filter(item => item.status === "contacted").length;
  els.proposalCount.textContent = enquiries.filter(item => item.status === "proposal").length;
}

function filteredEnquiries() {
  const query = String(els.searchInput.value || "").trim().toLowerCase();
  if (!query) return enquiries;

  return enquiries.filter(item => {
    const haystack = [
      item.name,
      item.email,
      item.phone,
      item.business_name,
      item.project_type,
      item.status,
      item.priority,
      item.assigned_to,
      item.description,
      item.notes
    ].map(value => formatArray(value)).join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderTable() {
  const rows = filteredEnquiries();

  if (!rows.length) {
    els.dashboardContent.className = "empty-state";
    els.dashboardContent.textContent = enquiries.length ? "No enquiries match your search." : "No enquiries found.";
    return;
  }

  els.dashboardContent.className = "";
  els.dashboardContent.innerHTML = `
    <div class="table-wrap">
      <table class="enquiry-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Project</th>
            <th>Budget</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(item => `
            <tr>
              <td>
                <div class="customer-name">${escapeHtml(item.name || "—")}</div>
                <div class="customer-business">${escapeHtml(item.business_name || "—")}</div>
              </td>
              <td>
                <div><a class="contact-link" href="mailto:${escapeHtml(item.email || "")}">${escapeHtml(item.email || "—")}</a></div>
                <div>${escapeHtml(item.phone || "—")}</div>
              </td>
              <td>
                <div>${escapeHtml(item.project_type || "—")}</div>
                <div class="customer-business">${escapeHtml(formatArray(item.features))}</div>
              </td>
              <td>${escapeHtml(item.budget || "—")}</td>
              <td>${escapeHtml(formatDate(item.created_at))}</td>
              <td>${statusBadge(item.status)}</td>
              <td>${priorityBadge(item.priority)}</td>
              <td>
                <div class="row-actions">
                  <button class="view-btn" type="button" data-view-id="${escapeHtml(item.id)}">View details</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  els.dashboardContent.querySelectorAll("[data-view-id]").forEach(button => {
    button.addEventListener("click", () => openDetails(button.dataset.viewId));
  });
}

async function loadEnquiries() {
  els.dashboardContent.className = "loading";
  els.dashboardContent.textContent = "Loading enquiries...";
  els.refreshBtn.disabled = true;

  try {
    const { data, error } = await supabaseClient
      .from("project_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    enquiries = data || [];
    updateStats();
    renderTable();
  } catch (error) {
    console.error("Admin enquiry load failed:", error);
    showError(
      "Unable to load enquiries.",
      error?.message || "Please check the Supabase authentication and table permissions."
    );
  } finally {
    els.refreshBtn.disabled = false;
  }
}

function openDetails(id) {
  const enquiry = enquiries.find(item => item.id === id);
  if (!enquiry) return;

  selectedEnquiry = enquiry;
  els.detailSubmitted.textContent = `Submitted ${formatDate(enquiry.created_at)}`;

  els.detailContent.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">Name</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.name || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Business</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.business_name || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Email</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.email || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Phone</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.phone || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Project type</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.project_type || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Features</span>
        <div class="detail-value detail-readonly">${escapeHtml(formatArray(enquiry.features))}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">AI video / visual content</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.video_requirement || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Budget</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.budget || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Launch timeline</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.launch_timeline || "—")}</div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Source</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.source || "—")}</div>
      </div>
      <div class="detail-item full">
        <span class="detail-label">Business description</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.description || "—")}</div>
      </div>
      <div class="detail-item full">
        <span class="detail-label">Customer notes</span>
        <div class="detail-value detail-readonly">${escapeHtml(enquiry.notes || "—")}</div>
      </div>

      <div class="detail-item">
        <label class="detail-label" for="editStatus">Status</label>
        <select id="editStatus" class="detail-select">
          ${["new", "contacted", "proposal", "won", "lost"].map(value => `<option value="${value}" ${enquiry.status === value ? "selected" : ""}>${value.charAt(0).toUpperCase() + value.slice(1)}</option>`).join("")}
        </select>
      </div>
      <div class="detail-item">
        <label class="detail-label" for="editPriority">Priority</label>
        <select id="editPriority" class="detail-select">
          ${["low", "medium", "high"].map(value => `<option value="${value}" ${enquiry.priority === value ? "selected" : ""}>${value.charAt(0).toUpperCase() + value.slice(1)}</option>`).join("")}
        </select>
      </div>
      <div class="detail-item">
        <label class="detail-label" for="editFollowUp">Follow-up date</label>
        <input id="editFollowUp" class="detail-input" type="date" value="${escapeHtml(enquiry.follow_up_date || "")}">
      </div>
      <div class="detail-item">
        <label class="detail-label" for="editAssignedTo">Assigned to</label>
        <input id="editAssignedTo" class="detail-input" type="text" value="${escapeHtml(enquiry.assigned_to || "")}" placeholder="e.g. Neeraj">
      </div>
      <div class="detail-item">
        <label class="detail-label" for="editProposalAmount">Proposal amount</label>
        <input id="editProposalAmount" class="detail-input" type="number" min="0" step="0.01" value="${escapeHtml(enquiry.proposal_amount ?? "")}" placeholder="Amount in INR">
      </div>
      <div class="detail-item full">
        <label class="detail-label" for="editInternalNotes">Internal notes</label>
        <textarea id="editInternalNotes" class="detail-textarea" placeholder="Add internal follow-up notes...">${escapeHtml(enquiry.internal_notes || "")}</textarea>
      </div>
    </div>
  `;

  els.detailModal.hidden = false;
}

function closeDetails() {
  selectedEnquiry = null;
  els.detailModal.hidden = true;
  els.detailContent.innerHTML = "";
}

async function saveDetails() {
  if (!selectedEnquiry) return;

  const proposalValue = document.getElementById("editProposalAmount").value.trim();
  const updates = {
    status: document.getElementById("editStatus").value,
    priority: document.getElementById("editPriority").value,
    follow_up_date: document.getElementById("editFollowUp").value || null,
    assigned_to: document.getElementById("editAssignedTo").value.trim() || null,
    proposal_amount: proposalValue === "" ? null : Number(proposalValue),
    internal_notes: document.getElementById("editInternalNotes").value.trim() || null
  };

  els.saveDetails.disabled = true;
  els.saveDetails.textContent = "Saving...";

  try {
    const { data, error } = await supabaseClient
      .from("project_enquiries")
      .update(updates)
      .eq("id", selectedEnquiry.id)
      .select()
      .single();

    if (error) throw error;

    const index = enquiries.findIndex(item => item.id === selectedEnquiry.id);
    if (index >= 0) enquiries[index] = data;
    selectedEnquiry = data;

    updateStats();
    renderTable();
    els.saveDetails.textContent = "Saved ✓";
    setTimeout(() => {
      if (els.saveDetails) {
        els.saveDetails.textContent = "Save changes";
        els.saveDetails.disabled = false;
      }
    }, 1000);
  } catch (error) {
    console.error("Admin enquiry update failed:", error);
    alert(`Unable to save changes.\n\n${error?.message || "Unknown error"}`);
    els.saveDetails.textContent = "Save changes";
    els.saveDetails.disabled = false;
  }
}

async function initialiseAdmin() {
  injectDashboardStyles();

  try {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData?.user) {
      window.location.href = "index.html";
      return;
    }

    const user = userData.user;
    els.adminEmail.textContent = user.email || "";

    // Keep the existing test admin account restricted at the browser layer.
    // Database RLS must still enforce the real authorization boundary.
    if (ADMIN_EMAIL && user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      showError("Administrator access required.", "This Supabase account is not authorised for the webnKraft admin dashboard.");
      await supabaseClient.auth.signOut();
      return;
    }

    await loadEnquiries();
  } catch (error) {
    console.error("Admin initialisation failed:", error);
    showError("Unable to initialise the dashboard.", error?.message || "Please sign in again.");
  }
}

els.logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
});

els.refreshBtn.addEventListener("click", loadEnquiries);
els.searchInput.addEventListener("input", renderTable);
els.closeModal.addEventListener("click", closeDetails);
els.saveDetails.addEventListener("click", saveDetails);
els.detailModal.addEventListener("click", event => {
  if (event.target === els.detailModal) closeDetails();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !els.detailModal.hidden) closeDetails();
});

initialiseAdmin();
