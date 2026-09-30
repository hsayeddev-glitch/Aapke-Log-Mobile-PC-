/**
 * AAPKE LOG - Citizen Support Offer Modal
 */

export function renderCitizenOfferModal(problem) {
  if (!problem) return '';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-xs">
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span class="badge-role-citizen px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              Voluntary Community Contribution
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-1">OFFER CITIZEN SUPPORT</h2>
            <p class="text-xs text-slate-500 font-medium">${problem.title} (${problem.id})</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold">✕</button>
        </div>

        <div class="bg-slate-50 border-l-4 border-[#147D86] p-3 rounded-r-xl text-slate-800 leading-relaxed text-[11px]">
          <strong>Notice:</strong> Your offer will be recorded as a <em>Citizen Support Offer</em>. 
          The official solver consortium will review whether to incorporate your assistance into field testing. 
          Citizens do not become official solvers or team owners.
        </div>

        <form id="citizen-offer-form" onsubmit="window.app.handleCitizenOfferSubmit(event, '${problem.id}')" class="space-y-4">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Your Full Name *</label>
            <input type="text" id="cso-name" required placeholder="e.g., Dr. Farooq Qureshi / Kavita Menon" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#147D86] focus:outline-none">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Email / Contact *</label>
            <input type="email" id="cso-email" required placeholder="e.g., citizen.volunteer@mumbai.org" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#147D86] focus:outline-none">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Type of Voluntary Support *</label>
            <select id="cso-type" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
              <option value="Photographs & Ground Data">Photographs & Ground Data</option>
              <option value="Local Information">Local Knowledge / Historical Information</option>
              <option value="Technical Expertise">Technical / Engineering Expertise</option>
              <option value="Field Testing Volunteer">Volunteer During Field Testing</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Describe what you can offer *</label>
            <textarea id="cso-desc" rows="3" required placeholder="e.g., I have geotagged photos of water pressure fluctuations from my society's inlet meter..." class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#147D86] focus:outline-none"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-4 py-2 font-bold">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-bold shadow-md transition">
              Submit Support Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
