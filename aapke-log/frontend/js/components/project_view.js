/**
 * AAPKE LOG - 10-Stage Project Workspace & Execution Timeline
 * Redesigned with Civic Blue + Teal + Community Green Palette
 */

import { state } from '../state.js';
import { api } from '../api.js';

const STAGES = [
  { num: 1, name: "Verification", label: "Verification" },
  { num: 2, name: "Solver Accepted", label: "Solver Accepted" },
  { num: 3, name: "Team Formed", label: "Team Formed" },
  { num: 4, name: "Assessment", label: "Assessment" },
  { num: 5, name: "Solution Design", label: "Solution Design" },
  { num: 6, name: "Prototype", label: "Prototype" },
  { num: 7, name: "Field Testing", label: "Field Testing" },
  { num: 8, name: "Implementation", label: "Implementation" },
  { num: 9, name: "Monitoring", label: "Monitoring" },
  { num: 10, name: "Solved", label: "Solved" }
];

export async function renderProjectWorkspace(problemId) {
  const p = await api.getProblemDetail(problemId);
  const prj = p.project;
  const team = p.team;
  const offers = p.citizen_support_offers || [];
  const currentStageNum = prj ? prj.stage_number : 3;
  const threatClass = p.threat_level === 'HIGH' ? 'badge-threat-high' : (p.threat_level === 'MEDIUM' ? 'badge-threat-medium' : 'badge-threat-low');

  return `
    <div class="space-y-8 max-w-6xl mx-auto pb-16">
      <!-- Back button -->
      <button onclick="window.history.back();" class="text-xs font-bold text-[#667085] hover:text-[#17212B] flex items-center gap-1">
        ← Back to Previous View
      </button>

      <!-- Main Project Header -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-bold text-[#667085]">${p.id}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20">
              ${p.ai_category}
            </span>
            <span class="px-2.5 py-0.5 rounded text-xs ${threatClass}">
              THREAT LEVEL: ${p.threat_level}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
              Stage: ${p.project_stage || 'Active Field Testing'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.app.openEscalationModal('${p.id}')" class="px-3.5 py-1.5 rounded-lg border border-[#C62828]/40 text-[#C62828] hover:bg-[#C62828]/5 text-xs font-bold transition">
              ⚠️ Report Unresolved / Escalate
            </button>
            ${p.status === 'Solved' ? `
              <button onclick="window.app.openFeedbackModal('${p.id}')" class="px-3.5 py-1.5 rounded-lg bg-[#2E7D5B] hover:bg-[#25664A] text-white font-bold text-xs shadow-xs transition">
                ★ Rate Solution Feedback
              </button>
            ` : ''}
          </div>
        </div>

        <h1 class="text-2xl sm:text-3xl font-black text-[#17212B] leading-tight">
          ${p.title}
        </h1>

        ${p.evidence_image ? `
          <div class="rounded-2xl overflow-hidden border border-[#DDE4E8] bg-[#F7F9F8]">
            <img
              src="${p.evidence_image}"
              alt="Evidence submitted for ${p.title}"
              class="w-full max-h-80 object-contain bg-slate-100"
              loading="lazy"
            >
            <div class="px-4 py-2 text-[11px] font-semibold text-[#667085] border-t border-[#DDE4E8]">
              📷 Problem Image / Evidence
            </div>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-[#DDE4E8]">
          <div>
            <span class="text-[#667085] font-medium">Reporting Society:</span>
            <p class="font-bold text-[#17212B] text-sm mt-0.5">${p.society_name}</p>
            <p class="text-[#667085] text-[11px]">Ward: ${p.ward} • Location: ${p.location}</p>
          </div>
          <div>
            <span class="text-[#667085] font-medium">Official Solver Consortium:</span>
            <p class="font-bold text-[#173F5F] text-sm mt-0.5">${p.assigned_solver || p.recommended_solver}</p>
            <p class="text-[#2E7D5B] font-semibold text-[11px]">✓ Expected support window: 24–48 hours</p>
          </div>
          <div>
            <span class="text-[#667085] font-medium">Population Impact:</span>
            <p class="font-bold text-[#17212B] text-sm mt-0.5">${p.people_affected.toLocaleString()} Residents</p>
            <p class="text-[#667085] text-[11px]">Severity: ${p.severity} • Freq: ${p.frequency}</p>
          </div>
        </div>
      </div>

      <!-- 10-STAGE INTERACTIVE LIFECYCLE TIMELINE -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-[#17212B]">10-Stage Solution Lifecycle Timeline</h2>
            <p class="text-xs text-[#667085]">Every societal challenge follows a verified, measurable milestone workflow.</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-[#667085]">Total Progress</span>
            <p class="text-xl font-black text-[#173F5F]">${p.project_progress || 60}%</p>
          </div>
        </div>

        <!-- Stepper Visualizer -->
        <div class="overflow-x-auto pb-4">
          <div class="flex items-center justify-between min-w-[760px] relative">
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#DDE4E8] z-0"></div>
            <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#173F5F] transition-all duration-700 z-0" style="width: ${(currentStageNum / 10) * 100}%;"></div>

            ${STAGES.map(s => {
              const isPast = s.num < currentStageNum;
              const isCurrent = s.num === currentStageNum;
              return `
                <div class="flex flex-col items-center relative z-10 text-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isPast ? 'bg-[#173F5F] text-white' : (isCurrent ? 'bg-white text-[#173F5F] border-2 border-[#173F5F] ring-4 ring-[#53B7B3]/25' : 'bg-[#DDE4E8] text-[#667085]')
                  }">
                    ${isPast ? '✓' : s.num}
                  </div>
                  <span class="text-[10px] font-bold mt-2 whitespace-nowrap ${isCurrent ? 'text-[#173F5F] font-extrabold' : 'text-[#667085]'}">
                    ${s.label}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Current Stage Brief -->
        <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span class="text-[#667085] font-semibold uppercase tracking-wider text-[10px]">Current Milestone:</span>
            <p class="text-sm font-black text-[#17212B] mt-1">${prj ? prj.current_stage : 'Field Testing'}</p>
            <p class="text-[#667085] mt-1 text-[11px] leading-relaxed">${prj ? prj.latest_update : 'Prototype testing underway at two community junctions.'}</p>
          </div>
          <div>
            <span class="text-[#667085] font-semibold uppercase tracking-wider text-[10px]">Next Milestone:</span>
            <p class="text-sm font-bold text-[#17212B] mt-1">${prj ? prj.next_milestone : 'Consortium review & deployment of permanent sleeves.'}</p>
            <p class="text-[#667085] mt-1 text-[11px]">Expected Completion: <strong class="text-[#17212B]">${prj ? prj.expected_completion : 'Within 10-14 days'}</strong></p>
          </div>
          <div class="flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#DDE4E8] pt-3 md:pt-0 md:pl-4">
            <span class="text-[#667085] font-semibold uppercase tracking-wider text-[10px]">Advance Stage (Solver Auth):</span>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="window.app.advanceProjectStage('${p.id}', ${Math.min(10, currentStageNum + 1)})" class="px-3.5 py-1.5 rounded-lg bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold text-xs shadow-xs transition">
                Advance to Stage ${Math.min(10, currentStageNum + 1)} →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- OFFICIAL MULTIDISCIPLINARY TEAM SECTION -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDE4E8] pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-[#17212B]">Official Project Team</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#173F5F]/10 text-[#173F5F] border border-[#173F5F]/20">
                Created by Verified Solver
              </span>
            </div>
            <p class="text-xs text-[#667085]">Only verified solvers can assign official teams. Societies and citizens cannot form solution taskforces.</p>
          </div>
        </div>

        ${team ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            ${team.members.map(m => `
              <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-2xl p-4 space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#173F5F] bg-white border border-[#DDE4E8] px-2 py-0.5 rounded">
                  ${m.role}
                </span>
                <p class="text-sm font-bold text-[#17212B]">${m.name}</p>
                <p class="text-xs text-[#667085] font-medium">${m.organization}</p>
                <p class="text-[11px] text-[#667085] italic pt-1 border-t border-[#DDE4E8]">
                  Specialty: ${m.expertise}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="bg-[#F7F9F8] rounded-2xl p-6 text-center border border-dashed border-[#DDE4E8]">
            <p class="text-xs text-[#667085] font-medium">Official team formation pending verified solver assignment.</p>
            <button onclick="window.app.openTeamModal('${p.id}')" class="mt-3 px-4 py-2 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold text-xs">
              + Assign Solution Consortium Team
            </button>
          </div>
        `}
      </div>

      <!-- CITIZEN VOLUNTARY SUPPORT OFFERS -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDE4E8] pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-[#17212B]">Citizen Voluntary Support Offers</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3B7C82]/10 text-[#3B7C82] border border-[#3B7C82]/20">
                Community Contributions
              </span>
            </div>
            <p class="text-xs text-[#667085]">
              Citizens offer voluntary support (photos, local info, technical assistance). 
              <strong>Official solvers decide if support is incorporated. Citizen offers never alter project ownership.</strong>
            </p>
          </div>

          <button onclick="window.app.openCitizenOfferModal('${p.id}')" class="px-4 py-2 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>Offer Voluntary Support (Citizen)</span>
          </button>
        </div>

        ${offers.length > 0 ? `
          <div class="space-y-3 pt-2">
            ${offers.map(c => `
              <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-[#17212B]">${c.citizen_name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-[#3B7C82] border border-[#DDE4E8]">
                      ${c.support_type}
                    </span>
                    <span class="text-[10px] text-[#667085] font-mono">${c.status}</span>
                  </div>
                  <p class="text-xs text-[#667085] leading-relaxed">${c.description}</p>
                </div>
                <div class="text-[10px] text-[#667085] whitespace-nowrap">
                  ${c.created_at ? c.created_at.substring(0, 10) : 'Recent'}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-xs text-[#667085] italic py-2">No citizen support offers submitted yet. Community citizens can contribute voluntary information.</p>
        `}
      </div>
    </div>
  `;
}
