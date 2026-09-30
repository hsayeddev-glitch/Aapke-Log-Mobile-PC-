/**
 * AAPKE LOG - Central State Store
 * Manages role switching, active user profiles, data caching, and notifications.
 */

export const state = {
  currentView: 'landing', // 'landing', 'society', 'bmc', 'university', 'industry', 'citizen', 'admin'
  
  // Current active identities for fast evaluation switching
  activeSociety: {
    id: "SOC-002",
    name: "Lokhandwala Residents Association",
    rep_name: "Sunita Kapoor",
    ward: "K/W",
    verified: true
  },
  
  activeBmc: {
    id: "BMC-001",
    name: "BMC Water Management — Prototype",
    lead_name: "Er. Arvind Patil (Chief Hydraulic Engineer)",
    ward_jurisdiction: "All 24 Wards",
    domain: "Water Supply & Hydraulics"
  },
  
  activeUniversity: {
    id: "UNI-001",
    name: "Demo Tech University Mumbai",
    dean: "Prof. R. K. Shrivastava",
    campus: "Matunga, Mumbai (Ward F/N)",
    specialties: ["Civil & Environmental Engineering", "IoT Sensor Networks"]
  },

  activeStudent: {
    id: "STU-001",
    name: "Aarav Sharma",
    university_id: "UNI-001",
    major: "B.Tech Civil Engineering",
    year: "4th Year"
  },

  activeIndustry: {
    id: "COM-001",
    name: "Demo IoT Solutions Pvt Ltd",
    lead: "Nikhil Agarwal (VP - Civic Solutions)",
    location: "MIDC Andheri East, Mumbai",
    domain: "Water Pipeline IoT, Acoustic Clamp Sensors"
  },

  activeCitizen: {
    id: "CIT-001",
    name: "Rahul Sharma",
    mobile: "+91 98201 98201",
    society_id: "SOC-002",
    society_name: "Lokhandwala Residents Association",
    ward: "K/W",
    member_id: "LRA-M-0142",
    verified: true
  },

  adminUser: {
    name: "BMC / City Command Admin",
    role: "System-Wide Oversight"
  },

  activeProblemId: null,
  activeTicketId: null,
  activeDetailModal: null, // Includes team, ticket, contribution, support-review, and report modals

  listeners: [],

  subscribe(callback) {
    this.listeners.push(callback);
  },

  notify() {
    this.listeners.forEach(cb => cb(this));
  },

  setView(newView) {
    this.currentView = newView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  },

  setModal(modalName, problemId = null) {
    this.activeDetailModal = modalName;
    if (problemId) this.activeProblemId = problemId;
    this.notify();
  },

  closeModal() {
    this.activeDetailModal = null;
    this.notify();
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-slate-900 text-white'
    };

    toast.className = `px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="text-base">${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};
