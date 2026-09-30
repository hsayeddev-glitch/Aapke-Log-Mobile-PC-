/**
 * AAPKE LOG - Main Application Entrypoint & Event Orchestrator
 */

import { state } from './state.js';
import { api } from './api.js';
import { renderNavbar } from './components/navbar.js';
import { renderLanding } from './components/landing.js';
import { renderSocietyView } from './components/society_view.js';
import { renderSolverView } from './components/solver_view.js';
import { renderCitizenView } from './components/citizen_view.js';
import { renderAdminView } from './components/admin_view.js';
import { renderProjectWorkspace } from './components/project_view.js';
import { renderReportModal } from './components/report_modal.js';
import { renderTeamModal } from './components/team_modal.js';
import { renderFeedbackModal } from './components/feedback_modal.js';
import { renderEscalationModal } from './components/escalation_modal.js';
import { renderCitizenOfferModal } from './components/citizen_offer_modal.js';
import { renderAIIntelligencePanel } from './components/ai_inspector.js';
import { renderSocietyProblemDetailModal } from './components/society_problem_detail_modal.js';
import { renderEscalationTicketDetailModal } from './components/escalation_ticket_detail_modal.js';
import { renderTicketAttachmentModal } from './components/ticket_attachment_modal.js';
import { renderHackathonDemoModal } from './components/hackathon_demo_modal.js';
import { renderUniversityContributionModal } from './components/university_contribution_modal.js';
import { renderUniversitySupportModal } from './components/university_support_modal.js';
import { renderIndustryContributionModal } from './components/industry_contribution_modal.js';
import { renderIndustrySupportModal } from './components/industry_support_modal.js';
import { demoController } from './demo_controller.js';

class App {
  constructor() {
    this.selectedEvidenceFile = null;
    this.evidencePreviewUrl = null;
    this.isSubmittingProblem = false;
    this.ticketEvidenceFile = null;
    this.ticketEvidencePreviewUrl = null;
    this.isSubmittingTicket = false;
    this.ticketAttachmentType = null;
    this.selectedTicketAttachmentFile = null;
    this.ticketAttachmentPreviewUrl = null;
    this.isSubmittingTicketAttachment = false;
    this.teamFormationMode = 'COMBINED';
    this.isSubmittingUniversityContribution = false;
    this.isSubmittingIndustryContribution = false;
    state.subscribe(() => this.render());
  }

  async init() {
    this.render();
  }

  async render() {
    // 1. Render Navbar
    const navEl = document.getElementById('navbar-root');
    if (navEl) navEl.innerHTML = renderNavbar();

    // 2. Render Active View
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    mainEl.innerHTML = `
      <div class="flex items-center justify-center py-16">
        <div class="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;

    let contentHtml = '';
    try {
      if (state.currentView === 'landing') {
        contentHtml = renderLanding();
      } else if (state.currentView === 'society') {
        contentHtml = await renderSocietyView();
      } else if (state.currentView === 'bmc') {
        contentHtml = await renderSolverView('bmc');
      } else if (state.currentView === 'university') {
        contentHtml = await renderSolverView('university');
      } else if (state.currentView === 'industry') {
        contentHtml = await renderSolverView('industry');
      } else if (state.currentView === 'citizen') {
        contentHtml = await renderCitizenView();
      } else if (state.currentView === 'admin') {
        contentHtml = await renderAdminView();
      } else if (state.currentView === 'project') {
        contentHtml = await renderProjectWorkspace(state.activeProblemId);
      }
      mainEl.innerHTML = contentHtml;
    } catch (err) {
      mainEl.innerHTML = `
        <div class="p-6 bg-red-50 text-red-900 rounded-2xl border border-red-200">
          <h3 class="font-bold text-sm">Failed to render view</h3>
          <p class="text-xs mt-1">${err.message}</p>
        </div>
      `;
    }

    // 3. Render Modal if active
    const modalEl = document.getElementById('modal-root');
    if (!modalEl) return;

    if (!state.activeDetailModal) {
      modalEl.innerHTML = '';
      return;
    }

    if (state.activeDetailModal === 'report-problem') {
      modalEl.innerHTML = renderReportModal();
    } else if (state.activeDetailModal === 'society-problem-detail') {
      const problem = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderSocietyProblemDetailModal(problem);
    } else if (state.activeDetailModal === 'form-team') {
      modalEl.innerHTML = await renderTeamModal(state.activeProblemId, this.teamFormationMode);
    } else if (state.activeDetailModal === 'feedback') {
      const prob = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderFeedbackModal(prob);
    } else if (state.activeDetailModal === 'escalation') {
      const prob = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderEscalationModal(prob);
    } else if (state.activeDetailModal === 'escalation-ticket-detail') {
      const ticket = await api.getEscalationTicket(state.activeTicketId);
      modalEl.innerHTML = renderEscalationTicketDetailModal(ticket);
    } else if (state.activeDetailModal === 'ticket-attachment') {
      const ticket = await api.getEscalationTicket(state.activeTicketId);
      modalEl.innerHTML = renderTicketAttachmentModal(ticket, this.ticketAttachmentType);
    } else if (state.activeDetailModal === 'hackathon-demo') {
      modalEl.innerHTML = renderHackathonDemoModal(demoController);
    } else if (state.activeDetailModal === 'citizen-offer') {
      const prob = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderCitizenOfferModal(prob);
    } else if (state.activeDetailModal === 'university-contribution') {
      const prob = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderUniversityContributionModal(prob, state.activeStudent, state.activeUniversity);
    } else if (state.activeDetailModal === 'university-support') {
      const support = await api.getUniversitySupport(state.activeProblemId);
      modalEl.innerHTML = renderUniversitySupportModal(support);
    } else if (state.activeDetailModal === 'industry-contribution') {
      const prob = await api.getProblemDetail(state.activeProblemId);
      modalEl.innerHTML = renderIndustryContributionModal(prob, state.activeIndustry);
    } else if (state.activeDetailModal === 'industry-support') {
      const support = await api.getIndustrySupport(state.activeProblemId);
      modalEl.innerHTML = renderIndustrySupportModal(support);
    }
  }

  // ---------- Navigation & Modal Handlers ----------
  setView(viewName) {
    state.setView(viewName);
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    const button = document.getElementById('mobile-menu-button');
    if (!menu || !button) return;
    const willOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
    button.textContent = willOpen ? '✕' : '☰';
  }

  closeMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    const button = document.getElementById('mobile-menu-button');
    menu?.classList.add('hidden');
    if (button) {
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '☰';
    }
  }

  mobileNavigate(viewName) {
    this.closeMobileMenu();
    this.setView(viewName);
  }

  openProblemDetail(problemId) {
    state.activeProblemId = problemId;
    state.setView('project');
  }

  openReportModal() {
    this.clearEvidenceSelection();
    state.setModal('report-problem');
  }

  openSocietyProblemDetail(problemId) {
    state.setModal('society-problem-detail', problemId);
  }

  openTeamModal(problemId, mode = 'COMBINED') {
    this.teamFormationMode = mode;
    state.setModal('form-team', problemId);
  }

  openUniversityContributionModal(problemId) {
    state.setModal('university-contribution', problemId);
  }

  openUniversitySupport(problemId) {
    state.setModal('university-support', problemId);
  }

  openIndustryContributionModal(problemId) {
    state.setModal('industry-contribution', problemId);
  }

  openIndustrySupport(problemId) {
    state.setModal('industry-support', problemId);
  }

  async resetTeams() {
    const button = document.getElementById('reset-teams-button');
    if (button) {
      button.disabled = true;
      button.textContent = 'RESETTING TEAMS...';
    }
    try {
      const result = await api.resetOfficialTeams();
      state.toast(`${result.reset_count} team assignment(s) reset to No Team.`, 'success');
      state.notify();
    } catch (err) {
      state.toast(err.message || 'Teams could not be reset.', 'error');
      if (button) {
        button.disabled = false;
        button.textContent = '↻ RESET TEAMS';
      }
    }
  }

  openFeedbackModal(problemId) {
    state.setModal('feedback', problemId);
  }

  openEscalationModal(problemId) {
    this.clearTicketEvidenceSelection();
    state.setModal('escalation', problemId);
  }

  openEscalationTicketDetail(ticketId) {
    state.activeTicketId = ticketId;
    state.setModal('escalation-ticket-detail');
  }

  openTicketAttachmentModal(ticketId, attachmentType) {
    this.clearTicketAttachmentSelection();
    this.ticketAttachmentType = attachmentType;
    state.activeTicketId = ticketId;
    state.setModal('ticket-attachment');
  }

  openCitizenOfferModal(problemId) {
    state.setModal('citizen-offer', problemId);
  }

  closeModal() {
    this.clearEvidenceSelection();
    this.clearTicketEvidenceSelection();
    this.clearTicketAttachmentSelection();
    state.closeModal();
  }

  clearEvidenceSelection() {
    if (this.evidencePreviewUrl) {
      URL.revokeObjectURL(this.evidencePreviewUrl);
    }
    this.selectedEvidenceFile = null;
    this.evidencePreviewUrl = null;
    this.isSubmittingProblem = false;
  }

  clearTicketEvidenceSelection() {
    if (this.ticketEvidencePreviewUrl) {
      URL.revokeObjectURL(this.ticketEvidencePreviewUrl);
    }
    this.ticketEvidenceFile = null;
    this.ticketEvidencePreviewUrl = null;
    this.isSubmittingTicket = false;
  }

  clearTicketAttachmentSelection() {
    if (this.ticketAttachmentPreviewUrl) {
      URL.revokeObjectURL(this.ticketAttachmentPreviewUrl);
    }
    this.selectedTicketAttachmentFile = null;
    this.ticketAttachmentPreviewUrl = null;
    this.isSubmittingTicketAttachment = false;
  }

  // ---------- Demo Preset Helper ----------
  fillDemoWaterProblem() {
    const titleEl = document.getElementById('prb-title');
    const descEl = document.getElementById('prb-desc');
    const catEl = document.getElementById('prb-category');
    const wardEl = document.getElementById('prb-ward');
    const locEl = document.getElementById('prb-location');
    const peopleEl = document.getElementById('prb-people');
    const freqEl = document.getElementById('prb-frequency');

    if (titleEl) titleEl.value = "Recurring water leakage is causing major water loss and street cavity in our community";
    if (descEl) descEl.value = "Underground municipal water main pipeline has cracked beneath pavement on 4th Cross Road. Gushing water flooded society entrances, caused pressure drop in 12 residential buildings, and created sinkhole risk for school buses.";
    if (catEl) catEl.value = "Water Management";
    if (wardEl) wardEl.value = "K/W";
    if (locEl) locEl.value = "Near 4th Cross Road & Junction, Lokhandwala Complex, Andheri West";
    if (peopleEl) peopleEl.value = "3200";
    if (freqEl) freqEl.value = "Daily Continuous";

    state.toast("Loaded verified water leakage scenario for Lokhandwala Complex (Ward K/W)", "info");
  }

  // ---------- AI Pre-Scan Handler ----------
  async runLiveAIPreScan() {
    const title = document.getElementById('prb-title')?.value || "Underground pipe bursting";
    const desc = document.getElementById('prb-desc')?.value || "Gushing water, severe road cavity risk";
    const category = document.getElementById('prb-category')?.value || "Water Management";
    const ward = document.getElementById('prb-ward')?.value || "K/W";
    const people = parseInt(document.getElementById('prb-people')?.value || "1000", 10);
    const frequency = document.getElementById('prb-frequency')?.value || "Daily Continuous";

    const container = document.getElementById('ai-prescan-result');
    if (container) {
      container.classList.remove('hidden');
      container.innerHTML = `
        <div class="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3">
          <div class="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-mono">Running structured AI intelligence pipeline...</span>
        </div>
      `;
    }

    const aiRes = await api.analyzeDraft({
      title,
      description: desc,
      initial_category: category,
      ward,
      people_affected: people,
      frequency
    });

    if (container) {
      container.innerHTML = renderAIIntelligencePanel(aiRes);
    }
  }

  // ---------- Evidence Image Selection ----------
  setEvidenceError(message = '') {
    const errorEl = document.getElementById('prb-evidence-error');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', !message);
  }

  handleEvidenceSelected(event) {
    const input = event.target;
    const file = input.files?.[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    this.setEvidenceError('');
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      input.value = '';
      this.setEvidenceError('Unsupported image type. Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > maxSize) {
      input.value = '';
      this.setEvidenceError('Image must be smaller than 5 MB.');
      return;
    }
    if (file.size === 0) {
      input.value = '';
      this.setEvidenceError('The selected image is empty. Please choose another image.');
      return;
    }

    if (this.evidencePreviewUrl) {
      URL.revokeObjectURL(this.evidencePreviewUrl);
    }
    this.selectedEvidenceFile = file;
    this.evidencePreviewUrl = URL.createObjectURL(file);

    const emptyEl = document.getElementById('prb-evidence-empty');
    const previewWrap = document.getElementById('prb-evidence-preview-wrap');
    const preview = document.getElementById('prb-evidence-preview');
    const nameEl = document.getElementById('prb-evidence-name');
    emptyEl?.classList.add('hidden');
    previewWrap?.classList.remove('hidden');
    if (preview) preview.src = this.evidencePreviewUrl;
    if (nameEl) nameEl.textContent = file.name;
  }

  removeEvidenceImage() {
    if (this.evidencePreviewUrl) {
      URL.revokeObjectURL(this.evidencePreviewUrl);
    }
    this.selectedEvidenceFile = null;
    this.evidencePreviewUrl = null;

    const input = document.getElementById('prb-evidence');
    const emptyEl = document.getElementById('prb-evidence-empty');
    const previewWrap = document.getElementById('prb-evidence-preview-wrap');
    const preview = document.getElementById('prb-evidence-preview');
    if (input) input.value = '';
    if (preview) preview.src = '';
    emptyEl?.classList.remove('hidden');
    previewWrap?.classList.add('hidden');
    this.setEvidenceError('');
  }

  // ---------- Problem Submission ----------
  async handleProblemSubmit(event) {
    event.preventDefault();
    if (this.isSubmittingProblem) return;

    const soc = state.activeSociety;
    const submitButton = document.getElementById('report-submit-button');
    const submitLabel = document.getElementById('report-submit-label');
    const statusEl = document.getElementById('report-submit-status');

    this.isSubmittingProblem = true;
    if (submitButton) submitButton.disabled = true;
    if (statusEl) {
      statusEl.classList.remove('hidden', 'text-[#C62828]');
      statusEl.classList.add('text-[#147D86]');
      statusEl.textContent = this.selectedEvidenceFile ? 'Uploading image...' : 'Registering problem...';
    }
    if (submitLabel) submitLabel.textContent = 'Please wait...';

    try {
      let evidenceImage = null;
      if (this.selectedEvidenceFile) {
        const uploadResult = await api.uploadEvidence(this.selectedEvidenceFile);
        evidenceImage = uploadResult.image_url;
        if (statusEl) statusEl.textContent = 'Image uploaded. Running AI analysis...';
      }

      const payload = {
        title: document.getElementById('prb-title').value,
        description: document.getElementById('prb-desc').value,
        society_id: soc.id,
        society_name: soc.name,
        initial_category: document.getElementById('prb-category').value,
        location: document.getElementById('prb-location').value,
        ward: document.getElementById('prb-ward').value,
        people_affected: parseInt(document.getElementById('prb-people').value, 10),
        frequency: document.getElementById('prb-frequency').value,
        evidence_image: evidenceImage,
        additional_notes: document.getElementById('prb-notes')?.value || null
      };

      const res = await api.createProblem(payload);
      state.toast(`Problem ${res.problem_id} registered! Dispatched to ${res.ai_analysis.recommended_solver}`, "success");
      this.clearEvidenceSelection();
      state.closeModal();
      state.setView('society');
    } catch (err) {
      if (statusEl) {
        statusEl.classList.remove('text-[#147D86]');
        statusEl.classList.add('text-[#C62828]');
        statusEl.textContent = err.message || 'Could not submit the report. Please try again.';
      }
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Submit & Register Problem →';
      this.isSubmittingProblem = false;
    }
  }

  // ---------- Solver Help Request Acceptance ----------
  async respondToHelpRequest(problemId, action, solverName, officerName) {
    const prob = await api.getProblemDetail(problemId);
    const hr = (prob.help_requests || [])[0];
    const hrId = hr ? hr.id : `HR-${problemId.slice(-3)}-01`;

    await api.respondHelpRequest(hrId, {
      action,
      solver_id: 'SOLV-01',
      solver_name: solverName,
      officer_name: officerName
    });

    state.toast(action === 'accept' ? `Help Accepted! Expected support window: 24–48 hours.` : `Action recorded.`, "success");
    state.notify();
  }

  // ---------- Team Formation Submit ----------
  async handleTeamSubmit(event, problemId, mode = 'COMBINED') {
    event.preventDefault();

    const m1_name = document.getElementById('tm-m1-name').value;
    const m1_org = document.getElementById('tm-m1-org').value;
    const m1_role = document.getElementById('tm-m1-role').value;

    const members = [
      { role: m1_role, organization: m1_org, name: m1_name, expertise: "Jurisdiction & Excavation" }
    ];

    if (mode !== 'WORK_ALONE') {
      const m2_name = document.getElementById('tm-m2-name').value;
      const m2_org = document.getElementById('tm-m2-org').value;
      const m2_role = document.getElementById('tm-m2-role').value;
      const m3_raw = document.getElementById('tm-m3-student').value.split('|');
      const m4_raw = document.getElementById('tm-m4-student').value.split('|');
      const m5_name = document.getElementById('tm-m5-name').value;
      const m5_org = document.getElementById('tm-m5-org').value;
      const m5_role = document.getElementById('tm-m5-role').value;
      members.push(
        { role: m2_role, organization: m2_org, name: m2_name, expertise: "Acoustic Diagnostics & Flow Dynamics" },
        { role: "Student Lead Researcher", organization: "Demo Tech University", name: m3_raw[0], expertise: m3_raw[2] || "GIS & Sensors" },
        { role: "Student Associate Engineer", organization: "Demo Tech University", name: m4_raw[0], expertise: m4_raw[2] || "EPANET Hydraulics" },
        { role: m5_role, organization: m5_org, name: m5_name, expertise: "LPWAN Telemetry Hardware" }
      );
    }

    await api.formOfficialTeam({
      problem_id: problemId,
      created_by_solver: m1_org,
      team_title: document.getElementById('tm-title').value,
      members,
      mode
    });

    state.toast(
      mode === 'WORK_ALONE'
        ? "BMC Direct Implementation mobilized successfully!"
        : "Official multidisciplinary team created by verified solver!",
      "success"
    );
    state.closeModal();
    state.openProblemDetail(problemId);
  }

  // ---------- Advance Stage ----------
  async advanceProjectStage(problemId, nextStageNum) {
    const stageNames = [
      "Verification", "Solver Accepted", "Team Formed", "Assessment",
      "Solution Design", "Prototype", "Field Testing", "Implementation",
      "Monitoring", "Solved"
    ];
    const name = stageNames[nextStageNum - 1];
    const progress = nextStageNum * 10;

    await api.updateProjectStage(problemId, {
      stage_id: nextStageNum,
      stage_name: name,
      progress_percent: progress,
      latest_update: `Stage ${nextStageNum} (${name}) accomplished by official taskforce.`,
      next_milestone: nextStageNum === 10 ? "Project Solved & Community Feedback Audit" : `Stage ${nextStageNum + 1} deliverables`
    });

    state.toast(`Project advanced to Stage ${nextStageNum}: ${name} (${progress}%)`, "success");
    state.notify();
  }

  // ---------- Role-Specific Voting ----------
  async castCitizenVote(problemId) {
    const button = document.getElementById(`vote-btn-${problemId}`);
    if (button) button.disabled = true;
    try {
      const result = await api.voteProblem(problemId, {
        citizen_id: state.activeCitizen.id,
        citizen_name: state.activeCitizen.name,
        society_id: state.activeCitizen.society_id
      });
      const counter = document.getElementById(`votes-counter-${problemId}`);
      if (counter) counter.textContent = `${Number(result.community_votes).toLocaleString()} Votes`;
      state.toast('Citizen vote recorded. One vote per citizen is enforced.', 'success');
      state.notify();
    } catch (err) {
      if (button) button.disabled = false;
      state.toast(err.message || 'Could not record your vote.', 'error');
    }
  }

  async castHelpVote(problemId, voterType) {
    const isStudent = voterType === 'StudentUniversity';
    if (isStudent) {
      this.openUniversityContributionModal(problemId);
      return;
    }
    this.openIndustryContributionModal(problemId);
  }

  async handleUniversityContributionSubmit(event, problemId) {
    event.preventDefault();
    if (this.isSubmittingUniversityContribution) return;

    const textarea = document.getElementById('university-contribution');
    const button = document.getElementById('university-contribution-submit');
    const error = document.getElementById('university-contribution-error');
    const contribution = textarea?.value.trim() || '';
    if (contribution.length < 10) {
      if (error) {
        error.textContent = 'Please provide at least 10 characters describing your contribution.';
        error.classList.remove('hidden');
      }
      return;
    }

    this.isSubmittingUniversityContribution = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitting Contribution...';
    }
    if (error) error.classList.add('hidden');

    try {
      const result = await api.voteToHelp(problemId, {
        voter_type: 'StudentUniversity',
        voter_id: state.activeStudent.id,
        voter_name: state.activeStudent.name,
        organization_id: state.activeStudent.university_id,
        organization_name: state.activeUniversity.name,
        contribution
      });
      this.isSubmittingUniversityContribution = false;
      state.closeModal();
      state.toast('Vote to Help recorded. The reporting society and BMC can now see your contribution.', 'success');
      state.notify();
    } catch (err) {
      this.isSubmittingUniversityContribution = false;
      if (button) {
        button.disabled = false;
        button.textContent = 'Submit Contribution';
      }
      if (error) {
        error.textContent = err.message || 'Could not submit your contribution.';
        error.classList.remove('hidden');
      }
    }
  }

  async handleIndustryContributionSubmit(event, problemId) {
    event.preventDefault();
    if (this.isSubmittingIndustryContribution) return;

    const textarea = document.getElementById('industry-contribution');
    const button = document.getElementById('industry-contribution-submit');
    const error = document.getElementById('industry-contribution-error');
    const contribution = textarea?.value.trim() || '';
    if (contribution.length < 10) {
      if (error) {
        error.textContent = 'Please provide at least 10 characters describing your contribution.';
        error.classList.remove('hidden');
      }
      return;
    }

    this.isSubmittingIndustryContribution = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitting Contribution...';
    }
    if (error) error.classList.add('hidden');

    try {
      const result = await api.voteToHelp(problemId, {
        voter_type: 'IndustryStartup',
        voter_id: state.activeIndustry.id,
        voter_name: state.activeIndustry.name,
        organization_id: state.activeIndustry.id,
        organization_name: state.activeIndustry.name,
        contribution
      });
      this.isSubmittingIndustryContribution = false;
      state.closeModal();
      state.toast('Vote to Help recorded. Your contribution was sent to the BMC Municipal Solver.', 'success');
      state.notify();
    } catch (err) {
      this.isSubmittingIndustryContribution = false;
      if (button) {
        button.disabled = false;
        button.textContent = 'Submit Contribution';
      }
      if (error) {
        error.textContent = err.message || 'Could not submit your contribution.';
        error.classList.remove('hidden');
      }
    }
  }

  // ---------- Citizen Offer Submit ----------
  async handleCitizenOfferSubmit(event, problemId) {
    event.preventDefault();
    await api.submitCitizenOffer({
      problem_id: problemId,
      citizen_name: document.getElementById('cso-name').value,
      contact_email: document.getElementById('cso-email').value,
      support_type: document.getElementById('cso-type').value,
      description: document.getElementById('cso-desc').value
    });

    state.toast("Voluntary citizen support offer submitted to official solver team!", "success");
    state.closeModal();
    state.notify();
  }

  // ---------- Feedback Submit ----------
  async handleFeedbackSubmit(event, problemId) {
    event.preventDefault();
    const solvedChoice = document.querySelector('input[name="fb-solved-choice"]:checked')?.value || 'YES';

    await api.submitFeedback({
      problem_id: problemId,
      submitted_by_type: document.getElementById('fb-submitter-type').value,
      submitter_name: document.getElementById('fb-submitter-name').value,
      satisfaction_stars: parseInt(document.getElementById('fb-stars').value, 10),
      problem_actually_solved: solvedChoice,
      rating_speed: parseInt(document.getElementById('fb-speed').value, 10),
      rating_communication: parseInt(document.getElementById('fb-comm').value, 10),
      rating_quality: parseInt(document.getElementById('fb-quality').value, 10),
      rating_helpfulness: parseInt(document.getElementById('fb-helpfulness').value, 10),
      improvement_suggestions: document.getElementById('fb-improvements')?.value || null
    });

    state.toast("Thank you! Your solution rating and feedback has been posted.", "success");
    state.closeModal();
    state.notify();
  }

  // ---------- Responsible Team Ticket Response ----------
  setTicketAttachmentError(message = '') {
    const error = document.getElementById('ticket-attachment-error');
    if (!error) return;
    error.textContent = message;
    error.classList.toggle('hidden', !message);
  }

  handleTicketAttachmentSelected(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const isReport = this.ticketAttachmentType === 'progress_report';
    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    const reportTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = isReport ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

    this.setTicketAttachmentError('');
    if (file.size === 0) {
      input.value = '';
      this.setTicketAttachmentError('The selected file is empty.');
      return;
    }
    if (file.size > maxSize) {
      input.value = '';
      this.setTicketAttachmentError(`File must be smaller than ${isReport ? '10 MB' : '5 MB'}.`);
      return;
    }
    if (isReport && (!reportTypes[extension] || reportTypes[extension] !== file.type)) {
      input.value = '';
      this.setTicketAttachmentError('Progress reports must be PDF, DOC, or DOCX files.');
      return;
    }
    if (!isReport && (!imageTypes.includes(file.type) || !['.jpg', '.jpeg', '.png', '.webp'].includes(extension))) {
      input.value = '';
      this.setTicketAttachmentError('Field evidence must be a JPG, PNG, or WEBP image.');
      return;
    }

    if (this.ticketAttachmentPreviewUrl) URL.revokeObjectURL(this.ticketAttachmentPreviewUrl);
    this.selectedTicketAttachmentFile = file;
    if (!isReport) this.ticketAttachmentPreviewUrl = URL.createObjectURL(file);

    document.getElementById('ticket-attachment-empty')?.classList.add('hidden');
    document.getElementById('ticket-attachment-selected')?.classList.remove('hidden');
    const name = document.getElementById('ticket-attachment-name');
    const preview = document.getElementById('ticket-attachment-preview');
    const submit = document.getElementById('ticket-attachment-submit');
    if (name) name.textContent = `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    if (preview) preview.src = this.ticketAttachmentPreviewUrl;
    if (submit) submit.disabled = false;
  }

  removeTicketAttachment() {
    if (this.ticketAttachmentPreviewUrl) URL.revokeObjectURL(this.ticketAttachmentPreviewUrl);
    this.selectedTicketAttachmentFile = null;
    this.ticketAttachmentPreviewUrl = null;
    const input = document.getElementById('ticket-attachment-file');
    const preview = document.getElementById('ticket-attachment-preview');
    const submit = document.getElementById('ticket-attachment-submit');
    if (input) input.value = '';
    if (preview) preview.src = '';
    if (submit) submit.disabled = true;
    document.getElementById('ticket-attachment-empty')?.classList.remove('hidden');
    document.getElementById('ticket-attachment-selected')?.classList.add('hidden');
    this.setTicketAttachmentError('');
  }

  async handleTicketAttachmentSubmit(event) {
    event.preventDefault();
    if (!this.selectedTicketAttachmentFile || this.isSubmittingTicketAttachment) return;

    const button = document.getElementById('ticket-attachment-submit');
    const label = document.getElementById('ticket-attachment-submit-label');
    const status = document.getElementById('ticket-attachment-status');
    this.isSubmittingTicketAttachment = true;
    if (button) button.disabled = true;
    if (label) label.textContent = 'Uploading...';
    if (status) {
      status.classList.remove('hidden');
      status.textContent = 'Uploading and validating file...';
    }

    try {
      const result = await api.uploadTicketAttachment(
        state.activeTicketId,
        this.ticketAttachmentType,
        state.activeBmc.name,
        this.selectedTicketAttachmentFile
      );
      state.toast(result.message, 'success');
      this.clearTicketAttachmentSelection();
      state.closeModal();
      state.notify();
    } catch (err) {
      if (status) {
        status.classList.remove('text-[#147D86]');
        status.classList.add('text-[#C62828]');
        status.textContent = err.message || 'Upload failed. Please try again.';
      }
      if (button) button.disabled = false;
      if (label) label.textContent = this.ticketAttachmentType === 'progress_report' ? 'Submit Progress Report' : 'Upload Field Evidence';
      this.isSubmittingTicketAttachment = false;
    }
  }

  async handleTeamTicketAction(ticketId, teamName, actionTaken) {
    const defaults = {
      acknowledge: 'Ticket acknowledged. The responsible team has started reviewing the incomplete work.',
      submit_progress: 'Enter the current progress update and remaining work:',
      upload_evidence: 'Enter a description of the new field evidence submitted:',
      mark_completed: 'Enter the completion report, work performed, and verification details:'
    };
    let responseText = defaults[actionTaken] || 'Team response submitted.';
    if (actionTaken !== 'acknowledge') {
      responseText = window.prompt(defaults[actionTaken], '')?.trim();
      if (!responseText) return;
    }

    try {
      await api.submitTeamResponse(ticketId, {
        team_name: teamName,
        response_text: responseText,
        evidence_url: null,
        action_taken: actionTaken
      });
      state.toast(
        actionTaken === 'mark_completed'
          ? 'Completion report submitted. Automatic escalation is paused for review.'
          : 'Team response recorded on the ticket.',
        'success'
      );
      state.notify();
    } catch (err) {
      state.toast(err.message || 'Could not submit the team response.', 'error');
    }
  }

  // ---------- Escalation Submit ----------
  setTicketEvidenceError(message = '') {
    const errorEl = document.getElementById('esc-evidence-error');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', !message);
  }

  handleTicketEvidenceSelected(event) {
    const input = event.target;
    const file = input.files?.[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    this.setTicketEvidenceError('');
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      input.value = '';
      this.setTicketEvidenceError('Unsupported image type. Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > maxSize) {
      input.value = '';
      this.setTicketEvidenceError('Image must be smaller than 5 MB.');
      return;
    }
    if (file.size === 0) {
      input.value = '';
      this.setTicketEvidenceError('The selected image is empty. Please choose another image.');
      return;
    }

    if (this.ticketEvidencePreviewUrl) URL.revokeObjectURL(this.ticketEvidencePreviewUrl);
    this.ticketEvidenceFile = file;
    this.ticketEvidencePreviewUrl = URL.createObjectURL(file);

    document.getElementById('esc-evidence-empty')?.classList.add('hidden');
    document.getElementById('esc-evidence-preview-wrap')?.classList.remove('hidden');
    const preview = document.getElementById('esc-evidence-preview');
    const name = document.getElementById('esc-evidence-name');
    if (preview) preview.src = this.ticketEvidencePreviewUrl;
    if (name) name.textContent = file.name;
  }

  removeTicketEvidence() {
    if (this.ticketEvidencePreviewUrl) URL.revokeObjectURL(this.ticketEvidencePreviewUrl);
    this.ticketEvidenceFile = null;
    this.ticketEvidencePreviewUrl = null;
    const input = document.getElementById('esc-evidence');
    const preview = document.getElementById('esc-evidence-preview');
    if (input) input.value = '';
    if (preview) preview.src = '';
    document.getElementById('esc-evidence-empty')?.classList.remove('hidden');
    document.getElementById('esc-evidence-preview-wrap')?.classList.add('hidden');
    this.setTicketEvidenceError('');
  }

  async handleEscalationSubmit(event, problemId) {
    event.preventDefault();
    if (this.isSubmittingTicket) return;

    const button = document.getElementById('ticket-submit-button');
    const label = document.getElementById('ticket-submit-label');
    const status = document.getElementById('ticket-submit-status');
    this.isSubmittingTicket = true;
    if (button) button.disabled = true;
    if (label) label.textContent = 'Please wait...';
    if (status) {
      status.classList.remove('hidden');
      status.textContent = this.ticketEvidenceFile ? 'Uploading ticket evidence...' : 'Creating Level 1 ticket...';
    }

    try {
      let evidence = null;
      if (this.ticketEvidenceFile) {
        const uploaded = await api.uploadEvidence(this.ticketEvidenceFile);
        evidence = uploaded.image_url;
        if (status) status.textContent = 'Evidence uploaded. Creating ticket...';
      }

      const res = await api.createEscalation({
        problem_id: problemId,
        society_name: state.activeSociety.name,
        reason: document.getElementById('esc-reason').value,
        previous_solver: "Assigned Solver Consortium",
        current_status: "Unresolved",
        what_remains_unresolved: document.getElementById('esc-unresolved').value,
        evidence,
        additional_notes: document.getElementById('esc-notes')?.value || null
      });

      state.toast(res.message, "warning");
      this.clearTicketEvidenceSelection();
      state.closeModal();
      state.setView('society');
    } catch (err) {
      if (status) status.textContent = err.message || 'Could not create the ticket. Please try again.';
      if (button) button.disabled = false;
      if (label) label.textContent = 'Create Level 1 Ticket';
      this.isSubmittingTicket = false;
    }
  }

  // ---------- Admin Escalation Action ----------
  async advanceAdminEscalation(ticketId, newLevel) {
    await api.advanceEscalation(ticketId, newLevel, `Admin action: elevated case to Level ${newLevel}`);
    state.toast(`Ticket elevated to Level ${newLevel}`, "info");
    state.notify();
  }

  // ---------- Live Guided Demo Controller ----------
  startGuidedDemo() {
    demoController.start();
  }

  demoAction(action, value = null) {
    const actions = {
      selectProblem: () => demoController.selectProblem(Number(value)),
      population: () => demoController.setPopulation(Number(value)),
      votes: () => demoController.setVotes(Number(value)),
      teamStep: () => demoController.goToTeamFormation(),
      team: () => demoController.selectTeam(value),
      outcome: () => demoController.chooseOutcome(value),
      ticketLevel: () => demoController.selectTicketLevel(Number(value)),
      replacement: () => demoController.formReplacementTeam(),
      reset: () => demoController.reset(),
      back: () => demoController.back(),
      close: () => demoController.close()
    };
    actions[action]?.();
  }
}

window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());
