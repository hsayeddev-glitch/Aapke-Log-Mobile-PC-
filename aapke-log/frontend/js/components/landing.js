/**
 * AAPKE LOG - Landing Gateway
 * Redesigned with Civic Blue + Teal + Community Green Palette
 */

export function renderLanding() {
  return `
    <div class="space-y-12 pb-16">
      <!-- Hero Banner (Rich deep civic-blue #173F5F, no purple, soft teal #53B7B3 highlights) -->
      <section class="relative overflow-hidden rounded-3xl bg-[#173F5F] text-white p-8 md:p-14 shadow-lg border border-[#1F547D]">
        <img
          src="/static/images/mumbai-skyline.png"
          alt=""
          aria-hidden="true"
          class="absolute inset-0 h-full w-full object-cover object-center md:object-[60%_center] pointer-events-none select-none"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-[#0B2942]/95 via-[#173F5F]/80 to-[#0B2942]/35 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0B2942]/90 via-transparent to-[#173F5F]/25 pointer-events-none"></div>
        <div class="max-w-3xl space-y-6 relative z-10">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#53B7B3]">
            <span>🏛️</span>
            <span>Smart India Hackathon 2026 • Problem Statement SIH26043</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            AAPKE LOG, <br/>
            <span class="text-[#53B7B3]">AAPKE LIYE, HAMESHA</span>
          </h1>

          <p class="text-xl sm:text-2xl text-slate-100 font-medium leading-relaxed">
            “People know their problems. <br class="hidden sm:block"/>
            <span class="text-white font-bold underline decoration-[#53B7B3] decoration-2 underline-offset-4">Aapke Log finds who can solve them.”</span>
          </p>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            A civic-tech and AI-powered societal problem-solving network focused on Mumbai and BMC wards. 
            Empowering verified societies to report genuine challenges, categorized by structured AI intelligence, 
            and solved through official multidisciplinary consortia of municipal authorities, universities, and industry.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <button onclick="window.app.startGuidedDemo()" class="px-6 py-3.5 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-extrabold text-sm shadow-sm transition transform active:scale-95 flex items-center gap-2">
              <span class="text-[#53B7B3]">⚡</span>
              <span>Launch End-to-End Live Demo</span>
            </button>
            <button onclick="window.app.setView('society')" class="px-6 py-3.5 rounded-xl bg-white text-[#173F5F] hover:bg-slate-100 font-bold text-sm shadow-sm transition flex items-center gap-2">
              <span>🏢 Enter as Verified Society</span>
            </button>
            <button onclick="window.app.setView('citizen')" class="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-semibold text-sm border border-[#53B7B3]/40 transition flex items-center gap-2">
              <span class="text-[#53B7B3]">👥</span>
              <span>Citizen Explorer Mode</span>
            </button>
          </div>
        </div>

        <!-- Controlled Workflow Chain -->
        <div class="mt-10 pt-8 border-t border-white/15 relative z-10">
          <p class="text-xs uppercase tracking-widest text-[#53B7B3] font-bold mb-3">Controlled Solution Workflow</p>
          <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-200">
            <span class="px-2.5 py-1 rounded bg-white/10 border border-white/15">SOCIETY REPORTS</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-[#147D86]/30 text-[#53B7B3] border border-[#147D86]/40">AI ANALYSIS</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-white/10 text-white border border-white/15">THREAT LEVEL</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-white/10 border border-white/15">REQUIRED EXPERTISE</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-white/10 border border-white/15">SIMILAR DETECTION</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-[#1769AA]/30 text-white border border-[#1769AA]/40">SOLVER ROUTING</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-[#2E7D5B]/30 text-emerald-200 border border-[#2E7D5B]/40">VERIFIED SOLVER ACCEPTS</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-[#173F5F] text-white border border-[#53B7B3]/40">OFFICIAL TEAM</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-white/10 border border-white/15">10-STAGE PROJECT</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-[#3B7C82]/30 text-[#53B7B3] border border-[#3B7C82]/40">CITIZEN FEEDBACK</span>
            <span class="text-[#53B7B3]">→</span>
            <span class="px-2.5 py-1 rounded bg-white/10 text-slate-300 border border-white/15">SUPPORT ESCALATION</span>
          </div>
        </div>
      </section>

      <!-- Verification Safeguard Alert (Clean civic style) -->
      <div class="bg-white border-l-4 border-[#147D86] p-4 rounded-xl shadow-xs border border-[#DDE4E8] flex items-start gap-3">
        <span class="text-xl text-[#147D86]">🛡️</span>
        <div>
          <h4 class="text-sm font-bold text-[#17212B]">Controlled Community Ingestion & Society Verification</h4>
          <p class="text-xs text-[#667085] mt-0.5 leading-relaxed">
            The platform is not an open spam board. <strong class="text-[#17212B]">Only verified societies and recognized community representatives can register societal problems.</strong>
            This reduces duplicate, fake and abusive submissions. Citizens can view public challenges and offer voluntary support, but cannot create unverified societal problem tickets.
          </p>
        </div>
      </div>

      <!-- 4 SEPARATE ROLE PORTALS -->
      <section class="space-y-6">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#17212B]">Select Your Authorized Portal</h2>
          <p class="text-sm text-[#667085]">Each organization role possesses dedicated authentication, authorized privileges, and specialized workflows.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card 1: Society / Community (Slate Role Color: #5B6675) -->
          <div class="civic-card bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-[#5B6675]" onclick="window.app.setView('society')">
            <div class="space-y-4">
              <div class="w-14 h-14 rounded-2xl bg-[#5B6675]/10 text-[#5B6675] flex items-center justify-center text-2xl transition">
                🏢
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#5B6675] bg-[#5B6675]/10 px-2 py-0.5 rounded">Primary Requester</span>
                <h3 class="text-lg font-bold text-[#17212B] mt-1">SOCIETY / COMMUNITY REPRESENTATIVE</h3>
              </div>
              <p class="text-xs text-[#667085] font-medium italic">
                “Register and report genuine community problems.”
              </p>
              <ul class="text-xs text-[#667085] space-y-1.5 border-t border-[#DDE4E8] pt-3">
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Verified CHS & RWA accounts</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Structured problem reporting</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Real-time AI threat & routing</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Track 10-stage solution progress</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Provide feedback & 3-tier escalation</li>
              </ul>
            </div>
            <div class="mt-6 pt-4 border-t border-[#DDE4E8]">
              <span class="w-full py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white text-xs font-bold flex items-center justify-center gap-1 transition">
                Enter Society Dashboard →
              </span>
            </div>
          </div>

          <!-- Card 2: BMC / Government (BMC Blue: #1769AA) -->
          <div class="civic-card bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-[#1769AA]" onclick="window.app.setView('bmc')">
            <div class="space-y-4">
              <div class="w-14 h-14 rounded-2xl bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center text-2xl transition">
                🏛️
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#1769AA] bg-[#1769AA]/10 px-2 py-0.5 rounded">Municipal Authority</span>
                <h3 class="text-lg font-bold text-[#17212B] mt-1">BMC / GOVERNMENT</h3>
              </div>
              <p class="text-xs text-[#667085] font-medium italic">
                “Receive and resolve civic problems.”
              </p>
              <ul class="text-xs text-[#667085] space-y-1.5 border-t border-[#DDE4E8] pt-3">
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> 24 BMC Wards jurisdictional routing</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Review matched civic help requests</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Accept requests (24-48h support window)</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Form official multi-entity teams</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Heavy field implementation & logistics</li>
              </ul>
            </div>
            <div class="mt-6 pt-4 border-t border-[#DDE4E8]">
              <span class="w-full py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white text-xs font-bold flex items-center justify-center gap-1 transition">
                Enter BMC Portal →
              </span>
            </div>
          </div>

          <!-- Card 3: University / Students (University Green: #2E7D5B) -->
          <div class="civic-card bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-[#2E7D5B]" onclick="window.app.setView('university')">
            <div class="space-y-4">
              <div class="w-14 h-14 rounded-2xl bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center text-2xl transition">
                🎓
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B] bg-[#2E7D5B]/10 px-2 py-0.5 rounded">Academia & Research</span>
                <h3 class="text-lg font-bold text-[#17212B] mt-1">UNIVERSITY / STUDENT</h3>
              </div>
              <p class="text-xs text-[#667085] font-medium italic">
                “Help solve problems through knowledge, research and student projects.”
              </p>
              <ul class="text-xs text-[#667085] space-y-1.5 border-t border-[#DDE4E8] pt-3">
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Matched R&D and engineering challenges</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Faculty research mentor assignments</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Senior capstone & student project teams</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Lab testing, simulation & diagnostics</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Co-solve with BMC and industry partners</li>
              </ul>
            </div>
            <div class="mt-6 pt-4 border-t border-[#DDE4E8]">
              <span class="w-full py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white text-xs font-bold flex items-center justify-center gap-1 transition">
                Enter University Portal →
              </span>
            </div>
          </div>

          <!-- Card 4: Industry / Company (Industry Amber: #B7791F) -->
          <div class="civic-card bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between cursor-pointer group hover:border-[#B7791F]" onclick="window.app.setView('industry')">
            <div class="space-y-4">
              <div class="w-14 h-14 rounded-2xl bg-[#B7791F]/10 text-[#B7791F] flex items-center justify-center text-2xl transition">
                🏭
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#B7791F] bg-[#B7791F]/10 px-2 py-0.5 rounded">Tech & Resources</span>
                <h3 class="text-lg font-bold text-[#17212B] mt-1">INDUSTRY / COMPANY</h3>
              </div>
              <p class="text-xs text-[#667085] font-medium italic">
                “Provide technology, expertise, resources and implementation support.”
              </p>
              <ul class="text-xs text-[#667085] space-y-1.5 border-t border-[#DDE4E8] pt-3">
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Commercial technology deployment</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> IoT sensors, telemetry & hardware</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Equipment & CSR funding pools</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Industrial mentorship to student teams</li>
                <li class="flex items-center gap-1.5"><span class="text-[#147D86] font-bold">✓</span> Scalable civic-tech pilots</li>
              </ul>
            </div>
            <div class="mt-6 pt-4 border-t border-[#DDE4E8]">
              <span class="w-full py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white text-xs font-bold flex items-center justify-center gap-1 transition">
                Enter Industry Portal →
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Split: Admin Login & Citizen Role Definition -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Citizen Role Explanation Card (Citizen Teal: #3B7C82) -->
        <div class="md:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#DDE4E8] space-y-4">
          <div class="flex items-center gap-2 text-[#3B7C82] text-xs font-bold uppercase tracking-wider">
            <span>👥</span>
            <span>Citizen Explorer Role Defined</span>
          </div>
          <h3 class="text-xl font-bold text-[#17212B]">Citizens Are Community Supporters, Not Official Problem Solvers</h3>
          <p class="text-xs text-[#667085] leading-relaxed">
            Individual citizens can freely browse public community challenges, track verified progress, offer voluntary ground data/photos, suggest helpful local resources, and submit post-resolution feedback.
          </p>
          <div class="bg-[#F7F9F8] rounded-xl p-3.5 text-xs text-[#17212B] border border-[#DDE4E8]">
            <strong class="text-[#3B7C82]">Critical Boundary:</strong> A citizen offering local assistance (e.g. <em>“I can provide local water pressure data”</em>) becomes a <strong>Citizen Support Offer</strong>. It does NOT count as an official solution acceptance, and citizens cannot alter official problem status.
          </div>
          <div class="pt-2">
            <button onclick="window.app.setView('citizen')" class="px-4 py-2 rounded-lg bg-[#3B7C82] hover:bg-[#31676C] text-white text-xs font-bold transition">
              Explore Public Challenges as Citizen →
            </button>
          </div>
        </div>

        <!-- Admin Login Card (Admin Deep Blue: #173F5F) -->
        <div class="bg-white rounded-2xl p-6 border border-[#DDE4E8] shadow-xs flex flex-col justify-between">
          <div class="space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#173F5F]/10 text-[#173F5F] flex items-center justify-center text-xl">
              🛡️
            </div>
            <h3 class="text-base font-bold text-[#17212B]">ADMINISTRATIVE COMMAND</h3>
            <p class="text-xs text-[#667085] leading-relaxed">
              System-wide oversight layer for society verification, 3-tier escalation management, and Mumbai municipal intelligence.
            </p>
            <div class="text-[11px] text-[#667085] space-y-1 pt-1">
              <div>• Section A: BMC 2024 Reference Data</div>
              <div>• Section B: Prototype Simulation (6,200 records)</div>
              <div>• SLA Breach Escalations (Levels 1, 2, 3)</div>
            </div>
          </div>
          <div class="pt-4">
            <button onclick="window.app.setView('admin')" class="w-full py-2.5 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white text-xs font-bold transition">
              Admin Login (Demo Primary) →
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}
