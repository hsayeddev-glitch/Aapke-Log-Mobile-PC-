/**
 * AAPKE LOG - Structured AI Problem Intelligence Inspector
 * STRICT RULE: NO CHATBOT. AI appears strictly through structured UI panels.
 * Theme: Deep Civic Blue (#173F5F) + Teal (#147D86 / #53B7B3). No purple, no neon.
 */

export function renderAIIntelligencePanel(aiData) {
  if (!aiData) return '';

  const threatClass = aiData.threat_level === 'HIGH' ? 'badge-threat-high' : (aiData.threat_level === 'MEDIUM' ? 'badge-threat-medium' : 'badge-threat-low');

  return `
    <div class="bg-[#173F5F] text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6 border border-[#147D86]/60">
      <!-- AI Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#147D86] flex items-center justify-center text-xl shadow-xs">
            <span class="text-[#53B7B3]">⚡</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wide text-white">AI PROBLEM INTELLIGENCE</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/10 text-[#53B7B3] border border-[#53B7B3]/30">Structured Output</span>
            </div>
            <p class="text-xs text-slate-300">Autonomous semantic classification & multi-organization routing engine</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-300">Classification Confidence:</span>
          <span class="px-2.5 py-1 rounded bg-[#147D86]/40 text-[#53B7B3] text-xs font-mono font-bold border border-[#147D86]">${Math.round((aiData.category_confidence || 0.94) * 100)}%</span>
        </div>
      </div>

      <!-- Duplicate Alert Warning if similar problem >= 80% -->
      ${aiData.has_duplicate_warning ? `
        <div class="bg-[#B7791F]/15 border-2 border-[#B7791F] p-4 rounded-xl text-amber-100 flex items-start gap-3">
          <span class="text-2xl text-[#B7791F]">⚠️</span>
          <div class="space-y-1">
            <h4 class="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-200">POTENTIAL DUPLICATE WARNING</h4>
            <p class="text-xs text-slate-100 leading-relaxed font-medium">
              ${aiData.duplicate_warning_message}
            </p>
            <p class="text-[11px] text-amber-200/90 italic">
              A highly similar challenge already exists in this ward. Review existing challenges below before creating a redundant ticket.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Grid 1: Category & Threat Level -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Category Classification -->
        <div class="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase tracking-wider font-bold text-slate-300">AI Verified Category</span>
            <span class="text-[10px] font-mono text-[#53B7B3]">Domain Match</span>
          </div>
          <p class="text-lg font-black text-white">${aiData.category}</p>
          <p class="text-xs text-slate-200 font-medium">${aiData.subcategory || ''}</p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(aiData.related_domains || []).map(d => `
              <span class="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10">${d}</span>
            `).join('')}
          </div>
        </div>

        <!-- Threat Level (Strictly High/Medium/Low + Why) -->
        <div class="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase tracking-wider font-bold text-slate-300">AI Threat Level</span>
            <span class="px-2.5 py-0.5 rounded text-xs font-black ${threatClass}">
              ${aiData.threat_level}
            </span>
          </div>
          <div class="text-xs space-y-1 pt-1">
            <span class="font-extrabold text-[#53B7B3] text-xs">Why ${aiData.threat_level}?</span>
            <p class="text-slate-200 leading-relaxed text-[11px]">
              ${aiData.threat_reason}
            </p>
          </div>
        </div>
      </div>

      <!-- Grid 2: Required Expertise & Suggested Solution Areas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Required Expertise -->
        <div class="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2.5">
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-300">Required Skills & Capabilities</span>
          <div class="flex flex-wrap gap-2 pt-1">
            ${(aiData.required_skills || []).map(skill => `
              <span class="px-2.5 py-1 rounded-lg bg-[#147D86]/30 text-white border border-[#147D86] text-xs font-semibold">
                🔧 ${skill}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Suggested Solution Areas -->
        <div class="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2.5">
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-300">Suggested Solution Areas</span>
          <ul class="text-xs text-slate-200 space-y-1.5 pt-1">
            ${(aiData.suggested_solution_areas || []).map(area => `
              <li class="flex items-start gap-2 text-[11px]">
                <span class="text-[#53B7B3] font-bold">›</span>
                <span>${area}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Similar Problems Found Panel -->
      <div class="bg-white/10 border border-white/15 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-300">Similar Problems Detected in Mumbai</span>
          <span class="text-[10px] font-mono text-slate-300">Semantic & Ward Match</span>
        </div>

        ${(aiData.similar_problems && aiData.similar_problems.length > 0) ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${aiData.similar_problems.map(sim => `
              <div class="bg-white/10 border ${sim.is_duplicate_risk ? 'border-[#B7791F] bg-[#B7791F]/15' : 'border-white/10'} rounded-lg p-3 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono text-slate-300">Ward ${sim.ward}</span>
                  <span class="text-xs font-extrabold ${sim.similarity_percent >= 80 ? 'text-amber-300' : 'text-[#53B7B3]'} font-mono">
                    ${sim.similarity_percent}% Match
                  </span>
                </div>
                <p class="text-xs font-bold text-white line-clamp-2">${sim.title}</p>
                <div class="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                  <span>${sim.category}</span>
                  <span class="px-1.5 py-0.5 rounded bg-white/10">${sim.status}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-xs text-slate-300 italic">No existing high-similarity challenges found in immediate vicinity.</p>
        `}
      </div>

      <!-- Core AI Routing: RECOMMENDED SOLVER RESULT (Deep Civic Blue + Teal, No Purple) -->
      <div class="bg-[#12334F] border-2 border-[#147D86] rounded-2xl p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-[#53B7B3]">Core AI Routing Result</span>
            <h4 class="text-xl font-black text-white tracking-wide">
              RECOMMENDED SOLVER: <span class="text-[#53B7B3]">${aiData.recommended_solver}</span>
            </h4>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-300 uppercase">Expected Support Window</span>
            <p class="text-xs font-extrabold text-[#53B7B3]">${aiData.expected_support_window || '24–48 hours'}</p>
          </div>
        </div>

        <div class="text-xs text-slate-200 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
          <strong class="text-[#53B7B3]">Why this consortium?</strong> ${aiData.recommended_solver_reason}
        </div>

        <!-- Smart Matched Organizations -->
        <div class="space-y-2 pt-1">
          <span class="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Smart Matched Verified Organizations:</span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${(aiData.smart_matches || []).map(m => `
              <div class="bg-white/10 border border-white/15 rounded-xl p-3 flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-center justify-between text-[10px] text-slate-300">
                    <span class="font-bold text-[#53B7B3] uppercase">${m.type}</span>
                    <span class="font-mono font-bold text-white">${m.match_score}% MATCH</span>
                  </div>
                  <p class="text-xs font-bold text-white mt-1">${m.entity}</p>
                </div>
                <p class="text-[10px] text-slate-300 font-medium">Lead: ${m.lead}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
