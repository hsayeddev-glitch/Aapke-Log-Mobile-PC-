/**
 * AAPKE LOG - API Client
 * Connects frontend views with the FastAPI backend.
 */

const API_BASE = '/api';

export const api = {
  async getReferenceData() {
    const res = await fetch(`${API_BASE}/reference-data`);
    return res.json();
  },

  async getSimulationData() {
    const res = await fetch(`${API_BASE}/simulation-data`);
    return res.json();
  },

  async getSimulationRecords(limit = 50, ward = null, category = null) {
    const params = new URLSearchParams({ limit });
    if (ward) params.append('ward', ward);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/simulation-records?${params}`);
    return res.json();
  },

  async getSocieties() {
    const res = await fetch(`${API_BASE}/societies`);
    return res.json();
  },

  async getSolvers(type = null) {
    const url = type ? `${API_BASE}/solvers?solver_type=${type}` : `${API_BASE}/solvers`;
    const res = await fetch(url);
    return res.json();
  },

  async getStudents(universityId = null) {
    const url = universityId ? `${API_BASE}/students?university_id=${universityId}` : `${API_BASE}/students`;
    const res = await fetch(url);
    return res.json();
  },

  async getFaculty(universityId = null) {
    const url = universityId ? `${API_BASE}/faculty?university_id=${universityId}` : `${API_BASE}/faculty`;
    const res = await fetch(url);
    return res.json();
  },

  async getProblems(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val && val !== 'All') params.append(key, val);
    }
    const res = await fetch(`${API_BASE}/problems?${params}`);
    return res.json();
  },

  async getProblemDetail(problemId) {
    const res = await fetch(`${API_BASE}/problems/${problemId}`);
    return res.json();
  },

  async analyzeDraft(draftData) {
    const res = await fetch(`${API_BASE}/problems/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftData)
    });
    return res.json();
  },

  async uploadEvidence(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload-evidence`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Image upload failed. Please try again.');
    }
    return data;
  },

  async createProblem(problemData) {
    const res = await fetch(`${API_BASE}/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Problem creation failed');
    }
    return res.json();
  },

  async respondHelpRequest(helpRequestId, actionData) {
    const res = await fetch(`${API_BASE}/help-requests/${helpRequestId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    return res.json();
  },

  async formOfficialTeam(teamData) {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Official team could not be formed.');
    return data;
  },

  async resetOfficialTeams() {
    const res = await fetch(`${API_BASE}/teams/reset`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Teams could not be reset.');
    return data;
  },

  async updateProjectStage(problemId, stageData) {
    const res = await fetch(`${API_BASE}/projects/${problemId}/update-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return res.json();
  },

  async submitCitizenOffer(offerData) {
    const res = await fetch(`${API_BASE}/citizen-offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    });
    return res.json();
  },

  async submitFeedback(feedbackData) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  async createEscalation(escalationData) {
    const res = await fetch(`${API_BASE}/escalations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(escalationData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Ticket creation failed. Please try again.');
    }
    return data;
  },

  async getEscalationTicket(ticketId) {
    const res = await fetch(`${API_BASE}/escalations/${ticketId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Could not load the escalation ticket.');
    }
    return data;
  },

  async uploadTicketAttachment(ticketId, attachmentType, uploadedBy, file) {
    const formData = new FormData();
    formData.append('attachment_type', attachmentType);
    formData.append('uploaded_by', uploadedBy);
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/escalations/${ticketId}/attachments`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Could not upload the ticket attachment.');
    }
    return data;
  },

  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`);
    return res.json();
  },

  async advanceEscalation(ticketId, newLevel, adminNotes) {
    const res = await fetch(`${API_BASE}/admin/escalation/${ticketId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_level: newLevel, admin_notes: adminNotes })
    });
    return res.json();
  },

  async verifySociety(societyId) {
    const res = await fetch(`${API_BASE}/admin/verify-society/${societyId}`, {
      method: 'POST'
    });
    return res.json();
  },

  async voteProblem(problemId, voteData) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Could not record your citizen vote.');
    }
    return data;
  },

  async voteToHelp(problemId, voteData) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/help-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Could not record your Vote to Help.');
    }
    return data;
  },

  async getUniversitySupport(problemId) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/university-support`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'University support could not be loaded.');
    }
    return data;
  },

  async getIndustrySupport(problemId) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/industry-support`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Industry support could not be loaded.');
    }
    return data;
  },

  async getBmcIndustrySupportNotifications() {
    const res = await fetch(`${API_BASE}/bmc/industry-support-notifications`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Industry support notifications could not be loaded.');
    }
    return data;
  },

  async getMySocietyProblems(societyId, citizenId) {
    const url = citizenId 
      ? `${API_BASE}/citizen/my-society-problems?society_id=${societyId}&citizen_id=${citizenId}`
      : `${API_BASE}/citizen/my-society-problems?society_id=${societyId}`;
    const res = await fetch(url);
    return res.json();
  },

  async submitHelpOffer(offerData) {
    const res = await fetch(`${API_BASE}/help-offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    });
    return res.json();
  },

  async getHelpOffers(problemId) {
    const res = await fetch(`${API_BASE}/problems/${problemId}/help-offers`);
    return res.json();
  },

  async respondHelpOffer(offerId, actionData) {
    const res = await fetch(`${API_BASE}/help-offers/${offerId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    return res.json();
  },

  async submitTeamResponse(ticketId, responseData) {
    const res = await fetch(`${API_BASE}/escalations/${ticketId}/team-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Could not submit the team response.');
    }
    return data;
  },

  async replaceTeam(problemId, replacementData) {
    const res = await fetch(`${API_BASE}/admin/replace-team/${problemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replacementData)
    });
    return res.json();
  }
};
