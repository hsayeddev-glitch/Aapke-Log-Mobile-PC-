/** AAPKE LOG - Full-screen Hackathon Demo Simulation for judges */

function stepHeader(demo) {
  const labels = ['Submit Problem', 'Voting', 'BMC Solver', 'View Progress'];
  return `
    <div class="grid grid-cols-4 gap-2">
      ${labels.map((label, index) => {
        const num = index + 1;
        const active = demo.step === num;
        const complete = demo.step > num || demo.step === 5;
        return `<div class="relative text-center">
          <div class="h-1.5 rounded-full ${complete ? 'bg-[#2E7D5B]' : active ? 'bg-[#147D86]' : 'bg-[#DDE4E8]'} transition-all duration-500"></div>
          <p class="mt-1.5 text-[10px] sm:text-xs font-bold ${active ? 'text-[#147D86]' : complete ? 'text-[#2E7D5B]' : 'text-[#667085]'}">${complete ? '✓ ' : `${num}. `}${label}</p>
        </div>`;
      }).join('')}
    </div>`;
}

function demoProblemCard(problem, affectedPercentage = null) {
  return `
    <div class="civic-card bg-white rounded-2xl p-5 shadow-xs space-y-4 border border-[#DDE4E8]">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-bold text-[#667085]">${problem.id}</span>
            ${affectedPercentage !== null ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#147D86]/10 text-[#147D86] border border-[#147D86]/25">${affectedPercentage}% People Affected</span>` : ''}
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20">${problem.category}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7F9F8] text-[#17212B] border border-[#DDE4E8]">Ward ${problem.ward}</span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-[#17212B]">${problem.title}</h3>
          <p class="text-xs text-[#667085]">📍 ${problem.location} • 👥 <strong>${problem.people_affected.toLocaleString()}</strong> estimated residents impacted</p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">SIMULATION ONLY</span>
      </div>
      <p class="text-xs text-[#667085] leading-relaxed bg-[#F7F9F8] border border-[#DDE4E8] rounded-xl p-3">${problem.description}</p>
    </div>`;
}

function renderStep1(demo) {
  return `
    <div class="space-y-5 animate-fade-in">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#147D86]">Step 1 of 4</span>
        <h2 class="text-2xl font-black text-[#17212B]">Submit a Community Problem</h2>
        <p class="text-sm text-[#667085]">Choose one judge-ready scenario. Its report form will be completed automatically inside this simulation.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${demo.problems.map((problem, index) => `
          <button onclick="window.app.demoAction('selectProblem', ${index})" class="text-left bg-white rounded-2xl p-5 border border-[#DDE4E8] hover:border-[#147D86] hover:shadow-md transition group">
            <div class="flex items-start gap-3">
              <span class="text-3xl p-2 rounded-xl bg-[#F7F9F8] group-hover:bg-[#147D86]/10">${problem.icon}</span>
              <div>
                <span class="text-[10px] font-mono font-bold text-[#667085]">${problem.id} • ${problem.category}</span>
                <h3 class="text-sm font-black text-[#17212B] mt-1 group-hover:text-[#147D86]">${problem.title}</h3>
                <p class="text-xs text-[#667085] mt-2 line-clamp-2">${problem.description}</p>
                <span class="inline-block mt-3 text-xs font-bold text-[#147D86]">Select & Auto-fill Report →</span>
              </div>
            </div>
          </button>
        `).join('')}
      </div>
      <div class="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900"><strong>Safe demo:</strong> No API calls or database writes occur during this simulation.</div>
    </div>`;
}

function renderStep2(demo) {
  const p = demo.selectedProblem;
  return `
    <div class="space-y-5 animate-fade-in">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div><span class="text-[10px] font-bold uppercase tracking-wider text-[#147D86]">Step 2 of 4</span><h2 class="text-2xl font-black text-[#17212B]">Community Voting Simulation</h2><p class="text-sm text-[#667085]">The submission form is auto-filled. Adjust population and votes to calculate live impact.</p></div>
        <span class="px-3 py-1.5 rounded-full bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30 text-xs font-bold">✓ Problem Form Completed</span>
      </div>
      ${demoProblemCard(p, demo.affectedPercentage)}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-[#DDE4E8] bg-[#F7F9F8] p-5">
          <label class="text-xs font-black text-[#17212B] block mb-3">Society Population</label>
          <div class="grid grid-cols-3 gap-2">${[500,700,1000].map(value => `<button onclick="window.app.demoAction('population', ${value})" class="py-2.5 rounded-xl font-black text-sm border transition ${demo.population === value ? 'bg-[#173F5F] text-white border-[#173F5F]' : 'bg-white text-[#173F5F] border-[#DDE4E8] hover:border-[#173F5F]'}">${value}</button>`).join('')}</div>
        </div>
        <div class="rounded-2xl border border-[#DDE4E8] bg-[#F7F9F8] p-5">
          <label class="text-xs font-black text-[#17212B] block mb-3">People Voted</label>
          <div class="grid grid-cols-3 gap-2">${[300,500,800].map(value => `<button onclick="window.app.demoAction('votes', ${value})" class="py-2.5 rounded-xl font-black text-sm border transition ${demo.votes === value ? 'bg-[#147D86] text-white border-[#147D86]' : 'bg-white text-[#147D86] border-[#DDE4E8] hover:border-[#147D86]'}">${value}</button>`).join('')}</div>
        </div>
      </div>
      <div class="rounded-3xl bg-[#173F5F] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div><p class="text-xs text-slate-300 font-semibold">Affected % = (${demo.votes} ÷ ${demo.population}) × 100</p><p class="text-sm text-slate-200 mt-1">Calculated dynamically from the selected values</p></div>
        <div class="text-center sm:text-right"><strong class="text-4xl font-black text-[#53B7B3]">${demo.affectedPercentage}%</strong><p class="text-xs font-bold">People Affected</p></div>
      </div>
      <div class="flex justify-end"><button onclick="window.app.demoAction('teamStep')" class="px-5 py-2.5 rounded-xl bg-[#147D86] hover:bg-[#116870] text-white font-black shadow-md">Continue to BMC Solver →</button></div>
    </div>`;
}

function renderStep3(demo) {
  return `
    <div class="space-y-5 animate-fade-in">
      <div><span class="text-[10px] font-bold uppercase tracking-wider text-[#1769AA]">Step 3 of 4 ${demo.replacementMode ? '• Replacement Team' : ''}</span><h2 class="text-2xl font-black text-[#17212B]">BMC Municipal Solver — Form Official Team</h2><p class="text-sm text-[#667085]">Choose the same execution mode available in the real BMC workflow. Simulation selections remain isolated.</p></div>
      ${demoProblemCard(demo.selectedProblem, demo.affectedPercentage)}
      ${demo.replacementMode ? `<div class="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-bold">Level 3 escalation requires another official team. Select a replacement taskforce below.</div>` : ''}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${Object.entries(demo.teams).map(([key, team]) => `
          <button onclick="window.app.demoAction('team', '${key}')" class="text-left rounded-2xl border border-[#DDE4E8] bg-white p-5 hover:border-[#1769AA] hover:shadow-md transition">
            <div class="flex items-start gap-3"><span class="text-3xl">${team.icon}</span><div><span class="text-[10px] font-bold text-[#1769AA]">${team.mode}</span><h3 class="font-black text-[#17212B]">${team.title}</h3><p class="text-xs text-[#667085] mt-1">${team.description}</p></div></div>
            <div class="mt-3 flex flex-wrap gap-1.5">${team.members.map(member => `<span class="px-2 py-1 rounded-lg bg-[#F7F9F8] border border-[#DDE4E8] text-[10px] font-semibold text-[#173F5F]">${member}</span>`).join('')}</div>
            <span class="inline-block mt-3 text-xs font-black text-[#1769AA]">${demo.replacementMode ? 'Mobilize Replacement Team' : 'Create This Team'} →</span>
          </button>
        `).join('')}
      </div>
    </div>`;
}

function ticketCard(level, demo) {
  const config = {
    1: {title:'LEVEL 1 — Platform Support Review', days:'5-day review window', color:'#1769AA', text:'Responsible team and platform support are notified.'},
    2: {title:'LEVEL 2 — Senior Solver Review', days:'10-day completion window', color:'#B7791F', text:'Senior solver and government officer are alerted again.'},
    3: {title:'LEVEL 3 — Higher Authority Escalation', days:'5-day final window', color:'#C62828', text:'Higher authority action and replacement-team readiness are activated.'}
  }[level];
  return `<div class="rounded-2xl border p-5 space-y-3 animate-fade-in" style="border-color:${config.color};background:${config.color}0D"><div class="flex flex-wrap items-center justify-between gap-2"><span class="font-mono font-black" style="color:${config.color}">DEMO-TICKET-${level}</span><span class="px-2.5 py-1 rounded-full text-white text-[10px] font-black" style="background:${config.color}">LEVEL ${level}</span></div><h3 class="font-black text-[#17212B]">${config.title}</h3><p class="text-xs text-[#667085]">${config.text}</p><div class="flex justify-between text-[11px] bg-white border border-[#DDE4E8] rounded-xl p-3"><span>Status: <strong>Active Simulation</strong></span><span>Deadline: <strong>${config.days}</strong></span></div><p class="text-[10px] text-[#667085]">Problem: ${demo.selectedProblem.title} • Team: ${demo.selectedTeam.title}</p></div>`;
}

function renderStep4(demo) {
  const stages = ['Reported','Verified','Team Formed','Field Work','Community Review'];
  return `
    <div class="space-y-5 animate-fade-in">
      <div><span class="text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B]">Step 4 of 4</span><h2 class="text-2xl font-black text-[#17212B]">View Solution Progress</h2><p class="text-sm text-[#667085]">Follow the citizen-style visual timeline, then choose the judge demonstration outcome.</p></div>
      <div class="rounded-3xl border border-[#DDE4E8] bg-white p-6 space-y-5">
        <div class="flex flex-wrap justify-between gap-3"><div><h3 class="font-black text-[#17212B]">${demo.selectedProblem.title}</h3><p class="text-xs text-[#667085]">Official Team: ${demo.selectedTeam.title}</p></div><span class="px-3 py-1 rounded-full bg-[#1769AA]/10 text-[#1769AA] border border-[#1769AA]/20 text-xs font-bold">72% Simulated Progress</span></div>
        <div class="relative pt-2"><div class="absolute top-6 left-4 right-4 h-1 bg-[#DDE4E8]"></div><div class="absolute top-6 left-4 h-1 bg-[#2E7D5B]" style="width:68%"></div><div class="relative flex justify-between">${stages.map((stage,index)=>`<div class="text-center w-1/5"><div class="mx-auto w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${index<4?'bg-[#2E7D5B] text-white':'bg-[#DDE4E8] text-[#667085]'}">${index<3?'✓':index+1}</div><p class="text-[9px] sm:text-[10px] font-bold text-[#667085] mt-2">${stage}</p></div>`).join('')}</div></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onclick="window.app.demoAction('outcome','solved')" class="rounded-2xl p-5 bg-[#2E7D5B] hover:bg-[#25664A] text-white text-left transition shadow-md"><span class="text-2xl">✅</span><h3 class="font-black mt-2">Problem Solved</h3><p class="text-xs text-green-100">Complete the simulation with community resolution.</p></button>
        <button onclick="window.app.demoAction('outcome','ticket')" class="rounded-2xl p-5 bg-[#C62828] hover:bg-[#A32020] text-white text-left transition shadow-md"><span class="text-2xl">⚠️</span><h3 class="font-black mt-2">Ticket Raised</h3><p class="text-xs text-red-100">Demonstrate Level 1, 2, or 3 escalation cards.</p></button>
      </div>
      ${demo.outcome === 'ticket' ? `<div class="space-y-3"><div class="flex flex-wrap gap-2">${[1,2,3].map(level=>`<button onclick="window.app.demoAction('ticketLevel',${level})" class="px-4 py-2 rounded-xl border font-black text-xs ${demo.ticketLevel===level?'bg-[#173F5F] text-white border-[#173F5F]':'bg-white text-[#173F5F] border-[#DDE4E8]'}">Level ${level}</button>`).join('')}</div>${ticketCard(demo.ticketLevel || 1,demo)}${demo.ticketLevel===3?`<button onclick="window.app.demoAction('replacement')" class="w-full py-3 rounded-xl bg-[#173F5F] hover:bg-[#1F547D] text-white font-black shadow-md">Form Another Team →</button>`:''}</div>`:''}
    </div>`;
}

function renderCompletion(demo) {
  const replaced = demo.outcome === 'replacement';
  return `<div class="min-h-[480px] flex items-center justify-center text-center animate-fade-in"><div class="max-w-xl"><div class="w-24 h-24 mx-auto rounded-full ${replaced?'bg-[#1769AA]/10':'bg-[#2E7D5B]/10'} flex items-center justify-center text-5xl">${replaced?'🔄':'🎉'}</div><span class="inline-block mt-5 px-3 py-1 rounded-full bg-[#147D86]/10 text-[#147D86] text-xs font-black">SIMULATION COMPLETE</span><h2 class="text-3xl font-black text-[#17212B] mt-3">${replaced?'Replacement Team Mobilized':'Community Problem Solved'}</h2><p class="text-sm text-[#667085] mt-3">${replaced?`Level 3 escalation triggered a new official team: ${demo.selectedTeam.title}. Project continuity is preserved.`:`${demo.selectedProblem.title} completed the reporting, voting, BMC team, and progress lifecycle.`}</p><div class="mt-6 rounded-2xl bg-[#F7F9F8] border border-[#DDE4E8] p-4 text-xs text-left"><p><strong>Problem:</strong> ${demo.selectedProblem.title}</p><p class="mt-1"><strong>Affected calculation:</strong> ${demo.votes} ÷ ${demo.population} × 100 = ${demo.affectedPercentage}%</p><p class="mt-1"><strong>Final team:</strong> ${demo.selectedTeam.title}</p><p class="mt-1 text-[#2E7D5B] font-bold">✓ No real workspace data was changed.</p></div><div class="mt-6 flex justify-center gap-3"><button onclick="window.app.demoAction('reset')" class="px-5 py-2.5 rounded-xl bg-[#147D86] text-white font-black">Replay Simulation</button><button onclick="window.app.demoAction('close')" class="px-5 py-2.5 rounded-xl border border-[#DDE4E8] text-[#173F5F] font-black">Return to App</button></div></div></div>`;
}

export function renderHackathonDemoModal(demo) {
  let content = renderStep1(demo);
  if (demo.step === 2) content = renderStep2(demo);
  if (demo.step === 3) content = renderStep3(demo);
  if (demo.step === 4) content = renderStep4(demo);
  if (demo.step === 5) content = renderCompletion(demo);
  return `
    <div class="hackathon-demo-modal fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md p-2 sm:p-5 overflow-y-auto">
      <div class="demo-dialog max-w-6xl mx-auto min-h-full flex items-center justify-center">
        <div class="demo-panel bg-white rounded-3xl w-full shadow-2xl border border-[#DDE4E8] overflow-hidden">
          <div class="bg-[#173F5F] text-white px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3"><div><div class="flex items-center gap-2"><span class="text-[#53B7B3]">⚡</span><h1 class="font-black text-lg">Hackathon Demo Simulation</h1><span class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold">JUDGE MODE</span></div><p class="text-[11px] text-slate-300">Interactive end-to-end demonstration • isolated from real data</p></div><div class="flex items-center gap-2">${demo.step>1&&demo.step<5?`<button onclick="window.app.demoAction('back')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">← Back</button>`:''}<button onclick="window.app.demoAction('reset')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">↻ Reset</button><button onclick="window.app.demoAction('close')" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold" aria-label="Close simulation">✕</button></div></div>
          <div class="px-5 sm:px-8 pt-5">${stepHeader(demo)}</div>
          <div class="demo-content p-5 sm:p-8 min-h-[560px]">${content}</div>
        </div>
      </div>
    </div>`;
}
