/** AAPKE LOG - Responsible Team Ticket Attachment Modal */

export function renderTicketAttachmentModal(ticket, attachmentType) {
  const isReport = attachmentType === 'progress_report';
  const title = isReport ? 'SUBMIT PROGRESS UPDATE' : 'UPLOAD FIELD EVIDENCE';
  const description = isReport
    ? 'Upload a PDF, DOC, or DOCX progress report for Government Officer/Admin review.'
    : 'Upload a current JPG, PNG, or WEBP photograph of the actual field work.';
  const accept = isReport ? '.pdf,.doc,.docx' : 'image/*';
  const allowed = isReport ? 'PDF, DOC, DOCX • Max 10 MB' : 'JPG, PNG, WEBP • Max 5 MB';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#173F5F]/10 text-[#173F5F] border border-[#173F5F]/20">Responsible Team Action</span>
            <h2 class="text-xl font-black text-slate-900 mt-1">${title}</h2>
            <p class="text-xs text-slate-500 mt-1">${description}</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold" aria-label="Close upload modal">✕</button>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
          <p><strong>Ticket:</strong> <span class="font-mono">${ticket.id}</span> • Level ${ticket.escalation_level}</p>
          <p><strong>Problem:</strong> ${ticket.problem_title || ticket.problem_id}</p>
          <p><strong>Deadline:</strong> ${ticket.current_deadline ? new Date(ticket.current_deadline).toLocaleString() : 'No active deadline'} • <span class="font-bold text-[#C62828]">${ticket.remaining_label || ''}</span></p>
        </div>

        <form onsubmit="window.app.handleTicketAttachmentSubmit(event)" class="space-y-4">
          <input type="file" id="ticket-attachment-file" accept="${accept}" class="sr-only" onchange="window.app.handleTicketAttachmentSelected(event)">
          <div id="ticket-attachment-empty" class="rounded-2xl border-2 border-dashed border-[#147D86]/35 bg-[#F7F9F8] px-5 py-8 text-center">
            <div class="text-3xl">${isReport ? '📄' : '📷'}</div>
            <p class="mt-2 text-sm font-bold text-[#17212B]">${isReport ? 'Choose a progress report' : 'Choose a field-work image'}</p>
            <button type="button" onclick="document.getElementById('ticket-attachment-file').click()" class="mt-4 px-4 py-2 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-bold text-xs shadow-sm transition">Choose File</button>
            <p class="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#667085]">${allowed}</p>
          </div>

          <div id="ticket-attachment-selected" class="hidden rounded-2xl border border-[#DDE4E8] bg-[#F7F9F8] p-4 space-y-3">
            ${isReport ? `<div class="text-center text-5xl">📄</div>` : `<img id="ticket-attachment-preview" src="" alt="Selected field evidence preview" class="w-full h-56 object-contain rounded-xl bg-slate-200">`}
            <p id="ticket-attachment-name" class="text-xs font-bold text-[#17212B] text-center break-all"></p>
            <div class="flex items-center justify-center gap-2">
              <button type="button" onclick="document.getElementById('ticket-attachment-file').click()" class="px-3 py-1.5 rounded-lg border border-[#147D86] text-[#147D86] font-bold text-[11px]">Replace</button>
              <button type="button" onclick="window.app.removeTicketAttachment()" class="px-3 py-1.5 rounded-lg border border-[#C62828]/40 text-[#C62828] font-bold text-[11px]">Remove</button>
            </div>
          </div>
          <p id="ticket-attachment-error" class="hidden text-[11px] font-semibold text-[#C62828]" role="alert"></p>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <p id="ticket-attachment-status" class="hidden mr-auto text-[11px] font-semibold text-[#147D86]" aria-live="polite"></p>
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-4 py-2.5 font-bold">Cancel</button>
            <button id="ticket-attachment-submit" type="submit" disabled class="px-5 py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span id="ticket-attachment-submit-label">${isReport ? 'Submit Progress Report' : 'Upload Field Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
