/**
 * AAPKE LOG - Verified Society / Community Representative Portal
 * Implements:
 * 1. Society reports genuine community problems (Never creates an escalation ticket initially).
 * 2. Society reviews University & Industry help offers with [ACCEPT] / [REJECT] actions.
 * 3. BMC support is AUTOMATICALLY ACCEPTED ("BMC OFFICIAL SUPPORT - Automatically Accepted").
 * 4. Displays official team and dynamic project progress.
 * 5. Society can raise escalation tickets ONLY after a team is assigned and work stalls/fails.
 * 6. "MY ESCALATION TICKETS" displays Level 1 -> Level 2 -> Level 3 -> Team Replacement history.
 */

import { state } from '../state.js';
import { api } from '../api.js';

export async function renderSocietyView() {
  const soc = state.activeSociety;
  const problems = await api.getProblems({ society_id: soc.id });

  // Fetch help offers for society's problems
  const helpOffersPromises = problems.map(p => api.getHelpOffers(p.id));
  const offersNested = await Promise.all(helpOffersPromises);
  const allHelpOffers = offersNested.flat();

  // Fetch admin overview to get escalation tickets for this society
  const adminData = await api.getAdminOverview();
  const myEscalations = (adminData.escalations || []).filter(e => e.society_name === soc.name || problems.some(p => p.id === e.problem_id));
  const activeProblems = problems.filter(p => !['Solved', 'Resolved'].includes(p.status));
  const resolvedProblems = problems.filter(p => ['Solved', 'Resolved'].includes(p.status));
  const activeEscalations = myEscalations.filter(t => !['Resolved', 'Closed', 'Team Replaced - In Progress'].includes(t.ticket_status));
  const deadlineRiskTickets = activeEscalations.filter(t =>
    t.official_action_required ||
    (t.remaining_seconds !== null && t.remaining_seconds <= 0) ||
    (t.remaining_days !== null && t.remaining_days <= 2)
  );
  const participationVotes = problems.reduce((total, problem) => total + (problem.unique_voter_count || 0), 0);

  return `
    <div class="space-y-8 pb-16">
      <!-- Society Profile & Verification Header -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="flex items-center gap-4">
          <img src="${soc.avatar || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80'}" class="w-16 h-16 rounded-2xl object-cover border-2 border-[#5B6675]/30 shadow-xs" alt="${soc.name}">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black text-[#17212B]">${soc.name}</h1>
              <span class="badge-verified px-2.5 py-0.5 rounded-full text-xs font-bold">
                ✓ VERIFIED SOCIETY
              </span>
            </div>
            <p class="text-xs text-[#667085] font-medium mt-1">
              Authorized Representative: <strong class="text-[#17212B]">${soc.rep_name}</strong> • 
              Mumbai Ward: <span class="px-2 py-0.5 rounded bg-[#F7F9F8] border border-[#DDE4E8] font-bold text-[#173F5F]">${soc.ward}</span> •
              Type: <span class="text-[#17212B] font-semibold">${soc.org_type}</span>
            </p>
            <p class="text-[11px] text-[#2E7D5B] font-semibold mt-1">
              ✓ Verified to submit genuine societal challenges under BMC municipal jurisdiction.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.app.openReportModal()" class="px-5 py-3 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold text-xs shadow-md transition flex items-center gap-2 transform active:scale-95">
            <span class="text-base font-black">+</span>
            <span>REPORT COMMUNITY PROBLEM</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Total Reported</p>
          <p class="text-2xl font-black text-[#17212B] mt-1">${problems.length}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Active / In Progress</p>
          <p class="text-2xl font-black text-[#1769AA] mt-1">${activeProblems.length}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Resolved Problems</p>
          <p class="text-2xl font-black text-[#2E7D5B] mt-1">${resolvedProblems.length}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Active Tickets</p>
          <p class="text-2xl font-black text-[#B7791F] mt-1">${activeEscalations.length}</p>
        </div>
        <div class="rounded-2xl p-4 border ${deadlineRiskTickets.length ? 'border-red-300 bg-red-50/30' : 'border-[#DDE4E8] bg-white'} shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Deadline Risk</p>
          <p class="text-2xl font-black text-[#C62828] mt-1">${deadlineRiskTickets.length}</p>
          <p class="text-[10px] text-[#667085] mt-1">≤2 days or overdue</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">Verified Participation</p>
          <p class="text-2xl font-black text-[#147D86] mt-1">${participationVotes}</p>
          <p class="text-[10px] text-[#667085] mt-1">Unique problem votes</p>
        </div>
      </div>

      <!-- SECTION 1: MY PROBLEMS -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-[#DDE4E8] pb-3">
          <div>
            <h2 class="text-lg font-black text-[#17212B]">MY PROBLEMS</h2>
            <p class="text-xs text-[#667085]">Verified societal problems reported by ${soc.name}.</p>
          </div>
          <span class="text-xs font-bold text-[#173F5F]">${problems.length} Challenges</span>
        </div>

        ${problems.length === 0 ? `
          <div class="bg-white rounded-2xl p-10 text-center border border-[#DDE4E8]">
            <p class="text-xs text-[#667085]">No problems registered yet.</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${problems.map(p => renderSocietyProblemCard(p)).join('')}
          </div>
        `}
      </div>

      <!-- SECTION 2: HELP OFFERS (University & Industry) -->
      <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between border-b border-[#DDE4E8] pb-3">
          <div>
            <h2 class="text-lg font-black text-[#17212B]">HELP OFFERS FOR MY PROBLEMS</h2>
            <p class="text-xs text-[#667085]">Review proposed contributions from universities and industry partners. You can Accept or Reject offers.</p>
          </div>
          <span class="text-xs font-bold text-[#147D86]">${allHelpOffers.length} Offers</span>
        </div>

        <!-- Automatic BMC Acceptance Banner -->
        <div class="bg-[#1769AA]/10 border border-[#1769AA]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏛️</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-[#1769AA] text-sm">BMC OFFICIAL SUPPORT</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1769AA] text-white">
                  ✓ Automatically Accepted
                </span>
              </div>
              <p class="text-[#17212B] text-[11px] mt-0.5">
                Municipal jurisdictional response and heavy civil repair from BMC is guaranteed and automatically accepted for verified problems.
              </p>
            </div>
          </div>
          <span class="text-[11px] font-bold text-[#1769AA] bg-white px-3 py-1.5 rounded-lg border border-[#1769AA]/20 whitespace-nowrap">
            Municipal Guarantee Active
          </span>
        </div>

        <!-- University and Industry Offers Grid -->
        ${allHelpOffers.length === 0 ? `
          <div class="bg-white rounded-2xl p-8 text-center border border-[#DDE4E8] text-xs text-[#667085]">
            No university or industry help offers submitted yet for your problems.
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${allHelpOffers.map(ho => renderHelpOfferCard(ho)).join('')}
          </div>
        `}
      </div>

      <!-- SECTION 3: MY ESCALATION TICKETS -->
      <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between border-b border-[#DDE4E8] pb-3">
          <div>
            <h2 class="text-lg font-black text-[#17212B]">MY ESCALATION TICKETS</h2>
            <p class="text-xs text-[#667085]">Track tickets raised when responsible teams fail to perform or complete committed work.</p>
          </div>
          <span class="text-xs font-bold text-[#C62828]">${myEscalations.length} Active Tickets</span>
        </div>

        ${myEscalations.length === 0 ? `
          <div class="bg-white rounded-2xl p-8 text-center border border-[#DDE4E8] text-xs text-[#667085]">
            No escalation tickets active. All assigned teams are currently performing within SLA.
          </div>
        ` : `
          <div class="space-y-3">
            ${myEscalations.map(esc => renderEscalationTicketCard(esc)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderSocietyProblemCard(p) {
  const hasTeam = p.status === 'In Progress' || p.status === 'Team Formed' || p.status === 'Solved';
  const isSolved = p.status === 'Solved';
  const affectedPercentage = p.affected_percentage === null || p.affected_percentage === undefined
    ? 'N/A'
    : `${p.affected_percentage}%`;

  return `
    <div
      class="civic-card bg-white rounded-2xl p-6 shadow-xs space-y-4 border border-[#DDE4E8] cursor-pointer hover:border-[#147D86]/50 transition"
      onclick="window.app.openSocietyProblemDetail('${p.id}')"
      onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.app.openSocietyProblemDetail('${p.id}'); }"
      role="button"
      tabindex="0"
      aria-label="Open complete details for ${p.title}"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-bold text-[#667085]">${p.id}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#147D86]/10 text-[#147D86] border border-[#147D86]/25">
              ${affectedPercentage} People Affected
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20">
              ${p.ai_category}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7F9F8] text-[#17212B] border border-[#DDE4E8]">
              Ward ${p.ward}
            </span>
          </div>

          <h3 class="text-base sm:text-lg font-bold text-[#17212B] hover:text-[#173F5F]">
            ${p.title}
          </h3>
          <p class="text-xs text-[#667085]">📍 ${p.location} • 👥 <strong>${p.people_affected.toLocaleString()}</strong> Residents Affected</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="event.stopPropagation(); window.app.openProblemDetail('${p.id}')" class="px-3.5 py-1.5 rounded-lg border border-[#173F5F] text-[#173F5F] font-bold text-xs hover:bg-[#F7F9F8] transition">
            View Project Progress →
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px]">
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2.5">
          <span class="block text-[#667085] font-semibold">Citizen Votes</span>
          <strong class="text-sm text-[#173F5F]">${(p.community_votes || 0).toLocaleString()}</strong>
        </div>
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2.5">
          <span class="block text-[#667085] font-semibold">Student/University Help</span>
          <strong class="text-sm text-[#2E7D5B]">${p.student_university_help_count || 0}</strong>
        </div>
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2.5">
          <span class="block text-[#667085] font-semibold">Industry/Startup Help</span>
          <strong class="text-sm text-[#B7791F]">${p.industry_startup_help_count || 0}</strong>
        </div>
      </div>

      <!-- AI Assessment & Solution Details -->
      <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-3.5 text-xs space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-bold text-[#17212B]">AI Assessment:</span>
          <span class="text-[#173F5F] font-bold">Verified Voters: ${p.unique_voter_count || 0}</span>
        </div>
        <p class="text-[#667085] text-[11px] leading-relaxed">
          ${p.threat_reason}
        </p>

        <div class="pt-2 border-t border-[#DDE4E8] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="font-bold text-[#17212B]">Official Team / Assigned: </span>
            <span class="text-[#173F5F] font-semibold">${p.assigned_solver || 'Pending Team Formation'}</span>
          </div>
          <div>
            <span class="font-bold text-[#17212B]">Current Stage: </span>
            <span class="text-[#2E7D5B] font-bold">${p.project_stage || 'Verification'} (${p.project_progress || 10}%)</span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-2 border-t border-[#DDE4E8] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="text-[11px] text-[#667085]">
          Status: <strong class="text-[#17212B]">${p.status}</strong>
        </div>

        <div class="flex items-center gap-2">
          ${isSolved ? `
            <button onclick="event.stopPropagation(); window.app.openFeedbackModal('${p.id}')" class="px-4 py-2 rounded-xl bg-[#2E7D5B] hover:bg-[#25664a] text-white font-bold transition flex items-center gap-1.5 shadow-xs">
              <span>★</span>
              <span>Rate Solution Feedback</span>
            </button>
          ` : `
            ${hasTeam ? `
              <button onclick="event.stopPropagation(); window.app.openEscalationModal('${p.id}')" class="px-3.5 py-1.5 rounded-xl border border-[#C62828] text-[#C62828] hover:bg-red-50 font-bold transition flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Raise a Ticket</span>
              </button>
            ` : `
              <span class="text-[11px] text-[#667085] italic">
                *Escalation tickets available after official team is assigned & work begins.
              </span>
            `}
          `}
        </div>
      </div>
    </div>
  `;
}

function renderHelpOfferCard(ho) {
  const isUni = ho.solver_type === 'University';
  const roleColorHex = isUni ? '#2E7D5B' : '#B7791F';
  const isAccepted = ho.status === 'Accepted' || ho.status === 'Selected for Team';
  const isRejected = ho.status === 'Rejected';

  return `
    <div class="bg-white rounded-2xl p-5 border border-[#DDE4E8] shadow-xs space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${roleColorHex}"></span>
            <span class="text-xs font-bold uppercase tracking-wider" style="color: ${roleColorHex}">
              ${ho.solver_type} HELP OFFER
            </span>
            <span class="text-xs font-bold text-amber-600">★ ${ho.rating || 4.8}</span>
          </div>
          <h4 class="text-base font-bold text-[#17212B] mt-0.5">${ho.solver_name}</h4>
          <span class="text-[11px] text-[#667085]">Problem ID: ${ho.problem_id}</span>
        </div>

        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
          isAccepted ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30' :
          (isRejected ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
        }">
          ${ho.status}
        </span>
      </div>

      <div class="bg-[#F7F9F8] p-3 rounded-xl border border-[#DDE4E8] text-xs space-y-1.5">
        <div>
          <span class="font-bold text-[#17212B]">Relevant Expertise:</span>
          <p class="text-[#667085] text-[11px]">${ho.expertise}</p>
        </div>
        <div>
          <span class="font-bold text-[#17212B]">Experience:</span>
          <p class="text-[#667085] text-[11px]">${ho.experience}</p>
        </div>
        <div>
          <span class="font-bold text-[#17212B]">Proposed Contribution:</span>
          <p class="text-[#173F5F] font-medium text-[11px]">${ho.contribution}</p>
        </div>
      </div>

      <div class="pt-2 border-t border-[#DDE4E8] flex items-center justify-between gap-2 text-xs">
        <span class="text-[11px] text-[#667085]">Society Review Decision:</span>

        ${isAccepted ? `
          <span class="text-xs font-bold text-[#2E7D5B] flex items-center gap-1">
            <span>✓</span>
            <span>Accepted for Official Team</span>
          </span>
        ` : (isRejected ? `
          <span class="text-xs font-bold text-red-600">✕ Offer Declined</span>
        ` : `
          <div class="flex items-center gap-2">
            <button onclick="window.app.respondToHelpOffer('${ho.id}', 'accept')" class="px-3.5 py-1.5 rounded-lg bg-[#2E7D5B] hover:bg-[#25664a] text-white font-bold transition">
              ✓ Accept Offer
            </button>
            <button onclick="window.app.respondToHelpOffer('${ho.id}', 'reject')" class="px-3 py-1.5 rounded-lg border border-[#DDE4E8] text-[#667085] hover:bg-[#F7F9F8] font-bold transition">
              ✕ Decline
            </button>
          </div>
        `)}
      </div>
    </div>
  `;
}

function renderEscalationTicketCard(esc) {
  const isLevel3 = esc.escalation_level === 3;
  const actionRequired = Boolean(esc.official_action_required);

  return `
    <div
      class="bg-white rounded-2xl p-5 border ${isLevel3 || actionRequired ? 'border-[#C62828] bg-red-50/20' : 'border-[#DDE4E8]'} shadow-xs space-y-3 text-xs cursor-pointer hover:border-[#147D86]/50 transition"
      onclick="window.app.openEscalationTicketDetail('${esc.id}')"
      onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.app.openEscalationTicketDetail('${esc.id}'); }"
      role="button"
      tabindex="0"
      aria-label="Open escalation ticket ${esc.id}"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-[#17212B] text-sm">${esc.id}</span>
          <span class="px-2.5 py-0.5 rounded font-extrabold text-[11px] ${
            actionRequired ? 'bg-[#C62828] text-white urgent-pulse' :
            (isLevel3 ? 'bg-[#C62828] text-white urgent-pulse' :
            (esc.escalation_level === 2 ? 'bg-[#B7791F] text-white' : 'bg-[#173F5F] text-white'))
          }">
            ${actionRequired ? 'OFFICIAL ACTION REQUIRED' : `LEVEL ${esc.escalation_level}`}
          </span>
          <span class="text-[#667085]">• <strong class="${esc.remaining_seconds !== null && esc.remaining_seconds <= 0 ? 'text-red-600' : 'text-[#147D86]'}">${esc.remaining_label || 'Deadline unavailable'}</strong></span>
        </div>

        <span class="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-white border border-[#DDE4E8] text-[#17212B]">
          ${esc.ticket_status}
        </span>
      </div>

      <div class="space-y-1">
        <p class="font-bold text-[#17212B]">Problem: ${esc.problem_id} — ${esc.reason}</p>
        <p class="text-[#667085] text-[11px] leading-relaxed"><strong>Unresolved Ground Issue:</strong> ${esc.what_remains_unresolved}</p>
      </div>

      <div class="bg-[#F7F9F8] p-3 rounded-xl border border-[#DDE4E8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px]">
        <div>
          <span class="font-bold text-[#17212B]">Responsible Solver:</span>
          <span class="text-[#173F5F] font-semibold">${esc.previous_solver || 'Assigned Consortium'}</span>
        </div>
        <div class="text-[#667085] text-right">
          <div>Deadline: <strong class="text-[#17212B]">${esc.current_deadline ? new Date(esc.current_deadline).toLocaleDateString() : 'N/A'}</strong></div>
          <div>Officer: <strong class="text-[#17212B]">${esc.responsible_officer || 'Pending assignment'}</strong></div>
        </div>
      </div>
      <p class="text-[10px] text-[#667085] font-semibold">Click to view evidence, timeline, deadline, responses, and full ticket details.</p>
    </div>
  `;
}
