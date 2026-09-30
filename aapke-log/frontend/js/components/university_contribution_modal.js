/**
 * University/Student Vote-to-Help contribution form.
 */

export function renderUniversityContributionModal(problem, student, university) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/20">
              🎓 UNIVERSITY / STUDENT SUPPORT
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-2">Vote to Help</h2>
            <p class="text-xs text-slate-500 mt-1">${escapeHtml(problem.title)} (${escapeHtml(problem.id)})</p>
          </div>
          <button type="button" onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold">✕</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="rounded-xl bg-[#F7F9F8] border border-[#DDE4E8] p-3">
            <span class="block text-[#667085] font-semibold">Student</span>
            <strong class="text-[#17212B]">${escapeHtml(student.name)}</strong>
          </div>
          <div class="rounded-xl bg-[#F7F9F8] border border-[#DDE4E8] p-3">
            <span class="block text-[#667085] font-semibold">University</span>
            <strong class="text-[#17212B]">${escapeHtml(university.name)}</strong>
          </div>
        </div>

        <form onsubmit="window.app.handleUniversityContributionSubmit(event, '${problem.id}')" class="space-y-4">
          <div>
            <label for="university-contribution" class="block text-sm font-black text-[#17212B] mb-2">
              How can you help/contribute to solving this problem?
            </label>
            <textarea
              id="university-contribution"
              required
              minlength="10"
              maxlength="2000"
              rows="6"
              placeholder="Describe the research, student skills, field study, technical analysis, equipment, or other contribution you can provide..."
              class="w-full px-4 py-3 rounded-xl border border-[#DDE4E8] text-sm text-[#17212B] focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none resize-y"
            ></textarea>
            <div class="flex justify-between mt-1 text-[10px] text-[#667085]">
              <span>Required • Minimum 10 characters</span>
              <span>Maximum 2,000 characters</span>
            </div>
          </div>

          <p id="university-contribution-error" class="hidden text-xs font-bold text-[#C62828] bg-red-50 border border-red-200 rounded-xl p-3"></p>

          <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-4 py-2 font-bold">Cancel</button>
            <button id="university-contribution-submit" type="submit" class="px-5 py-2.5 rounded-xl bg-[#2E7D5B] hover:bg-[#25664A] text-white font-black transition disabled:opacity-60">
              Submit Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}