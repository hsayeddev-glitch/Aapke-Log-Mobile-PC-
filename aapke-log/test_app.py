"""
End-to-End Verification Test for AAPKE LOG
Tests all endpoints, AI pipeline, data segregation, role constraints, and workflows.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_full_workflow():
    print("1. Testing Section A: Official BMC 2024 Reference Data...")
    ref = client.get("/api/reference-data").json()
    assert ref["total_complaints"] == 115396
    assert ref["closed"] == 88308
    assert ref["not_closed"] == 27088
    assert len(ref["ward_analysis"]) == 24
    assert ref["category_analysis"][0]["category"] == "Solid Waste Management"
    assert ref["category_analysis"][0]["is_largest"] == True
    print("[PASS] Section A Official Reference verified!")

    print("2. Testing Section B: Prototype Simulation Data...")
    sim = client.get("/api/simulation-data").json()
    assert sim["badge"] == "PROTOTYPE SIMULATION DATA"
    assert sim["threat_level_distribution"]["HIGH"] == 18
    assert sim["threat_level_distribution"]["MEDIUM"] == 47
    assert sim["threat_level_distribution"]["LOW"] == 35
    assert len(sim["where_help_needed"]) == 6
    assert len(sim["solver_routing_analytics"]) == 4
    print("[PASS] Section B Simulation Data verified!")

    print("3. Testing AI Problem Intelligence Pipeline (Strictly HIGH/MEDIUM/LOW)...")
    ai_test = client.post("/api/problems/analyze", json={
        "title": "Severe water main burst flooding street and causing cave-in",
        "description": "Potable pipeline ruptured, thousands of liters lost, school access cut off",
        "initial_category": "Water Management",
        "ward": "K/W",
        "people_affected": 3400,
        "severity": "Critical",
        "frequency": "Daily Continuous"
    }).json()
    assert ai_test["category"] == "Water Management"
    assert ai_test["threat_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "Why" not in ai_test["threat_level"]
    assert len(ai_test["threat_reason"]) > 10
    assert "BMC" in ai_test["recommended_solver"]
    print(f"[PASS] AI Analysis: Category={ai_test['category']}, Threat={ai_test['threat_level']}, Solver={ai_test['recommended_solver']}")

    print("4. Testing Society Problem Submission...")
    create_res = client.post("/api/problems", json={
        "title": "Severe water main leakage causing acute shortage in Lokhandwala",
        "description": "High pressure pipe fractured under 4th cross road",
        "society_id": "SOC-002",
        "society_name": "Lokhandwala Residents Association",
        "initial_category": "Water Management",
        "location": "4th Cross Road, Lokhandwala Complex",
        "ward": "K/W",
        "people_affected": 3200,
        "frequency": "Daily Continuous",
        "severity": "Critical",
        "evidence_image": "https://images.unsplash.com/photo-1584467735871-8e85353a8413",
        "additional_notes": "Needs emergency isolation"
    })
    assert create_res.status_code == 200
    prob_data = create_res.json()
    new_pid = prob_data["problem_id"]
    print(f"[PASS] Problem created: {new_pid}")

    print("5. Testing Solver Acceptance (24-48h support window)...")
    prob_detail = client.get(f"/api/problems/{new_pid}").json()
    hr_id = prob_detail["help_requests"][0]["id"]
    accept_res = client.post(f"/api/help-requests/{hr_id}/action", json={
        "action": "accept",
        "solver_id": "BMC-001",
        "solver_name": "BMC Water Management -- Prototype",
        "officer_name": "Er. Arvind Patil",
        "notes": "Emergency repair squad dispatched"
    }).json()
    assert accept_res["status"] == "success"
    print("[PASS] Solver accepted help request!")

    print("6. Testing Official Team Formation by Verified Solver...")
    team_res = client.post("/api/teams", json={
        "problem_id": new_pid,
        "created_by_solver": "BMC Water Management -- Prototype",
        "team_title": "Official Rapid Water Remediation Consortium",
        "members": [
            {"role": "Lead Municipal Engineer", "organization": "BMC Water Management", "name": "Er. Arvind Patil", "expertise": "Hydraulics"},
            {"role": "Academic Research Lead", "organization": "Demo Tech University", "name": "Prof. Alok Verma", "expertise": "Acoustics"},
            {"role": "Industry Tech Specialist", "organization": "Demo IoT Solutions", "name": "Nikhil Agarwal", "expertise": "LPWAN Sensors"}
        ]
    }).json()
    assert team_res["status"] == "Team Formed"
    print("[PASS] Official team formed by verified solver!")

    print("7. Testing 10-Stage Project Lifecycle Advance...")
    stage_res = client.post(f"/api/projects/{new_pid}/update-stage", json={
        "stage_id": 7,
        "stage_name": "Field Testing",
        "progress_percent": 70,
        "latest_update": "Acoustic leak telemetry active at 2 points.",
        "next_milestone": "Full sleeve installation"
    }).json()
    assert stage_res["progress"] >= 70
    print("[PASS] Project advanced to Stage 7 (Field Testing)!")

    print("8. Testing Citizen Voluntary Support Offer...")
    cso_res = client.post("/api/citizen-offers", json={
        "problem_id": new_pid,
        "citizen_name": "Kavita Menon",
        "contact_email": "kmenon@gmail.com",
        "support_type": "Technical Expertise",
        "description": "Can provide IoT sensor calibration data from local building node."
    }).json()
    assert cso_res["status"] == "Submitted"
    print("[PASS] Citizen support offer submitted!")

    print("9. Testing Rate the Solution (Feedback)...")
    fb_res = client.post("/api/feedback", json={
        "problem_id": new_pid,
        "submitted_by_type": "Society Representative",
        "submitter_name": "Sunita Kapoor (Lokhandwala Residents)",
        "satisfaction_stars": 5,
        "problem_actually_solved": "YES",
        "rating_speed": 5,
        "rating_communication": 5,
        "rating_quality": 5,
        "rating_helpfulness": 5,
        "improvement_suggestions": "Outstanding speed and coordination between BMC and university testers."
    }).json()
    assert "feedback_id" in fb_res
    print("[PASS] Solution feedback recorded!")

    print("10. Testing Customer Support Escalation Ticket (Mandatory Level 1 Entry)...")
    esc_res = client.post("/api/escalations", json={
        "problem_id": new_pid,
        "society_name": "Lokhandwala Residents Association",
        "reason": "Secondary seep detected after road repaving",
        "previous_solver": "BMC Water Management",
        "current_status": "Reopened",
        "what_remains_unresolved": "Subsurface moisture near building gate 3",
        "evidence": None,
        "additional_notes": "Senior engineer inspection requested",
        "escalation_level": 2
    }).json()
    assert "escalation_id" in esc_res
    assert esc_res["escalation_level"] == 1
    print("[PASS] Escalation ticket created at mandatory Level 1!")

    print("11. Testing Static Index Route...")
    index_res = client.get("/")
    assert index_res.status_code == 200
    assert b"AAPKE LOG" in index_res.content
    print("[PASS] Static frontend index served!")

    print("\n============================================================")
    print("ALL 11 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("============================================================")

if __name__ == "__main__":
    test_full_workflow()
