/**
 * AAPKE LOG - Society Problem Detail Modal
 * Displays the complete stored report without changing project navigation.
 */

function formatReportedAt(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function valueOrFallback(value, fallback = 'Not available') {
  return value === null || value === undefined || value === '' ? fallback : value;
}

export function renderSocietyProblemDetailModal(problem) {
  const evidenceImages = Array.isArray(problem.evidence_images)
    ? problem.evidence_images.filter(Boolean)
    : (problem.evidence_image ? [problem.evidence_image] : []);
  const affectedLabel = problem.affected_percentage === null || problem.affected_percentage === undefined
    ? 'N/A'
    : `${problem.affected_percentage}%`;
  const skills = Array.isArray(problem.required_skills) ? problem.required_skills : [];

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#DDE4E8] max-h-[92vh] overflow-y-auto">
        <div class="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 py-5 border-b border-[#DDE4E8] flex items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-bold text-[#667085]">${problem.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20">
                ${valueOrFallback(problem.ai_category || problem.initial_category)}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                ${valueOrFallback(problem.status)}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-[#17212B] leading-tight">${problem.title}</h2>
            <p class="text-xs text-[#667085] mt-1">Reported ${formatReportedAt(problem.created_at)}</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-[#667085] hover:text-[#17212B] text-2xl font-bold" aria-label="Close problem details">✕</button>
        </div>

        <div class="p-6 sm:p-8 space-y-6 text-xs">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold tracking-wide text-[#667085]">People Affected</p>
              <p class="text-xl font-black text-[#147D86] mt-1">${affectedLabel}</p>
              <p class="text-[10px] text-[#667085] mt-1">${problem.unique_voter_count || 0} unique votes / ${valueOrFallback(problem.society_population, 'Population N/A')}</p>
            </div>
            <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold tracking-wide text-[#667085]">Reported Impact</p>
              <p class="text-xl font-black text-[#17212B] mt-1">${Number(problem.people_affected || 0).toLocaleString()}</p>
              <p class="text-[10px] text-[#667085] mt-1">Estimated residents</p>
            </div>
            <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold tracking-wide text-[#667085]">Community Votes</p>
              <p class="text-xl font-black text-[#173F5F] mt-1">${problem.unique_voter_count || 0}</p>
              <p class="text-[10px] text-[#667085] mt-1">Unique verified citizens</p>
            </div>
            <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4">
              <p class="text-[10px] uppercase font-bold tracking-wide text-[#667085]">Project Progress</p>
              <p class="text-xl font-black text-[#2E7D5B] mt-1">${problem.project_progress || 0}%</p>
              <p class="text-[10px] text-[#667085] mt-1">${valueOrFallback(problem.project_stage, 'Not started')}</p>
            </div>
          </div>

          <section class="rounded-2xl border border-[#DDE4E8] bg-white p-4 space-y-3">
            <div>
              <h3 class="text-sm font-black text-[#17212B]">Vote & Support Participation</h3>
              <p class="text-[11px] text-[#667085]">Citizen community voting is tracked separately from willingness-to-help votes.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div class="rounded-xl bg-[#F7F9F8] border border-[#DDE4E8] p-3">
                <span class="text-[10px] uppercase font-bold text-[#667085] block">Citizen Votes</span>
                <strong class="text-xl font-black text-[#173F5F]">${Number(problem.community_votes || 0).toLocaleString()}</strong>
                <p class="text-[10px] text-[#667085]">Community priority support</p>
              </div>
              <div class="rounded-xl bg-[#F7F9F8] border border-[#DDE4E8] p-3">
                <span class="text-[10px] uppercase font-bold text-[#667085] block">Student/University Help</span>
                <strong class="text-xl font-black text-[#2E7D5B]">${problem.student_university_help_count || 0}</strong>
                <p class="text-[10px] text-[#667085]">Willingness to contribute</p>
              </div>
              <div class="rounded-xl bg-[#F7F9F8] border border-[#DDE4E8] p-3">
                <span class="text-[10px] uppercase font-bold text-[#667085] block">Industry/Startup Help</span>
                <strong class="text-xl font-black text-[#B7791F]">${problem.industry_startup_help_count || 0}</strong>
                <p class="text-[10px] text-[#667085]">Willingness to contribute</p>
              </div>
            </div>
          </section>

          <section class="space-y-2">
            <h3 class="text-sm font-black text-[#17212B]">Problem Description</h3>
            <p class="text-[#667085] leading-relaxed bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4">${valueOrFallback(problem.description)}</p>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section class="bg-white border border-[#DDE4E8] rounded-2xl p-4 space-y-2">
              <h3 class="text-sm font-black text-[#17212B]">Location & Society</h3>
              <p><span class="font-bold text-[#17212B]">Location:</span> <span class="text-[#667085]">${valueOrFallback(problem.location)}</span></p>
              <p><span class="font-bold text-[#17212B]">Ward:</span> <span class="text-[#667085]">${valueOrFallback(problem.ward)}</span></p>
              <p><span class="font-bold text-[#17212B]">Society:</span> <span class="text-[#667085]">${valueOrFallback(problem.society_name)}</span></p>
              <p><span class="font-bold text-[#17212B]">Society population:</span> <span class="text-[#667085]">${valueOrFallback(problem.society_population)}</span></p>
            </section>
            <section class="bg-white border border-[#DDE4E8] rounded-2xl p-4 space-y-2">
              <h3 class="text-sm font-black text-[#17212B]">Report Information</h3>
              <p><span class="font-bold text-[#17212B]">Category:</span> <span class="text-[#667085]">${valueOrFallback(problem.ai_category || problem.initial_category)}</span></p>
              <p><span class="font-bold text-[#17212B]">Frequency:</span> <span class="text-[#667085]">${valueOrFallback(problem.frequency)}</span></p>
              <p><span class="font-bold text-[#17212B]">Current status:</span> <span class="text-[#667085]">${valueOrFallback(problem.status)}</span></p>
              <p><span class="font-bold text-[#17212B]">Reported at:</span> <span class="text-[#667085]">${formatReportedAt(problem.created_at)}</span></p>
            </section>
          </div>

          <section class="space-y-3">
            <div>
              <h3 class="text-sm font-black text-[#17212B]">Submitted Evidence</h3>
              <p class="text-[11px] text-[#667085]">Images attached by the reporting society.</p>
            </div>
            ${evidenceImages.length ? `
              <div class="grid grid-cols-1 ${evidenceImages.length > 1 ? 'sm:grid-cols-2' : ''} gap-4">
                ${evidenceImages.map((image, index) => `
                  <a href="${image}" target="_blank" rel="noopener noreferrer" class="block rounded-2xl overflow-hidden border border-[#DDE4E8] bg-[#F7F9F8]">
                    <img src="${image}" alt="Problem evidence ${index + 1}" class="w-full h-64 object-contain bg-slate-100" loading="lazy">
                    <p class="px-3 py-2 text-[11px] font-semibold text-[#667085] border-t border-[#DDE4E8]">Evidence image ${index + 1} • Open full size</p>
                  </a>
                `).join('')}
              </div>
            ` : `
              <div class="rounded-2xl border-2 border-dashed border-[#DDE4E8] bg-[#F7F9F8] p-8 text-center">
                <div class="text-3xl" aria-hidden="true">📷</div>
                <p class="mt-2 font-bold text-[#17212B]">No evidence image submitted</p>
                <p class="text-[11px] text-[#667085] mt-1">This report was submitted without an image attachment.</p>
              </div>
            `}
          </section>

          <section class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4 space-y-3">
            <h3 class="text-sm font-black text-[#17212B]">AI & Resolution Information</h3>
            <p><span class="font-bold text-[#17212B]">AI assessment:</span> <span class="text-[#667085]">${valueOrFallback(problem.threat_reason)}</span></p>
            <p><span class="font-bold text-[#17212B]">Recommended solver:</span> <span class="text-[#667085]">${valueOrFallback(problem.recommended_solver)}</span></p>
            <p><span class="font-bold text-[#17212B]">Assigned solver:</span> <span class="text-[#667085]">${valueOrFallback(problem.assigned_solver, 'Pending assignment')}</span></p>
            ${skills.length ? `<div><span class="font-bold text-[#17212B]">Required skills:</span><div class="flex flex-wrap gap-1.5 mt-2">${skills.map(skill => `<span class="px-2 py-1 rounded-lg bg-white border border-[#DDE4E8] text-[10px] font-semibold text-[#173F5F]">${skill}</span>`).join('')}</div></div>` : ''}
            ${problem.additional_notes ? `<p><span class="font-bold text-[#17212B]">Additional notes:</span> <span class="text-[#667085]">${problem.additional_notes}</span></p>` : ''}
          </section>

          <div class="flex justify-end gap-3 pt-2 border-t border-[#DDE4E8]">
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-5 py-2.5 rounded-xl font-bold">Close</button>
            <button type="button" onclick="window.app.closeModal(); window.app.openProblemDetail('${problem.id}')" class="btn-primary px-5 py-2.5 rounded-xl font-bold">View Project Progress →</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
