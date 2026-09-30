/**
 * AAPKE LOG - Citizen Explorer & Community Support Portal
 * Enforces:
 * 1. Citizen belongs to one verified society (Citizen -> Society ID).
 * 2. Citizen can ONLY vote on their own society's verified challenges (citizen.society_id == problem.society_id).
 * 3. Citizen votes NEVER alter threat level (threat level is independent AI classification).
 * 4. Problems ordered strictly: HIGH PRIORITY -> MEDIUM PRIORITY -> LOW PRIORITY.
 *    Within the same threat level: Community Votes as secondary ordering.
 * 5. NO '#1/#2/#3' ranking badges.
 * 6. Citizens can view solution progress and current stage (read-only).
 */

import { state } from '../state.js';
import { api } from '../api.js';

export async function renderCitizenView() {
  const citizen = state.activeCitizen;
  const mySocietyProblems = await api.getMySocietyProblems(citizen.society_id, citizen.id);
  const allProblems = await api.getProblems();

  // Separate my society problems into threat priority tiers
  const highPriority = mySocietyProblems.filter(p => p.threat_level === 'HIGH');
  const mediumPriority = mySocietyProblems.filter(p => p.threat_level === 'MEDIUM');
  const lowPriority = mySocietyProblems.filter(p => p.threat_level === 'LOW');

  return `
    <div class="space-y-8 pb-16">
      <!-- Citizen Identity & Society Association Banner -->
      <div class="bg-[#173F5F] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4 border border-[#1F547D]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#147D86]/30 text-[#53B7B3] border border-[#147D86]/50">
              👥 Verified Citizen Portal
            </span>
            <span class="text-xs text-slate-300">• Smart India Hackathon 2026</span>
          </div>

          <div class="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <span class="text-[#53B7B3] font-bold">Logged In Citizen:</span>
            <strong class="text-white">${citizen.name}</strong>
            <span class="text-slate-300">(${citizen.mobile})</span>
          </div>
        </div>

        <div class="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#53B7B3]">MY REGISTERED SOCIETY</span>
            <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>🏛️</span>
              <span>${citizen.society_name}</span>
            </h2>
            <p class="text-xs text-slate-200">
              Society ID: <strong class="font-mono text-white">${citizen.society_id}</strong> • 
              Mumbai Ward: <span class="px-2 py-0.5 rounded bg-white/15 font-bold text-white">${citizen.ward}</span> • 
              Member ID: <span class="font-mono text-[#53B7B3] font-bold">${citizen.member_id}</span>
            </p>
          </div>

          <div class="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-xs space-y-1 text-right">
            <div class="text-[11px] text-slate-200">Active Society Challenges: <strong class="text-white">${mySocietyProblems.length}</strong></div>
            <div class="text-[11px] text-[#53B7B3] font-semibold">✓ Verified Voting Rights Enabled</div>
          </div>
        </div>

        <!-- Governance Safeguard Alert -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed space-y-1">
          <div class="font-bold text-[#53B7B3]">Voting & Threat Level Governance Rules:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>• <strong>Community Support Only:</strong> Citizen votes express resident validation; votes <em>never</em> alter AI Threat Level.</div>
            <div>• <strong>Primary Ordering:</strong> Public lists sort by HIGH → MEDIUM → LOW; votes act strictly as secondary sorting.</div>
          </div>
        </div>
      </div>

      <!-- Section: My Society Verified Challenges -->
      <div class="space-y-6">
        <div class="border-b border-[#DDE4E8] pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black text-[#17212B]">Community Problems in ${citizen.society_name}</h2>
            <p class="text-xs text-[#667085]">Cast your community validation vote and monitor live remediation milestones.</p>
          </div>
          <div class="text-xs font-bold text-[#173F5F] bg-[#F7F9F8] border border-[#DDE4E8] px-3 py-1.5 rounded-lg">
            Voting Rule: 1 Verified Citizen = 1 Vote Per Problem
          </div>
        </div>

        <!-- TIER 1: HIGH PRIORITY PROBLEMS -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#C62828]"></span>
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-[#C62828]">
              High Priority Challenges (${highPriority.length})
            </h3>
            <span class="text-xs text-[#667085]">• Critical Safety & Infrastructure Threats</span>
          </div>

          ${highPriority.length === 0 ? `
            <div class="bg-white p-6 rounded-2xl border border-[#DDE4E8] text-xs text-[#667085] text-center">
              No High Threat challenges active in your society currently.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${highPriority.map(p => renderCitizenProblemCard(p, citizen, true)).join('')}
            </div>
          `}
        </div>

        <!-- TIER 2: MEDIUM PRIORITY PROBLEMS -->
        <div class="space-y-3 pt-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#B7791F]"></span>
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-[#B7791F]">
              Medium Priority Challenges (${mediumPriority.length})
            </h3>
            <span class="text-xs text-[#667085]">• Localized Disruption & Maintenance Needs</span>
          </div>

          ${mediumPriority.length === 0 ? `
            <div class="bg-white p-6 rounded-2xl border border-[#DDE4E8] text-xs text-[#667085] text-center">
              No Medium Threat challenges active in your society.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${mediumPriority.map(p => renderCitizenProblemCard(p, citizen, true)).join('')}
            </div>
          `}
        </div>

        <!-- TIER 3: LOW PRIORITY PROBLEMS -->
        <div class="space-y-3 pt-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#2E7D5B]"></span>
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-[#2E7D5B]">
              Low Priority Challenges (${lowPriority.length})
            </h3>
            <span class="text-xs text-[#667085]">• Non-Hazardous & Community Enhancement</span>
          </div>

          ${lowPriority.length === 0 ? `
            <div class="bg-white p-6 rounded-2xl border border-[#DDE4E8] text-xs text-[#667085] text-center">
              No Low Threat challenges currently reported.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${lowPriority.map(p => renderCitizenProblemCard(p, citizen, true)).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- City-Wide Public Problems (Read-Only Context to prove voting restriction) -->
      <div class="space-y-4 pt-8 border-t border-[#DDE4E8]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-[#17212B]">Other Mumbai Society Challenges (City-Wide View)</h2>
            <p class="text-xs text-[#667085]">Notice: Voting is restricted exclusively to your registered society (${citizen.society_name}).</p>
          </div>
          <span class="text-xs font-semibold text-[#667085]">${allProblems.length} Total Verified Challenges Across Mumbai</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${allProblems.filter(p => p.society_id !== citizen.society_id).slice(0, 4).map(p => renderCitizenProblemCard(p, citizen, false)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCitizenProblemCard(p, citizen, isOwnSociety) {
  const threatClass = p.threat_level === 'HIGH' ? 'badge-threat-high' : (p.threat_level === 'MEDIUM' ? 'badge-threat-medium' : 'badge-threat-low');
  const hasVoted = p.has_voted || false;
  const votes = p.community_votes || 0;
  const progress = p.project_progress || 10;

  return `
    <div class="civic-card bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 border ${isOwnSociety ? 'border-[#147D86]/30' : 'border-[#DDE4E8]'}">
      <div class="space-y-3">
        <!-- Top metadata -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-xs ${threatClass}">
              ${p.threat_level} THREAT
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20">
              ${p.ai_category}
            </span>
          </div>

          <span class="text-xs font-bold text-[#17212B] bg-[#F7F9F8] border border-[#DDE4E8] px-2 py-0.5 rounded">
            Ward ${p.ward}
          </span>
        </div>

        <h3 class="text-base font-bold text-[#17212B] leading-snug hover:text-[#173F5F] cursor-pointer" onclick="window.app.openProblemDetail('${p.id}')">
          ${p.title}
        </h3>

        <p class="text-xs text-[#667085] line-clamp-2 leading-relaxed">
          ${p.description}
        </p>

        <!-- Threat Level vs Community Votes Comparison (Strict Separation) -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-2.5">
            <span class="text-[10px] uppercase font-bold text-[#667085] block">AI Threat Level:</span>
            <strong class="${p.threat_level === 'HIGH' ? 'text-[#C62828]' : (p.threat_level === 'MEDIUM' ? 'text-[#B7791F]' : 'text-[#2E7D5B]')} text-sm font-black">
              ${p.threat_level}
            </strong>
          </div>

          <div class="bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-2.5">
            <span class="text-[10px] uppercase font-bold text-[#667085] block">Community Support:</span>
            <strong class="text-[#173F5F] text-sm font-black" id="votes-counter-${p.id}">
              ${votes.toLocaleString()} Votes
            </strong>
          </div>
        </div>

        <!-- Progress Bar (Read-Only) -->
        <div class="space-y-1 text-xs">
          <div class="flex justify-between items-center text-[11px]">
            <span class="text-[#667085] font-semibold">Solution Stage: <strong class="text-[#17212B]">${p.project_stage || 'Verification'}</strong></span>
            <span class="text-[#2E7D5B] font-bold">${progress}% Completed</span>
          </div>
          <div class="w-full bg-[#DDE4E8] rounded-full h-2 overflow-hidden">
            <div class="bg-[#2E7D5B] h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-3 border-t border-[#DDE4E8] flex flex-wrap items-center justify-between gap-2 text-xs">
        <button onclick="window.app.openProblemDetail('${p.id}')" class="px-3 py-1.5 rounded-lg border border-[#173F5F] text-[#173F5F] font-bold hover:bg-[#F7F9F8] transition">
          View Progress →
        </button>

        ${isOwnSociety ? `
          ${hasVoted ? `
            <span class="px-3.5 py-1.5 rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30 font-bold flex items-center gap-1">
              <span>✓</span>
              <span>VOTED</span>
            </span>
          ` : `
            <button onclick="window.app.castCitizenVote('${p.id}')" id="vote-btn-${p.id}" class="px-4 py-1.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-bold transition flex items-center gap-1.5 shadow-xs">
              <span>👍</span>
              <span>Vote</span>
            </button>
          `}
        ` : `
          <span class="text-[10px] text-[#667085] italic bg-[#F7F9F8] px-2 py-1 rounded border border-[#DDE4E8]">
            🔒 Voting limited to ${p.society_name}
          </span>
        `}
      </div>
    </div>
  `;
}
