/**
 * AAPKE LOG - Structured Problem Submission Modal
 * Only verified societies can submit problems.
 * Includes live structured AI Problem Intelligence pre-scan.
 */

import { state } from '../state.js';
import { api } from '../api.js';
import { renderAIIntelligencePanel } from './ai_inspector.js';

const WARDS = [
  "A", "B", "C", "D", "E", "F/N", "F/S", "G/N", "G/S", "H/E", "H/W",
  "K/E", "K/W", "L", "M/E", "M/W", "N", "P/N", "P/S", "R/C", "R/N", "R/S", "S", "T"
];

const CATEGORIES = [
  "Water Management", "Drainage", "Roads", "Solid Waste Management",
  "Healthcare", "Education", "Environment", "Public Safety",
  "Sanitation", "Transportation", "Agriculture", "Infrastructure",
  "Accessibility", "Energy", "Other"
];

export function renderReportModal() {
  const soc = state.activeSociety;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge-role-society px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                Verified Society Submission
              </span>
              <span class="badge-verified px-2 py-0.5 rounded-full text-[10px] font-bold">✓ VERIFIED</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">REPORT COMMUNITY PROBLEM</h2>
            <p class="text-xs text-slate-500 font-medium">Submitting as: <strong class="text-slate-800">${soc.name}</strong> • Representative: ${soc.rep_name}</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold">✕</button>
        </div>

        <form id="report-problem-form" onsubmit="window.app.handleProblemSubmit(event)" class="space-y-5 text-xs">
          <!-- Preset Scenario Helper for Hackathon Evaluators -->
          <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between gap-2">
            <span class="text-amber-900 font-semibold text-[11px]">⚡ Fast evaluation preset available:</span>
            <button type="button" onclick="window.app.fillDemoWaterProblem()" class="px-3 py-1 rounded-lg bg-[#B7791F] hover:bg-[#976015] text-white font-bold text-[11px] shadow-sm transition">
              Load Demo Water Leakage Case
            </button>
          </div>

          <!-- Title -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Problem Title *</label>
            <input type="text" id="prb-title" required placeholder="e.g., Recurring high-pressure water pipeline rupture flooding street" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-[#147D86] focus:outline-none">
          </div>

          <!-- Description -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Detailed Problem Description *</label>
            <textarea id="prb-desc" rows="3" required placeholder="Describe the civic failure, its impact on residents, and any safety hazards..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-[#147D86] focus:outline-none"></textarea>
          </div>

          <!-- Row 1: Initial Category & Mumbai Ward -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="font-bold text-slate-700 block mb-1">
                Initial Category (AI will verify & classify) *
              </label>
              <select id="prb-category" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
                ${CATEGORIES.map(c => `<option value="${c}" ${c === 'Water Management' ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">Mumbai BMC Ward *</label>
              <select id="prb-ward" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium font-mono font-bold">
                ${WARDS.map(w => `<option value="${w}" ${w === soc.ward ? 'selected' : ''}>Ward ${w}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Row 2: Location & People Affected -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Specific Location / Landmark *</label>
              <input type="text" id="prb-location" required placeholder="e.g., 4th Cross Road & Junction, Lokhandwala" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">Estimated People Affected *</label>
              <input type="number" id="prb-people" required min="10" value="3200" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
            </div>
          </div>

          <!-- Row 3: Frequency -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Frequency *</label>
            <select id="prb-frequency" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
              <option value="Daily Continuous">Daily Continuous</option>
              <option value="Recurring Weekly">Recurring Weekly</option>
              <option value="Monsoon / Rain Aggravated">Monsoon / Rain Aggravated</option>
              <option value="Occasional">Occasional</option>
            </select>
          </div>

          <!-- Evidence Photo Upload -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Problem Image / Evidence</label>
            <input
              type="file"
              id="prb-evidence"
              accept="image/*"
              class="sr-only"
              onchange="window.app.handleEvidenceSelected(event)"
            >

            <div id="prb-evidence-empty" class="rounded-2xl border-2 border-dashed border-[#147D86]/35 bg-[#F7F9F8] px-5 py-7 text-center">
              <div class="text-3xl" aria-hidden="true">📷</div>
              <p class="mt-2 text-sm font-bold text-[#17212B]">Add a photo of the problem</p>
              <p class="mt-1 text-[11px] text-[#667085]">Help solver teams understand the issue before visiting the site.</p>
              <button
                type="button"
                onclick="document.getElementById('prb-evidence').click()"
                class="mt-4 px-4 py-2 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-bold text-xs shadow-sm transition"
              >
                📷 Choose Image
              </button>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#667085]">JPG, PNG, WEBP • Max 5 MB</p>
            </div>

            <div id="prb-evidence-preview-wrap" class="hidden rounded-2xl border border-[#DDE4E8] bg-[#F7F9F8] p-3">
              <img id="prb-evidence-preview" src="" alt="Selected problem evidence preview" class="w-full h-56 object-contain rounded-xl bg-slate-200">
              <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p id="prb-evidence-name" class="text-[11px] font-bold text-[#17212B] break-all"></p>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onclick="document.getElementById('prb-evidence').click()"
                    class="px-3 py-1.5 rounded-lg border border-[#147D86] text-[#147D86] hover:bg-[#147D86]/5 font-bold text-[11px] transition"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onclick="window.app.removeEvidenceImage()"
                    class="px-3 py-1.5 rounded-lg border border-[#C62828]/40 text-[#C62828] hover:bg-[#C62828]/5 font-bold text-[11px] transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <p id="prb-evidence-error" class="hidden mt-2 text-[11px] font-semibold text-[#C62828]" role="alert"></p>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Additional Notes</label>
            <textarea id="prb-notes" rows="2" placeholder="Any additional notes for solver teams or safety notices..." class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"></textarea>
          </div>

          <!-- LIVE AI PRE-SCAN TRIGGER BUTTON -->
          <div class="pt-2">
            <button type="button" onclick="window.app.runLiveAIPreScan()" class="w-full py-2.5 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2">
              <span>⚡</span>
              <span>RUN LIVE AI PRE-SCAN (Threat, Skills & Solver Recommendation)</span>
            </button>
          </div>

          <!-- INLINE AI INSPECTOR PREVIEW CONTAINER -->
          <div id="ai-prescan-result" class="hidden"></div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <p id="report-submit-status" class="hidden mr-auto text-[11px] font-semibold text-[#147D86]" aria-live="polite"></p>
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-5 py-2.5 rounded-xl font-bold">
              Cancel
            </button>
            <button id="report-submit-button" type="submit" class="btn-primary px-6 py-2.5 rounded-xl font-extrabold shadow-md transition transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
              <span id="report-submit-label">Submit & Register Problem →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
