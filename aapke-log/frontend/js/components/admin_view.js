/**
 * AAPKE LOG - Admin System & Intelligence Dashboard
 * Strictly separates:
 * 1. SECTION A: OFFICIAL REFERENCE DATA (BMC 2024 Civic Complaints)
 * 2. SECTION B: AAPKE LOG PLATFORM DATA (Prototype Simulation Data)
 */

import { api } from '../api.js';

export async function renderAdminView() {
  const overview = await api.getAdminOverview();
  const ref = overview.section_a_official;
  const sim = overview.section_b_simulation;
  const live = overview.live_metrics;
  const escalations = overview.escalations || [];
  const allProblems = await api.getProblems();

  return `
    <div class="space-y-12 pb-20">
      <!-- Admin Title Header -->
      <div class="bg-[#173F5F] text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight">MUMBAI SOCIETAL PROBLEM INTELLIGENCE</h1>
                <span class="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-white/15 text-white border border-white/20">System Oversight</span>
              </div>
              <p class="text-xs text-slate-200 mt-0.5">Municipal Data Segregation, AI Routing Verification & 3-Tier Escalation Queue</p>
            </div>
          </div>

          <div class="text-right">
            <span class="text-[11px] font-mono text-slate-300 block">Single Source of Truth: SQLite DB</span>
            <span class="text-xs font-bold text-[#53B7B3]">✓ AI Never Fabricates Statuses</span>
          </div>
        </div>

        <p class="text-xs text-slate-200 max-w-3xl leading-relaxed">
          This command center maintains two strictly separated logical datasets: <strong>Official Reference Data</strong> from publicly available BMC 2024 municipal reports, and <strong>Prototype Simulation Data</strong> representing Aapke Log’s AI collaborative matching engine.
        </p>
      </div>

      <!-- ========================================================================= -->
      <!-- SECTION A: OFFICIAL REFERENCE DATA                                         -->
      <!-- ========================================================================= -->
      <section class="space-y-6">
        <div class="official-ref-banner rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/20 text-white tracking-wider">SECTION A</span>
              <h2 class="text-xl font-black text-white">OFFICIAL REFERENCE DATA</h2>
            </div>
            <p class="text-xs text-slate-200 mt-0.5">Publicly Available BMC/Mumbai 2024 Reference Data</p>
          </div>
          <span class="text-xs font-medium text-slate-200 italic bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            Official Source: BMC 2024 Annual Civic Complaint Disclosures
          </span>
        </div>

        <!-- Official Stats 5 Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span class="text-[11px] uppercase tracking-wider font-bold text-slate-500">TOTAL COMPLAINTS</span>
            <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">${ref.total_complaints.toLocaleString()}</p>
            <span class="text-[10px] text-slate-400">Public 2024 Records</span>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span class="text-[11px] uppercase tracking-wider font-bold text-[#2E7D5B]">CLOSED</span>
            <p class="text-2xl sm:text-3xl font-black text-[#2E7D5B] mt-1">${ref.closed.toLocaleString()}</p>
            <span class="text-[10px] text-[#2E7D5B] font-medium">Successfully Resolved</span>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span class="text-[11px] uppercase tracking-wider font-bold text-[#C62828]">NOT CLOSED</span>
            <p class="text-2xl sm:text-3xl font-black text-[#C62828] mt-1">${ref.not_closed.toLocaleString()}</p>
            <span class="text-[10px] text-[#C62828] font-medium">Strictly Designated "Not Closed"</span>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span class="text-[11px] uppercase tracking-wider font-bold text-[#1769AA]">CLOSURE RATE</span>
            <p class="text-2xl sm:text-3xl font-black text-[#1769AA] mt-1">${Math.round(ref.closure_rate_percent)}%</p>
            <span class="text-[10px] text-slate-400">City-Wide Aggregate</span>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span class="text-[11px] uppercase tracking-wider font-bold text-[#B7791F]">AVG RESOLUTION TIME</span>
            <p class="text-2xl sm:text-3xl font-black text-[#B7791F] mt-1">${ref.average_resolution_days} DAYS</p>
            <span class="text-[10px] text-slate-400">BMC Municipal Benchmark</span>
          </div>
        </div>

        <!-- Section A Visuals: Ward & Category Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- WARD ANALYSIS: PROBLEMS BY WARD — MUMBAI 2024 -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">PROBLEMS BY WARD — MUMBAI 2024</h3>
                <p class="text-xs text-slate-500">Verified 24 BMC Wards with high-volume wards highlighted</p>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">24 Wards</span>
            </div>

            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-2">
              ${ref.ward_analysis.map(w => `
                <div class="flex items-center justify-between text-xs p-2 rounded-lg ${w.high_volume ? 'bg-amber-50/80 border border-amber-200 font-bold' : 'hover:bg-slate-50'}">
                  <div class="flex items-center gap-2">
                    <span class="w-8 font-mono ${w.high_volume ? 'text-amber-900 font-black' : 'text-slate-700'}">${w.ward}</span>
                    <span class="text-slate-600 text-[11px] line-clamp-1">${w.name}</span>
                    ${w.high_volume ? '<span class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">HIGH VOLUME</span>' : ''}
                  </div>
                  <span class="font-mono font-bold ${w.high_volume ? 'text-amber-900' : 'text-slate-800'}">${w.complaints.toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- CATEGORY ANALYSIS: PROBLEMS BY ISSUE — MUMBAI 2024 -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">PROBLEMS BY ISSUE — MUMBAI 2024</h3>
                <p class="text-xs text-slate-500">Solid Waste Management highlighted as largest civic category</p>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">Official Issues</span>
            </div>

            <div class="space-y-3 pt-1">
              ${ref.category_analysis.map(c => `
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="${c.is_largest ? 'font-extrabold text-[#173F5F] flex items-center gap-1.5' : 'font-medium text-slate-700'}">
                      ${c.category}
                      ${c.is_largest ? '<span class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#173F5F]/10 text-[#173F5F] font-bold">LARGEST CATEGORY</span>' : ''}
                    </span>
                    <span class="font-mono font-bold text-slate-900">${c.complaints.toLocaleString()} (${c.percentage}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="${c.is_largest ? 'bg-[#173F5F]' : 'bg-slate-400'} h-2 rounded-full" style="width: ${c.percentage * 3.5}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- SECTION B: AAPKE LOG PLATFORM DATA                                         -->
      <!-- ========================================================================= -->
      <section class="space-y-6">
        <div class="simulation-banner rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/20 text-white tracking-wider">SECTION B</span>
              <h2 class="text-xl font-black text-white">AAPKE LOG PLATFORM DATA</h2>
            </div>
            <p class="text-xs text-slate-200 mt-0.5">Prototype Simulation Data (Statistically Modeled after Mumbai Trends)</p>
          </div>
          <span class="text-xs font-bold text-amber-200 bg-black/20 px-3 py-1 rounded-lg border border-amber-400/30">
            LABEL: PROTOTYPE SIMULATION DATA
          </span>
        </div>

        <!-- Simulation Volume Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">Problems Registered</span>
            <p class="text-xl font-black text-slate-900 mt-1">${sim.problems_registered.toLocaleString()}</p>
            <span class="text-[10px] text-slate-400">Simulation Target</span>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">AI Classified</span>
            <p class="text-xl font-black text-[#147D86] mt-1">${sim.ai_classified.toLocaleString()}</p>
            <span class="text-[10px] text-[#147D86]">Structured Pipeline</span>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">Successfully Matched</span>
            <p class="text-xl font-black text-[#173F5F] mt-1">${sim.problems_matched.toLocaleString()}</p>
            <span class="text-[10px] text-[#173F5F]">Consortia Routing</span>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">Official Help Requests</span>
            <p class="text-xl font-black text-slate-900 mt-1">${sim.help_requests_total.toLocaleString()}</p>
            <span class="text-[10px] text-[#2E7D5B] font-bold">${sim.help_requests_accepted} Accepted / ${sim.help_requests_pending} Pending</span>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">Active Solution Projects</span>
            <p class="text-xl font-black text-[#1769AA] mt-1">${sim.active_solution_projects.toLocaleString()}</p>
            <span class="text-[10px] text-slate-500">${sim.projects_in_progress} In Progress</span>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span class="text-slate-500 font-semibold text-[11px]">Projects Solved</span>
            <p class="text-xl font-black text-[#2E7D5B] mt-1">${sim.projects_solved.toLocaleString()}</p>
            <span class="text-[10px] text-[#2E7D5B] font-bold">Closed With Feedback</span>
          </div>
        </div>

        <!-- Section B 3 Analytical Panels -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. AI Threat Level Distribution -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">AI THREAT LEVEL DISTRIBUTION</h3>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">Prototype AI</span>
            </div>

            <div class="space-y-3 pt-2">
              <div>
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-[#C62828]">HIGH</span>
                  <span class="font-mono">${sim.threat_level_distribution.HIGH}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                  <div class="bg-[#C62828] h-2 rounded-full" style="width: ${sim.threat_level_distribution.HIGH}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-[#B7791F]">MEDIUM</span>
                  <span class="font-mono">${sim.threat_level_distribution.MEDIUM}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                  <div class="bg-[#B7791F] h-2 rounded-full" style="width: ${sim.threat_level_distribution.MEDIUM}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-[#2E7D5B]">LOW</span>
                  <span class="font-mono">${sim.threat_level_distribution.LOW}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                  <div class="bg-[#2E7D5B] h-2 rounded-full" style="width: ${sim.threat_level_distribution.LOW}%"></div>
                </div>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 italic pt-2">
              *Prototype AI classification. Not official BMC threat statistics.
            </p>
          </div>

          <!-- 2. WHERE HELP IS NEEDED -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">WHERE HELP IS NEEDED</h3>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">Solver Deficit</span>
            </div>

            <div class="space-y-2 pt-1">
              ${sim.where_help_needed.map(item => `
                <div class="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-50">
                  <span class="font-medium text-slate-700">${item.short_label}</span>
                  <span class="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">${item.count}</span>
                </div>
              `).join('')}
            </div>
            <p class="text-[10px] text-slate-400 italic pt-1">
              Answers: “Which categories currently require more verified solvers?”
            </p>
          </div>

          <!-- 3. SOLVER ROUTING ANALYTICS -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">SOLVER ROUTING ANALYTICS</h3>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">Routing Data</span>
            </div>

            <div class="space-y-3 pt-2 text-xs">
              ${sim.solver_routing_analytics.map(r => `
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span class="font-semibold text-slate-700 text-[11px]">${r.solver_type}</span>
                    <span class="font-mono font-bold text-slate-900">${r.count.toLocaleString()}</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2">
                    <div class="h-2 rounded-full" style="width: ${(r.count / 1652) * 100}%; background-color: ${r.color}"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <p class="text-[10px] text-slate-400 italic pt-1">
              Label: Aapke Log Prototype Routing Data
            </p>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- ADMIN ESCALATION QUEUE (UNRESOLVED / ESCALATED CASES)                     -->
      <!-- ========================================================================= -->
      <section class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[#C62828] font-bold text-xl">⚠️</span>
              <h3 class="text-lg font-bold text-slate-900">ADMIN ESCALATION QUEUE: UNRESOLVED CASES</h3>
            </div>
            <p class="text-xs text-slate-500">Problems exceeding SLA or escalated by societies for Level 1, 2, or 3 administrative review.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C62828] border border-red-200">
            ${escalations.length} Active Escalations
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">Ticket ID</th>
                <th class="py-3 px-3">Problem & Society</th>
                <th class="py-3 px-3">Assigned Solver</th>
                <th class="py-3 px-3">Escalation Level</th>
                <th class="py-3 px-3">Current Status</th>
                <th class="py-3 px-3">Reason / Details</th>
                <th class="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${escalations.map(e => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-3 font-mono font-bold text-slate-900">${e.id}</td>
                  <td class="py-3 px-3">
                    <p class="font-bold text-slate-900">${e.problem_id}</p>
                    <p class="text-slate-500 text-[11px]">${e.society_name}</p>
                  </td>
                  <td class="py-3 px-3 font-medium text-slate-700">${e.previous_solver || 'Unassigned'}</td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded font-bold text-xs ${
                      e.escalation_level === 3 ? 'bg-red-50 text-[#C62828] border border-red-200 urgent-pulse' :
                      (e.escalation_level === 2 ? 'bg-amber-50 text-[#B7791F] border border-amber-200' : 'bg-blue-50 text-[#1769AA] border border-blue-200')
                    }">
                      LEVEL ${e.escalation_level}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700">${e.ticket_status}</span>
                    <p class="text-[10px] mt-1 ${e.remaining_seconds !== null && e.remaining_seconds <= 0 ? 'text-[#C62828]' : 'text-[#147D86]'} font-bold">${e.remaining_label || 'No active deadline'}</p>
                    <p class="text-[10px] text-slate-500">${e.current_deadline ? `Due ${new Date(e.current_deadline).toLocaleDateString()}` : ''}</p>
                  </td>
                  <td class="py-3 px-3 max-w-xs">
                    <p class="font-bold text-slate-800 truncate">${e.reason}</p>
                    <p class="text-slate-500 text-[11px] truncate">${e.what_remains_unresolved}</p>
                  </td>
                  <td class="py-3 px-3 text-right">
                    ${e.official_action_required ? `<span class="block mb-1 text-[10px] font-black text-[#C62828]">⚠ OFFICIAL ACTION REQUIRED</span>` : `<span class="block mb-1 text-[10px] font-semibold text-slate-500">Automatic deadline escalation</span>`}
                    <button onclick="window.app.openEscalationTicketDetail('${e.id}')" class="px-2.5 py-1 rounded bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold text-[11px] shadow-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- ADMIN PROBLEM QUEUE (FILTERABLE)                                          -->
      <!-- ========================================================================= -->
      <section class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">City-Wide Problem Queue & Governance</h3>
            <p class="text-xs text-slate-500">Filter, inspect AI threat classifications, and verify consortium assignments.</p>
          </div>
          <span class="text-xs font-mono font-bold text-slate-500">${allProblems.length} Live Records</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-3">Problem ID</th>
                <th class="py-3 px-3">Society</th>
                <th class="py-3 px-3">Category</th>
                <th class="py-3 px-3">Ward</th>
                <th class="py-3 px-3">Threat</th>
                <th class="py-3 px-3">Assigned Solver</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${allProblems.slice(0, 15).map(p => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-900">${p.id}</td>
                  <td class="py-2.5 px-3 font-medium text-slate-800">${p.society_name}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">${p.ai_category}</span>
                  </td>
                  <td class="py-2.5 px-3 font-bold text-slate-700">${p.ward}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.threat_level === 'HIGH' ? 'bg-red-50 text-[#C62828] border border-red-200' :
                      (p.threat_level === 'MEDIUM' ? 'bg-amber-50 text-[#B7791F] border border-amber-200' : 'bg-green-50 text-[#2E7D5B] border border-green-200')
                    }">${p.threat_level}</span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[200px]">${p.assigned_solver || 'Pending'}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] ${
                      p.status === 'Solved' ? 'bg-green-50 text-[#2E7D5B] border border-green-200 font-bold' :
                      (p.status === 'Escalated' ? 'bg-red-50 text-[#C62828] border border-red-200 font-bold' : 'bg-slate-100 text-slate-700')
                    }">${p.status}</span>
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <button onclick="window.app.openProblemDetail('${p.id}')" class="btn-secondary px-2.5 py-1 text-[11px] font-bold">
                      View
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- ADMIN FEEDBACK & COMMUNITY SENTIMENT                                      -->
      <!-- ========================================================================= -->
      <section class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Community Solution Feedback & Quality Audits</h3>
            <p class="text-xs text-slate-500">Post-resolution transparency ratings from societies and citizens.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-amber-500 font-black text-base">★ ${live.feedback.avg_satisfaction} / 5.0</span>
            <span class="text-xs text-slate-400 font-medium">(${live.feedback.total} reviews)</span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-semibold">Average Speed:</span>
            <p class="text-base font-bold text-slate-900 mt-0.5">${live.feedback.avg_speed} / 5</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-semibold">Solution Quality:</span>
            <p class="text-base font-bold text-slate-900 mt-0.5">${live.feedback.avg_quality} / 5</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-semibold">Problem Actually Solved (YES):</span>
            <p class="text-base font-bold text-[#2E7D5B] mt-0.5">${live.feedback.resolved_yes} cases</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-semibold">Partially / Not Solved:</span>
            <p class="text-base font-bold text-[#B7791F] mt-0.5">${live.feedback.resolved_partially + live.feedback.resolved_no} cases</p>
          </div>
        </div>
      </section>
    </div>
  `;
}
