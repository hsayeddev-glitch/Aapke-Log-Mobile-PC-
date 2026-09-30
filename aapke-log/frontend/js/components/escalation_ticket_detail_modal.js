/** AAPKE LOG - Detailed Society Escalation Ticket Modal */

function formatDate(value) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function isImageReference(value) {
  return typeof value === 'string' && (value.startsWith('/uploads/evidence/') || /^https?:\/\/.+\.(jpe?g|png|webp)(\?.*)?$/i.test(value));
}

export function renderEscalationTicketDetailModal(ticket) {
  const history = Array.isArray(ticket.history) ? ticket.history : [];
  const progressReports = Array.isArray(ticket.progress_reports) ? ticket.progress_reports : [];
  const fieldEvidence = Array.isArray(ticket.field_evidence) ? ticket.field_evidence : [];
  const actionRequired = Boolean(ticket.official_action_required);

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div class="sticky top-0 z-10 bg-white rounded-t-3xl p-5 sm:px-8 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono font-black text-slate-900">${ticket.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black ${actionRequired ? 'bg-red-600 text-white urgent-pulse' : 'bg-red-50 text-[#C62828] border border-red-200'}">LEVEL ${ticket.escalation_level}</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 mt-1">ESCALATION TICKET DETAILS</h2>
            <p class="text-xs text-slate-500">${ticket.ticket_status}</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold" aria-label="Close ticket details">✕</button>
        </div>

        <div class="p-6 sm:p-8 space-y-6 text-xs">
          ${actionRequired ? `<div class="rounded-2xl bg-red-50 border border-red-300 p-4 text-red-800 font-bold">⚠️ Level 3 deadline expired. Government/Admin official action is required.</div>` : ''}

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold text-slate-500">Current Deadline</p>
              <p class="font-black text-slate-900 mt-1">${formatDate(ticket.current_deadline)}</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold text-slate-500">Remaining Time</p>
              <p class="font-black ${ticket.remaining_seconds !== null && ticket.remaining_seconds <= 0 ? 'text-[#C62828]' : 'text-[#147D86]'} mt-1">${ticket.remaining_label || 'N/A'}</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold text-slate-500">Created</p>
              <p class="font-black text-slate-900 mt-1">${formatDate(ticket.created_at)}</p>
            </div>
          </div>

          <section class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h3 class="text-sm font-black text-slate-900">Related Problem</h3>
            <p class="font-mono font-bold text-[#173F5F]">${ticket.problem_id}</p>
            <p class="font-bold text-slate-900">${ticket.problem_title || ticket.problem_id}</p>
            <p><strong>Society:</strong> <span class="text-slate-600">${ticket.society_name}</span></p>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section class="border border-slate-200 rounded-2xl p-4 space-y-2">
              <h3 class="text-sm font-black text-slate-900">Complaint</h3>
              <p><strong>Reason:</strong> <span class="text-slate-600">${ticket.reason}</span></p>
              <p><strong>Incomplete work:</strong> <span class="text-slate-600">${ticket.what_remains_unresolved}</span></p>
              ${ticket.additional_notes ? `<p><strong>Additional notes:</strong> <span class="text-slate-600">${ticket.additional_notes}</span></p>` : ''}
            </section>
            <section class="border border-slate-200 rounded-2xl p-4 space-y-2">
              <h3 class="text-sm font-black text-slate-900">Responsibility & Status</h3>
              <p><strong>Assigned solver/team:</strong> <span class="text-slate-600">${ticket.previous_solver || 'Unassigned'}</span></p>
              <p><strong>Government officer:</strong> <span class="text-slate-600">${ticket.responsible_officer || 'Not assigned'}</span></p>
              <p><strong>Ticket status:</strong> <span class="text-slate-600">${ticket.ticket_status}</span></p>
              <p><strong>Current level started:</strong> <span class="text-slate-600">${formatDate(ticket.level_started_at)}</span></p>
            </section>
          </div>

          <section class="space-y-3">
            <h3 class="text-sm font-black text-slate-900">Submitted Evidence</h3>
            ${ticket.evidence ? (isImageReference(ticket.evidence) ? `
              <a href="${ticket.evidence}" target="_blank" rel="noopener noreferrer" class="block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src="${ticket.evidence}" alt="Evidence submitted with ticket ${ticket.id}" class="w-full max-h-80 object-contain bg-slate-100">
                <p class="px-3 py-2 text-[11px] font-semibold text-slate-500 border-t border-slate-200">Open evidence full size</p>
              </a>
            ` : `<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">${ticket.evidence}</div>`) : `
              <div class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center">
                <div class="text-3xl">📷</div><p class="font-bold text-slate-900 mt-2">No ticket evidence image submitted</p>
              </div>
            `}
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section class="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div>
                <h3 class="text-sm font-black text-slate-900">Progress Reports</h3>
                <p class="text-[10px] text-slate-500">PDF/DOC/DOCX submissions from the responsible team.</p>
              </div>
              ${progressReports.length ? `<div class="space-y-2">${progressReports.map(report => `
                <a href="${report.url}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 hover:border-[#173F5F] transition">
                  <span class="text-2xl">📄</span>
                  <span class="min-w-0"><strong class="block text-slate-900 truncate">${report.original_name}</strong><small class="text-slate-500">${formatDate(report.uploaded_at)} • ${(report.size_bytes / 1024 / 1024).toFixed(2)} MB</small></span>
                </a>
              `).join('')}</div>` : `<p class="text-slate-500">No progress report uploaded.</p>`}
            </section>

            <section class="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div>
                <h3 class="text-sm font-black text-slate-900">Field-work Evidence</h3>
                <p class="text-[10px] text-slate-500">Photographs submitted by the responsible team.</p>
              </div>
              ${fieldEvidence.length ? `<div class="grid grid-cols-2 gap-2">${fieldEvidence.map((image, index) => `
                <a href="${image.url}" target="_blank" rel="noopener noreferrer" class="block rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src="${image.url}" alt="Field evidence ${index + 1}" class="w-full h-28 object-cover">
                  <p class="p-2 text-[10px] font-semibold text-slate-600 truncate">${image.original_name}</p>
                </a>
              `).join('')}</div>` : `<p class="text-slate-500">No field evidence uploaded.</p>`}
            </section>
          </div>

          <section class="space-y-3">
            <h3 class="text-sm font-black text-slate-900">Escalation History</h3>
            ${history.length ? `<div class="space-y-2">${history.map((entry, index) => `
              <div class="flex gap-3 rounded-xl border border-slate-200 p-3 ${entry.automatic ? 'bg-amber-50/50' : 'bg-slate-50'}">
                <span class="w-6 h-6 rounded-full bg-[#173F5F] text-white flex items-center justify-center text-[10px] font-bold shrink-0">${index + 1}</span>
                <div>
                  <p class="font-bold text-slate-900">${entry.event || entry.note || entry.response || 'Ticket update'}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">${formatDate(entry.timestamp || entry.date)}${entry.automatic ? ' • Automatic deadline transition' : ''}</p>
                </div>
              </div>
            `).join('')}</div>` : `<p class="text-slate-500">No previous escalation history.</p>`}
          </section>

          <section class="rounded-2xl border border-slate-200 p-4 space-y-2">
            <h3 class="text-sm font-black text-slate-900">Completion Report / Team Status</h3>
            ${ticket.completion_report ? `
              <p class="text-slate-700">${ticket.completion_report}</p>
              <p class="text-[10px] text-slate-500">Submitted ${formatDate(ticket.completion_reported_at)}</p>
            ` : ticket.team_response ? `<p class="text-slate-700">${ticket.team_response}</p>` : `<p class="text-slate-500">No completion report has been submitted.</p>`}
          </section>

          <div class="flex justify-end pt-2 border-t border-slate-200">
            <button onclick="window.app.closeModal()" class="btn-secondary px-5 py-2.5 rounded-xl font-bold">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
