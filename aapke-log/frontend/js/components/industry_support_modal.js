/**
 * BMC review popup for persisted Industry/Startup support contributions.
 */

export function renderIndustrySupportModal(data) {
  const support = data.support || [];
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20">
              🏢 INDUSTRY SUPPORT REVIEW
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-2">${escapeHtml(data.problem_title)}</h2>
            <p class="text-xs text-slate-500 mt-1">Problem ${escapeHtml(data.problem_id)} • ${support.length} support submission(s)</p>
          </div>
          <button type="button" onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold">✕</button>
        </div>

        ${support.length ? `
          <div class="space-y-3">
            ${support.map(entry => `
              <article class="rounded-2xl border border-[#DDE4E8] bg-[#F7F9F8] p-4 space-y-3">
                <div class="flex flex-wrap justify-between gap-3">
                  <div>
                    <p class="text-xs text-[#667085]">Industry / Startup</p>
                    <h3 class="text-sm font-black text-[#17212B]">${escapeHtml(entry.organization_name || entry.voter_name)}</h3>
                  </div>
                  <span class="h-fit px-2.5 py-1 rounded-full text-[10px] font-black bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20">
                    ${escapeHtml(entry.status || 'Submitted')}
                  </span>
                </div>
                <div class="rounded-xl bg-white border border-[#DDE4E8] p-3">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-[#667085]">How they can help / contribute</p>
                  <p class="text-sm text-[#17212B] leading-relaxed mt-1 whitespace-pre-wrap">${entry.contribution ? escapeHtml(entry.contribution) : '<span class="italic text-[#667085]">No contribution text was recorded for this legacy support vote.</span>'}</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#667085]">
                  <p><strong class="text-[#17212B]">Problem:</strong> ${escapeHtml(data.problem_title)}</p>
                  <p><strong class="text-[#17212B]">Submitted:</strong> ${formatDate(entry.voted_at)}</p>
                  <p><strong class="text-[#17212B]">Support status:</strong> ${escapeHtml(entry.status || 'Submitted')}</p>
                  <p><strong class="text-[#17212B]">BMC notification:</strong> ${escapeHtml(entry.bmc_notification_status || 'Notified')}</p>
                </div>
              </article>
            `).join('')}
          </div>
        ` : `
          <div class="rounded-2xl border border-dashed border-[#DDE4E8] bg-[#F7F9F8] p-8 text-center">
            <p class="text-3xl">🏢</p>
            <p class="text-sm font-bold text-[#17212B] mt-2">No Industry/Startup support submitted yet.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function formatDate(value) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? escapeHtml(value) : parsed.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}