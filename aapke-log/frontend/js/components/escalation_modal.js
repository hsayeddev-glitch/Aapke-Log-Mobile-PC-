/**
 * AAPKE LOG - Society Raise a Ticket Modal
 * New tickets always start at Level 1. Higher levels are deadline-driven.
 */

export function renderEscalationModal(problem) {
  if (!problem) return '';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        <div class="flex items-start justify-between">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-50 text-[#C62828] border border-red-200">Support Escalation</span>
            <h2 class="text-xl font-black text-slate-900 mt-1">RAISE A TICKET</h2>
            <p class="text-xs text-slate-500 font-medium">Report incomplete or stopped work without creating a duplicate problem.</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold" aria-label="Close ticket form">✕</button>
        </div>

        <form id="escalation-form" onsubmit="window.app.handleEscalationSubmit(event, '${problem.id}')" class="space-y-5 text-xs">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-mono font-bold text-slate-900">${problem.id}</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-[#1769AA] font-bold border border-blue-200">${problem.status}</span>
            </div>
            <h3 class="font-black text-slate-900 text-sm">${problem.title}</h3>
            <p class="text-slate-600 leading-relaxed">${problem.description}</p>
            <p class="text-[11px] text-slate-500"><strong>Assigned solver/team:</strong> ${problem.assigned_solver || problem.recommended_solver || 'Unassigned'}</p>
          </div>

          <div>
            <label class="font-bold text-slate-800 block mb-2">Ticket Level</label>
            <div class="space-y-2">
              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-[#1769AA]/40 bg-blue-50/60 cursor-pointer">
                <input type="radio" name="esc-level" value="1" checked class="mt-0.5 text-[#1769AA]">
                <div>
                  <span class="font-extrabold text-slate-900 block">LEVEL 1 — Platform Support Review</span>
                  <span class="text-slate-600 text-[11px]">Starts immediately with a 5-day deadline. Government officer and assigned solver are notified.</span>
                </div>
              </label>
              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-100 opacity-65 cursor-not-allowed">
                <input type="radio" name="esc-level" value="2" disabled class="mt-0.5">
                <div>
                  <span class="font-extrabold text-slate-700 block">LEVEL 2 — Senior Solver Review 🔒</span>
                  <span class="text-slate-500 text-[11px]">Automatically starts only if Level 1 expires. Deadline: 10 days.</span>
                </div>
              </label>
              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-100 opacity-65 cursor-not-allowed">
                <input type="radio" name="esc-level" value="3" disabled class="mt-0.5">
                <div>
                  <span class="font-extrabold text-slate-700 block">LEVEL 3 — Higher Official / Authority Escalation 🔒</span>
                  <span class="text-slate-500 text-[11px]">Automatically starts only if Level 2 expires. Deadline: 5 days.</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Reason for raising the ticket *</label>
            <input type="text" id="esc-reason" required placeholder="e.g., Repair stopped and the street remains unsafe" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#C62828] focus:outline-none">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">What work is incomplete or stopped? *</label>
            <textarea id="esc-unresolved" rows="4" required placeholder="Describe exactly what remains incomplete, when work stopped, and the current impact..." class="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#C62828] focus:outline-none"></textarea>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Ticket Photo / Evidence</label>
            <input type="file" id="esc-evidence" accept="image/*" class="sr-only" onchange="window.app.handleTicketEvidenceSelected(event)">
            <div id="esc-evidence-empty" class="rounded-2xl border-2 border-dashed border-[#C62828]/30 bg-red-50/30 px-5 py-6 text-center">
              <div class="text-3xl" aria-hidden="true">📷</div>
              <p class="mt-2 text-sm font-bold text-slate-900">Add current ground evidence</p>
              <button type="button" onclick="document.getElementById('esc-evidence').click()" class="mt-3 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#A32020] text-white font-bold text-xs shadow-sm transition">Choose Image</button>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">JPG, PNG, WEBP • Max 5 MB</p>
            </div>
            <div id="esc-evidence-preview-wrap" class="hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <img id="esc-evidence-preview" src="" alt="Selected ticket evidence preview" class="w-full h-56 object-contain rounded-xl bg-slate-200">
              <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p id="esc-evidence-name" class="text-[11px] font-bold text-slate-900 break-all"></p>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="document.getElementById('esc-evidence').click()" class="px-3 py-1.5 rounded-lg border border-[#147D86] text-[#147D86] font-bold text-[11px]">Change Image</button>
                  <button type="button" onclick="window.app.removeTicketEvidence()" class="px-3 py-1.5 rounded-lg border border-[#C62828]/40 text-[#C62828] font-bold text-[11px]">Remove</button>
                </div>
              </div>
            </div>
            <p id="esc-evidence-error" class="hidden mt-2 text-[11px] font-semibold text-[#C62828]" role="alert"></p>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Additional notes</label>
            <textarea id="esc-notes" rows="2" placeholder="Emergency context or municipal references..." class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <p id="ticket-submit-status" class="hidden mr-auto text-[11px] font-semibold text-[#C62828]" aria-live="polite"></p>
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-4 py-2.5 font-bold">Cancel</button>
            <button id="ticket-submit-button" type="submit" class="px-5 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#A32020] text-white font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed">
              <span id="ticket-submit-label">Create Level 1 Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
