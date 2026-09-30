/**
 * AAPKE LOG - Isolated Judge-Facing Hackathon Simulation
 * All state is in memory. It never calls the API or mutates application data.
 */

import { state } from './state.js';

const PROBLEMS = [
  {
    id: 'DEMO-ROAD-01',
    title: 'Dangerous potholes blocking the school-bus route',
    description: 'Deep potholes and broken asphalt are forcing school buses and ambulances into oncoming traffic near the society entrance.',
    category: 'Roads', ward: 'K/W', location: '4th Cross Road, Lokhandwala Complex', people_affected: 1200,
    icon: '🛣️'
  },
  {
    id: 'DEMO-WATER-02',
    title: 'Recurring water-main leakage flooding society access',
    description: 'A high-pressure municipal pipeline leak is flooding entrances, reducing water pressure, and creating pavement-collapse risk.',
    category: 'Water Management', ward: 'K/W', location: 'Lokhandwala Main Junction', people_affected: 3200,
    icon: '💧'
  },
  {
    id: 'DEMO-WASTE-03',
    title: 'Garbage accumulation beside the residential market',
    description: 'Mixed waste has remained uncollected, blocking pedestrians and creating odor, pests, and public-health concerns.',
    category: 'Solid Waste Management', ward: 'K/W', location: 'Community Market Lane', people_affected: 850,
    icon: '♻️'
  },
  {
    id: 'DEMO-DRAIN-04',
    title: 'Blocked storm drain causing monsoon waterlogging',
    description: 'A clogged storm-water drain is causing repeated waterlogging around ground-floor homes and the pedestrian crossing.',
    category: 'Drainage', ward: 'K/W', location: 'Junction near Society Gate 2', people_affected: 1700,
    icon: '🌧️'
  }
];

const TEAMS = {
  bmc: {
    mode: 'WORK_ALONE', title: 'BMC Direct Implementation Unit', icon: '🏛️',
    description: 'Municipal engineering team executes directly with no external partner.',
    members: ['BMC Municipal Engineering Lead', 'Ward Field Supervisor', 'Safety & Traffic Coordinator']
  },
  university: {
    mode: 'UNIVERSITY', title: 'BMC + University Research Team', icon: '🎓',
    description: 'Municipal authority leads with faculty and student research support.',
    members: ['BMC Municipal Lead', 'University Faculty Mentor', 'Two Student Researchers']
  },
  industry: {
    mode: 'INDUSTRY', title: 'BMC + Industry Delivery Team', icon: '🏭',
    description: 'Municipal authority leads with specialist technology and equipment support.',
    members: ['BMC Municipal Lead', 'Industry Technology Specialist', 'Field Equipment Operator']
  },
  combined: {
    mode: 'COMBINED', title: 'Official Multidisciplinary Taskforce', icon: '🤝',
    description: 'BMC, university researchers, students, and industry specialists collaborate.',
    members: ['BMC Municipal Lead', 'University Faculty Mentor', 'Student Engineers', 'Industry Technology Specialist']
  }
};

export const demoController = {
  problems: PROBLEMS,
  teams: TEAMS,
  step: 1,
  selectedProblem: null,
  population: 500,
  votes: 300,
  selectedTeam: null,
  ticketLevel: null,
  outcome: null,
  replacementMode: false,

  get affectedPercentage() {
    return this.population > 0 ? Math.round((this.votes / this.population) * 100) : 0;
  },

  start() {
    this.reset(false);
    document.getElementById('demo-guide-bar')?.remove();
    state.setModal('hackathon-demo');
  },

  close() {
    state.closeModal();
  },

  reset(notify = true) {
    this.step = 1;
    this.selectedProblem = null;
    this.population = 500;
    this.votes = 300;
    this.selectedTeam = null;
    this.ticketLevel = null;
    this.outcome = null;
    this.replacementMode = false;
    if (notify) state.notify();
  },

  selectProblem(index) {
    this.selectedProblem = this.problems[index];
    this.step = 2;
    state.notify();
  },

  setPopulation(value) {
    this.population = Number(value);
    state.notify();
  },

  setVotes(value) {
    this.votes = Number(value);
    state.notify();
  },

  goToTeamFormation() {
    this.step = 3;
    state.notify();
  },

  selectTeam(key) {
    this.selectedTeam = this.teams[key];
    this.ticketLevel = null;
    if (this.replacementMode) {
      this.outcome = 'replacement';
      this.step = 5;
    } else {
      this.step = 4;
    }
    state.notify();
  },

  chooseOutcome(outcome) {
    if (outcome === 'solved') {
      this.outcome = 'solved';
      this.step = 5;
    } else {
      this.outcome = 'ticket';
      this.ticketLevel = 1;
    }
    state.notify();
  },

  selectTicketLevel(level) {
    this.outcome = 'ticket';
    this.ticketLevel = Number(level);
    state.notify();
  },

  formReplacementTeam() {
    this.replacementMode = true;
    this.selectedTeam = null;
    this.step = 3;
    state.notify();
  },

  back() {
    if (this.step === 5) {
      this.step = this.replacementMode ? 3 : 4;
    } else if (this.step > 1) {
      this.step -= 1;
    }
    state.notify();
  }
};
