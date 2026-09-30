/**
 * AAPKE LOG - Solution Feedback Modal ("Rate the Solution")
 */

import { api } from '../api.js';
import { state } from '../state.js';

export function renderFeedbackModal(problem) {
  if (!problem) return '';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/20">
              Community Accountability
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-1">RATE THE SOLUTION</h2>
            <p class="text-xs text-slate-500 font-medium">Problem: ${problem.title} (${problem.id})</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <form id="feedback-form" onsubmit="window.app.handleFeedbackSubmit(event, '${problem.id}')" class="space-y-4 text-xs">
          <!-- Role selector -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Submitting As:</label>
            <select id="fb-submitter-type" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
              <option value="Society Representative">Verified Society Representative (${problem.society_name})</option>
              <option value="Community Citizen">Community Resident / Citizen (Ward ${problem.ward})</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Your Full Name:</label>
            <input type="text" id="fb-submitter-name" required value="Rajesh Merchant" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium">
          </div>

          <!-- Was Problem Actually Solved? -->
          <div class="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
            <label class="font-bold text-slate-900 block">Was the problem actually solved in reality?</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex items-center justify-center gap-1.5 p-2 rounded-lg border bg-white cursor-pointer font-bold hover:bg-green-50 hover:border-green-300">
                <input type="radio" name="fb-solved-choice" value="YES" checked class="text-[#2E7D5B]">
                <span class="text-[#2E7D5B]">YES (Fully)</span>
              </label>
              <label class="flex items-center justify-center gap-1.5 p-2 rounded-lg border bg-white cursor-pointer font-bold hover:bg-amber-50 hover:border-amber-300">
                <input type="radio" name="fb-solved-choice" value="PARTIALLY" class="text-[#B7791F]">
                <span class="text-[#B7791F]">PARTIALLY</span>
              </label>
              <label class="flex items-center justify-center gap-1.5 p-2 rounded-lg border bg-white cursor-pointer font-bold hover:bg-red-50 hover:border-red-300">
                <input type="radio" name="fb-solved-choice" value="NO" class="text-[#C62828]">
                <span class="text-[#C62828]">NO</span>
              </label>
            </div>
          </div>

          <!-- Overall Star Rating -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Overall Satisfaction (1–5 Stars):</label>
            <select id="fb-stars" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-amber-500">
              <option value="5">★★★★★ (5 Stars - Exceptional)</option>
              <option value="4">★★★★☆ (4 Stars - Good)</option>
              <option value="3">★★★☆☆ (3 Stars - Average)</option>
              <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
              <option value="1">★☆☆☆☆ (1 Star - Unsatisfactory)</option>
            </select>
          </div>

          <!-- 4 Specific Metrics -->
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label class="font-semibold text-slate-700 block mb-1">Response Speed:</label>
              <select id="fb-speed" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium">
                <option value="5">5 - Prompt (Within 24-48h)</option>
                <option value="4">4 - On Schedule</option>
                <option value="3">3 - Moderate</option>
                <option value="2">2 - Delayed</option>
                <option value="1">1 - Very Slow</option>
              </select>
            </div>

            <div>
              <label class="font-semibold text-slate-700 block mb-1">Communication:</label>
              <select id="fb-comm" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium">
                <option value="5">5 - Highly Transparent</option>
                <option value="4">4 - Good Updates</option>
                <option value="3">3 - Adequate</option>
                <option value="2">2 - Sparse</option>
                <option value="1">1 - None</option>
              </select>
            </div>

            <div>
              <label class="font-semibold text-slate-700 block mb-1">Solution Quality:</label>
              <select id="fb-quality" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium">
                <option value="5">5 - High Engineering Standard</option>
                <option value="4">4 - Solid Work</option>
                <option value="3">3 - Temporary Fix</option>
                <option value="2">2 - Poor Craft</option>
                <option value="1">1 - Defective</option>
              </select>
            </div>

            <div>
              <label class="font-semibold text-slate-700 block mb-1">Helpfulness:</label>
              <select id="fb-helpfulness" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium">
                <option value="5">5 - Very Cooperative</option>
                <option value="4">4 - Helpful</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Unresponsive</option>
                <option value="1">1 - Obstructive</option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Tell us what could be improved:</label>
            <textarea id="fb-improvements" rows="3" placeholder="Provide constructive feedback for future civic projects..." class="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" onclick="window.app.closeModal()" class="btn-secondary px-4 py-2.5 font-bold">
              Cancel
            </button>
            <button type="submit" class="btn-primary px-5 py-2.5 font-bold shadow-md transition">
              Submit Transparent Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
