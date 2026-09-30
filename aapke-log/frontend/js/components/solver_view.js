/**
 * AAPKE LOG - Verified Solver Dashboard (BMC, University, Industry)
 * Implements:
 * 1. University & Industry users CANNOT create official teams (Action strictly removed).
 * 2. University and Industry submit persisted Vote-to-Help contributions for BMC review.
 * 3. BMC can choose:
 *    A. WORK ALONE ("BMC Direct Implementation - No External Team Required")
 *    B. CREATE TEAM WITH UNIVERSITY
 *    C. CREATE TEAM WITH INDUSTRY
 *    D. CREATE COMBINED TEAM (BMC + University + Industry)
 * 4. BMC Department Ticket Queue (Water, Roads, Drainage, etc.) with factual metrics.
 * 5. Responsible Team portal shows "TICKET RAISED AGAINST YOUR TEAM" with response actions.
 */

import { state } from '../state.js';
import { api } from '../api.js';

export async function renderSolverView(solverType = 'bmc') {
  const isBmc = solverType === 'bmc';
  const isUni = solverType === 'university';
  const isInd = solverType === 'industry';

  let currentEntity = isBmc ? state.activeBmc : (isUni ? state.activeUniversity : state.activeIndustry);
  const helpVoterType = isUni ? 'StudentUniversity' : (isInd ? 'IndustryStartup' : null);
  const helpVoterId = isUni ? state.activeStudent.id : (isInd ? state.activeIndustry.id : null);
  const allProblems = await api.getProblems(helpVoterType ? {
    help_voter_type: helpVoterType,
    help_voter_id: helpVoterId
  } : {});
  const adminData = await api.getAdminOverview();
  const industrySupportNotifications = isBmc
    ? await api.getBmcIndustrySupportNotifications()
    : { unread_count: 0, notifications: [] };

  // Filter problems relevant to this solver
  const relevantProblems = allProblems.filter(p => {
    const rec = p.recommended_solver || '';
    if (isBmc) return rec.includes('BMC') || (p.assigned_solver && p.assigned_solver.includes('BMC'));
    if (isUni) return rec.includes('University') || rec.includes('Student') || (p.assigned_solver && p.assigned_solver.includes('University'));
    return rec.includes('Industry') || rec.includes('Company') || (p.assigned_solver && p.assigned_solver.includes('IoT'));
  });

  const roleColorHex = isBmc ? '#1769AA' : (isUni ? '#2E7D5B' : '#B7791F');

  // Tickets against this solver / department
  const ticketsAgainstMe = (adminData.escalations || []).filter(e => {
    if (isBmc) return true; // BMC oversees all tickets
    return (e.previous_solver && e.previous_solver.includes(isUni ? 'University' : 'Industry'));
  });
  const activeTickets = ticketsAgainstMe.filter(t => !['Resolved', 'Closed', 'Team Replaced - In Progress'].includes(t.ticket_status));
  const crossedDeadlineTickets = activeTickets.filter(t =>
    t.official_action_required || t.escalation_level > 1 || (t.remaining_seconds !== null && t.remaining_seconds <= 0)
  );
  const activeProjects = relevantProblems.filter(p => ['In Progress', 'Team Formed', 'Escalated'].includes(p.status));
  const assignedProblems = relevantProblems.filter(p =>
    p.assigned_solver && !p.assigned_solver.toLowerCase().includes('pending')
  );
  const completedProblems = relevantProblems.filter(p => ['Solved', 'Resolved'].includes(p.status));
  const pendingProblems = relevantProblems.filter(p =>
    !['In Progress', 'Team Formed', 'Escalated', 'Solved', 'Resolved'].includes(p.status)
  );
  const myHelpOffers = (adminData.help_offers || []).filter(offer => offer.solver_name === currentEntity.name);
  const availableSupportProblems = relevantProblems.filter(p => !['Solved', 'Resolved'].includes(p.status));
  const myHelpVoteCount = relevantProblems.filter(p => p.has_help_voted).length;
  const roleHelpVoteTotal = relevantProblems.reduce(
    (total, problem) => total + (
      isUni ? (problem.student_university_help_count || 0) : (problem.industry_startup_help_count || 0)
    ),
    0
  );
  const supportedProblemCount = relevantProblems.filter(problem =>
    isUni ? problem.student_university_help_count > 0 : problem.industry_startup_help_count > 0
  ).length;
  const universitySupportedProblems = allProblems.filter(
    problem => (problem.student_university_help_count || 0) > 0
  );
  const industrySupportedProblems = allProblems.filter(
    problem => (problem.industry_startup_help_count || 0) > 0
  );

  return `
    <div class="space-y-8 pb-16">
      <!-- Solver Header with Role Guard Notice -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-xs" style="background-color: ${roleColorHex}15; color: ${roleColorHex}; border: 1px solid ${roleColorHex}30;">
            ${isBmc ? '🏛️' : (isUni ? '🎓' : '🏭')}
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black text-[#17212B]">${currentEntity.name}</h1>
              <span class="badge-verified px-2.5 py-0.5 rounded-full text-xs font-bold">
                ✓ VERIFIED ${solverType.toUpperCase()}
              </span>
            </div>
            <p class="text-xs text-[#667085] font-medium mt-1">
              ${isBmc ? `Chief Officer: <strong class="text-[#17212B]">${currentEntity.lead_name}</strong> • Jurisdiction: <span class="font-bold text-[#173F5F]">${currentEntity.ward_jurisdiction}</span>` :
                (isUni ? `Dean/Coordinator: <strong class="text-[#17212B]">${currentEntity.dean}</strong> • Campus: <span class="font-bold text-[#2E7D5B]">${currentEntity.campus}</span>` :
                         `VP/Lead: <strong class="text-[#17212B]">${currentEntity.lead}</strong> • Location: <span class="font-bold text-[#B7791F]">${currentEntity.location}</span>`)}
            </p>
            <p class="text-[11px] font-bold mt-1" style="color: ${roleColorHex}">
              ${isBmc ? '✓ Authorized Municipal Governance: Can form official teams or execute direct implementation.' :
                '✓ Authorized Contributor: Can submit verified help offers (faculty, students, technology, labs). Team formation reserved for BMC/Admin.'}
            </p>
            ${isUni ? `<p class="text-[11px] text-[#667085] mt-1">Active student: <strong class="text-[#17212B]">${state.activeStudent.name}</strong> • ${state.activeStudent.major} • ${state.activeStudent.year}</p>` : ''}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-3.5 py-1.5 rounded-xl font-bold bg-[#F7F9F8] border border-[#DDE4E8] text-[#17212B]">
            ● Operational Status: Active
          </span>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">
            ${isBmc ? 'Assigned Municipal Problems' : 'Available Problems'}
          </p>
          <p class="text-2xl font-black text-[#17212B] mt-1">${isBmc ? assignedProblems.length : availableSupportProblems.length}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">
            ${isBmc ? 'Active Projects' : 'My Vote to Help'}
          </p>
          <p class="text-2xl font-black text-[#1769AA] mt-1">${isBmc ? activeProjects.length : myHelpVoteCount}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">${isBmc ? 'Pending Work' : (isUni ? 'Student/University Help Votes' : 'Industry/Startup Help Votes')}</p>
          <p class="text-2xl font-black text-[#B7791F] mt-1">${isBmc ? pendingProblems.length : roleHelpVoteTotal}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">${isBmc ? 'Completed Work' : 'Active Support Projects'}</p>
          <p class="text-2xl font-black text-[#2E7D5B] mt-1">${isBmc ? completedProblems.length : activeProjects.length}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-[#DDE4E8] shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">${isBmc ? 'Active Tickets' : 'Help Offers Submitted'}</p>
          <p class="text-2xl font-black text-[#B7791F] mt-1">${isBmc ? activeTickets.length : myHelpOffers.length}</p>
        </div>
        <div class="rounded-2xl p-4 border ${isBmc && crossedDeadlineTickets.length ? 'border-red-300 bg-red-50/30' : 'border-[#DDE4E8] bg-white'} shadow-xs">
          <p class="text-xs font-semibold text-[#667085]">${isBmc ? 'Deadline Crossed' : 'Problems With Role Support'}</p>
          <p class="text-2xl font-black ${isBmc ? 'text-[#C62828]' : 'text-[#147D86]'} mt-1">${isBmc ? crossedDeadlineTickets.length : supportedProblemCount}</p>
        </div>
      </div>

      <!-- BMC EXCLUSIVE: DEPARTMENT TICKET QUEUE -->
      ${isBmc ? `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE4E8] shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-[#DDE4E8] pb-3">
            <div>
              <h2 class="text-lg font-black text-[#17212B]">BMC DEPARTMENT TICKET QUEUE & ACCOUNTABILITY</h2>
              <p class="text-xs text-[#667085]">Factual operational ticket metrics by municipal department to identify repeated delays without subjective labels.</p>
            </div>
            <span class="text-xs font-bold text-[#1769AA]">Active Municipal Departments</span>
          </div>

          ${(adminData.department_tickets || []).length ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${(adminData.department_tickets || []).map(dt => `
              <div class="bg-[#F7F9F8] rounded-2xl p-4 border border-[#DDE4E8] space-y-2">
                <div class="flex justify-between items-center">
                  <h4 class="font-black text-[#17212B] text-xs">${dt.department}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#DDE4E8] text-[#173F5F]">${dt.total} Total</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-center text-[10px] pt-1 border-t border-[#DDE4E8]">
                  <div class="bg-white p-1 rounded"><span class="text-slate-500 block">Open</span><strong class="text-amber-600 font-bold">${dt.open}</strong></div>
                  <div class="bg-white p-1 rounded"><span class="text-slate-500 block">L1</span><strong class="text-[#173F5F] font-bold">${dt.level1}</strong></div>
                  <div class="bg-white p-1 rounded"><span class="text-slate-500 block">L2</span><strong class="text-[#B7791F] font-bold">${dt.level2}</strong></div>
                  <div class="bg-white p-1 rounded"><span class="text-slate-500 block">L3</span><strong class="text-[#C62828] font-bold">${dt.level3}</strong></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-[#667085] pt-1">
                  <span>Resolved: <strong class="text-[#2E7D5B]">${dt.resolved}</strong></span>
                  <span>Avg Ticket Age: <strong>${dt.avg_age_days} Days</strong></span>
                </div>
              </div>
            `).join('')}
          </div>` : `<div class="p-6 text-center rounded-2xl border border-dashed border-[#DDE4E8] text-xs text-[#667085]">No municipal escalation tickets are currently recorded.</div>`}

          ${universitySupportedProblems.length ? `
            <div class="pt-4 border-t border-[#DDE4E8] space-y-3">
              <div>
                <h3 class="text-sm font-black text-[#17212B]">University/Student Support by Problem</h3>
                <p class="text-xs text-[#667085]">Review the actual saved contribution submitted with each Vote to Help.</p>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                ${universitySupportedProblems.map(problem => `
                  <div class="rounded-xl border border-[#2E7D5B]/25 bg-[#2E7D5B]/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-black text-[#17212B]">${problem.title}</p>
                      <p class="text-[10px] text-[#667085]">${problem.id} • ${problem.student_university_help_count} University/Student support vote(s)</p>
                    </div>
                    <button onclick="window.app.openUniversitySupport('${problem.id}')" class="shrink-0 px-3 py-2 rounded-lg bg-[#2E7D5B] hover:bg-[#25664A] text-white text-[10px] font-black transition">
                      🎓 VIEW UNIVERSITY SUPPORT
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${industrySupportedProblems.length ? `
            <div class="pt-4 border-t border-[#DDE4E8] space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-sm font-black text-[#17212B]">Industry/Startup Support Notifications</h3>
                  <p class="text-xs text-[#667085]">New Industry contributions are persisted and sent to the BMC Municipal Solver.</p>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20 text-[10px] font-black">
                  🔔 ${industrySupportNotifications.unread_count || 0} Unread
                </span>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                ${industrySupportedProblems.map(problem => `
                  <div class="rounded-xl border border-[#B7791F]/25 bg-[#B7791F]/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-black text-[#17212B]">${problem.title}</p>
                      <p class="text-[10px] text-[#667085]">${problem.id} • ${problem.industry_startup_help_count} Industry/Startup support vote(s)</p>
                    </div>
                    <button onclick="window.app.openIndustrySupport('${problem.id}')" class="shrink-0 px-3 py-2 rounded-lg bg-[#B7791F] hover:bg-[#996515] text-white text-[10px] font-black transition">
                      🏢 VIEW INDUSTRY SUPPORT
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- RESPONSIBLE TEAM ACTION CENTER: TICKETS RAISED AGAINST YOUR TEAM -->
      ${crossedDeadlineTickets.length > 0 ? `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-red-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">⚠️</span>
              <div>
                <h2 class="text-lg font-black text-[#C62828]">TICKETS RAISED AGAINST RESPONSIBLE TEAM</h2>
                <p class="text-xs text-[#667085]">Deadlines crossed. Submit a progress report or upload current field evidence for Government Officer/Admin review.</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#C62828]">
              ${crossedDeadlineTickets.length} Deadline-Crossed Tickets
            </span>
          </div>

          <div class="space-y-3">
            ${crossedDeadlineTickets.map(t => renderTeamTicketActionCard(t, currentEntity.name)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- PROBLEMS QUEUE / HELP OFFERS WORKSPACE -->
      <div class="space-y-4">
        <div class="border-b border-[#DDE4E8] pb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black text-[#17212B]">
              ${isBmc ? 'BMC Problem Queue & Official Team Formation' : (isUni ? 'University Academic Help Opportunities' : 'Industry IoT & Tech Deployment Opportunities')}
            </h2>
            <p class="text-xs text-[#667085]">
              ${isBmc ? 'Review AI-recommended challenges, work alone or select university/industry offers to create official team.' :
                        'Review verified community challenges and submit your official Help Offer (faculty, students, IoT, testing skids).'}
            </p>
            ${isBmc ? `
              <button id="reset-teams-button" onclick="window.app.resetTeams()" class="mt-3 px-4 py-2 rounded-xl border border-[#C62828] bg-white hover:bg-red-50 text-[#C62828] text-xs font-black transition disabled:opacity-60 disabled:cursor-wait">
                ↻ RESET TEAMS
              </button>
            ` : ''}
          </div>
        </div>

        <div class="space-y-4">
          ${relevantProblems.map(p => renderSolverActionCard(p, solverType, currentEntity)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSolverActionCard(p, solverType, currentEntity) {
  const isBmc = solverType === 'bmc';
  const isUni = solverType === 'university';
  const isInd = solverType === 'industry';
  const threatClass = p.threat_level === 'HIGH' ? 'badge-threat-high' : (p.threat_level === 'MEDIUM' ? 'badge-threat-medium' : 'badge-threat-low');
  const hasTeam = p.status === 'In Progress' || p.status === 'Team Formed' || p.status === 'Solved';

  return `
    <div class="civic-card bg-white rounded-2xl p-6 shadow-xs space-y-4 border border-[#DDE4E8]">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-bold text-[#667085]">${p.id}</span>
            <span class="px-2 py-0.5 rounded text-xs ${threatClass}">
              ${p.threat_level} THREAT
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7F9F8] text-[#17212B] border border-[#DDE4E8]">
              Ward ${p.ward}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
              p.status === 'Solved' ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30' :
              p.status === 'In Progress' ? 'bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/30' : 'bg-[#F7F9F8] text-[#17212B] border border-[#DDE4E8]'
            }">
              ${p.status}
            </span>
          </div>

          <h3 class="text-base sm:text-lg font-bold text-[#17212B] hover:text-[#173F5F] cursor-pointer" onclick="window.app.openProblemDetail('${p.id}')">
            ${p.title}
          </h3>
          <p class="text-xs text-[#667085]">
            Reported by: <strong class="text-[#17212B]">${p.society_name}</strong> • 📍 ${p.location}
          </p>
        </div>

        <button onclick="window.app.openProblemDetail('${p.id}')" class="px-3.5 py-1.5 rounded-lg border border-[#173F5F] hover:bg-[#F7F9F8] text-[#173F5F] text-xs font-bold transition">
          View Workspace →
        </button>
      </div>

      <!-- Problem Brief -->
      <p class="text-xs text-[#667085] line-clamp-2 leading-relaxed">
        ${p.description}
      </p>

      <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2">
          <span class="block text-[#667085] font-semibold">Citizen Votes</span>
          <strong class="text-sm text-[#173F5F]">${(p.community_votes || 0).toLocaleString()}</strong>
        </div>
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2">
          <span class="block text-[#667085] font-semibold">Student/University Help</span>
          <strong id="student-help-count-${p.id}" class="text-sm text-[#2E7D5B]">${p.student_university_help_count || 0}</strong>
        </div>
        <div class="rounded-xl border border-[#DDE4E8] bg-[#F7F9F8] p-2">
          <span class="block text-[#667085] font-semibold">Industry/Startup Help</span>
          <strong id="industry-help-count-${p.id}" class="text-sm text-[#B7791F]">${p.industry_startup_help_count || 0}</strong>
        </div>
      </div>

      <!-- AI Recommended Solver Routing Breakdown -->
      <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-3 text-xs space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="font-bold text-[#17212B]">AI Recommended Consortium:</span>
          <span class="text-[10px] font-mono font-bold text-[#147D86] uppercase bg-white px-2 py-0.5 rounded border border-[#DDE4E8]">${p.recommended_solver}</span>
        </div>
        <div class="flex flex-wrap gap-1.5 pt-1">
          ${(p.required_skills || []).map(s => `
            <span class="px-2 py-0.5 rounded bg-white text-[#173F5F] text-[10px] font-semibold border border-[#DDE4E8]">🔧 ${s}</span>
          `).join('')}
        </div>
      </div>

      <!-- WORKFLOW ACTIONS (BMC vs University/Industry) -->
      <div class="pt-2 border-t border-[#DDE4E8] flex flex-wrap items-center justify-between gap-3 text-xs">
        ${isBmc ? `
          <!-- BMC TEAM FORMATION CONTROLS -->
          <div class="flex flex-wrap items-center gap-2">
            ${!hasTeam ? `
              <button onclick="window.app.openTeamModal('${p.id}', 'COMBINED')" class="px-4 py-2 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold transition flex items-center gap-1.5 shadow-xs">
                <span>👥</span>
                <span>CREATE OFFICIAL TEAM (Select Univ/Ind)</span>
              </button>

              <button onclick="window.app.openTeamModal('${p.id}', 'WORK_ALONE')" class="px-4 py-2 rounded-xl border border-[#1769AA] bg-white hover:bg-[#1769AA]/5 text-[#1769AA] font-bold transition flex items-center gap-1.5">
                <span>🏛️</span>
                <span>WORK ALONE (BMC Direct Implementation)</span>
              </button>
            ` : `
              <span class="px-3 py-1.5 rounded-lg bg-[#2E7D5B]/10 text-[#2E7D5B] font-bold border border-[#2E7D5B]/30">
                ✓ Official Team Formed: ${p.assigned_solver}
              </span>
            `}
            ${(p.student_university_help_count || 0) > 0 ? `
              <button onclick="window.app.openUniversitySupport('${p.id}')" class="px-4 py-2 rounded-xl border border-[#2E7D5B] bg-white hover:bg-[#2E7D5B]/5 text-[#2E7D5B] font-bold transition">
                🎓 VIEW UNIVERSITY SUPPORT
              </button>
            ` : ''}
            ${(p.industry_startup_help_count || 0) > 0 ? `
              <button onclick="window.app.openIndustrySupport('${p.id}')" class="px-4 py-2 rounded-xl border border-[#B7791F] bg-white hover:bg-[#B7791F]/5 text-[#B7791F] font-bold transition">
                🏢 VIEW INDUSTRY SUPPORT
              </button>
            ` : ''}
          </div>
          <span class="text-[11px] text-[#667085] italic">BMC retains sole authority to finalize official teams.</span>
        ` : `
          <!-- UNIVERSITY & INDUSTRY CONTRIBUTION CONTROLS (NO TEAM FORMATION ALLOWED) -->
          <div class="flex flex-wrap items-center gap-2">
            ${p.has_help_voted ? `
              <span class="px-4 py-2 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30 font-bold flex items-center gap-1.5">
                ✓ Voted to Help
              </span>
            ` : `
              <button
                id="help-vote-btn-${isUni ? 'StudentUniversity' : 'IndustryStartup'}-${p.id}"
                onclick="${isUni ? `window.app.openUniversityContributionModal('${p.id}')` : `window.app.openIndustryContributionModal('${p.id}')`}"
                class="px-4 py-2 rounded-xl bg-[#2E7D5B] hover:bg-[#25664A] text-white font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>👍</span><span>Vote to Help</span>
              </button>
            `}
            <button onclick="window.app.openProblemDetail('${p.id}')" class="px-3.5 py-2 rounded-xl border border-[#DDE4E8] text-[#17212B] font-semibold hover:bg-[#F7F9F8] transition">
              View Problem Context
            </button>
          </div>
          <span class="text-[11px] text-[#2E7D5B] font-semibold">
            ${isUni ? '✓ University/Student contributions are submitted with Vote to Help for BMC review.' : '✓ Industry/Startup contributions are submitted with Vote to Help and sent to BMC.'}
          </span>
        `}
      </div>
    </div>
  `;
}

function renderTeamTicketActionCard(t, teamName) {
  const previousWorkRating = demoPreviousWorkRating(`${t.id}-${teamName}`);
  return `
    <div class="bg-red-50/40 rounded-2xl p-4 border border-red-200 text-xs space-y-3">
      <div class="flex flex-wrap justify-between items-center gap-2">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-red-900">${t.id}</span>
          <span class="px-2 py-0.5 rounded font-extrabold text-[10px] bg-[#C62828] text-white">
            LEVEL ${t.escalation_level} ESCALATION
          </span>
          <span class="text-slate-600">• <strong class="${t.remaining_seconds !== null && t.remaining_seconds <= 0 ? 'text-red-700' : 'text-[#147D86]'}">${t.remaining_label || 'No active deadline'}</strong></span>
        </div>
        <span class="text-[11px] font-bold text-slate-700">Problem: ${t.problem_id}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/70 border border-red-100 rounded-xl p-2.5 text-[11px]">
        <p><strong>Deadline:</strong> ${t.current_deadline ? new Date(t.current_deadline).toLocaleString() : 'N/A'}</p>
        <p><strong>Government officer:</strong> ${t.responsible_officer || 'Pending assignment'}</p>
        <p class="sm:col-span-2"><strong>Previous Work Rating:</strong> <span class="text-amber-500 tracking-wide">★★★★★</span> <strong class="text-[#17212B]">${previousWorkRating}/5</strong> <span class="text-slate-500">(demo)</span></p>
      </div>

      <p class="text-slate-800 leading-relaxed">
        <strong>Society Complaint:</strong> ${t.reason} — <em>"${t.what_remains_unresolved}"</em>
      </p>

      ${t.team_response ? `
        <div class="bg-white p-2.5 rounded-xl border border-red-100 text-[11px] text-slate-700">
          <strong>Latest Team Response:</strong> ${t.team_response}
        </div>
      ` : ''}

      <div class="pt-2 border-t border-red-200 flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold text-slate-700">Team Actions:</span>
        <button onclick="window.app.openEscalationTicketDetail('${t.id}')" class="px-3 py-1.5 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800 transition">
          View Ticket
        </button>
        <button disabled title="Not implemented yet" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-400 cursor-not-allowed">
          Acknowledge (Coming Soon)
        </button>
        <button onclick="window.app.openTicketAttachmentModal('${t.id}', 'progress_report')" class="px-3 py-1.5 rounded-lg bg-[#173F5F] text-white font-bold hover:bg-[#1F547D] transition">
          Submit Progress Update
        </button>
        <button onclick="window.app.openTicketAttachmentModal('${t.id}', 'field_evidence')" class="px-3 py-1.5 rounded-lg bg-[#147D86] text-white font-bold hover:bg-[#116870] transition">
          Upload Field Evidence
        </button>
        <button disabled title="Not implemented yet" class="px-3 py-1.5 rounded-lg bg-[#2E7D5B]/40 text-white font-bold cursor-not-allowed">
          Mark Work Completed (Coming Soon)
        </button>
      </div>
    </div>
  `;
}

function demoPreviousWorkRating(seed) {
  const score = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return (4.2 + (score % 8) / 10).toFixed(1);
}
