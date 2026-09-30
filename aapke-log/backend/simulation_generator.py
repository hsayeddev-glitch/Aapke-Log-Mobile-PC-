"""
AAPKE LOG - Prototype Simulation Data Generator
Target: 5,000–8,000 prototype problem records statistically inspired by real Mumbai/BMC patterns.
Strictly labeled as "PROTOTYPE SIMULATION DATA".
"""
import random

SIMULATION_SUMMARY = {
    "title": "Aapke Log Platform Data",
    "badge": "PROTOTYPE SIMULATION DATA",
    "disclaimer": "These numbers represent prototype simulation data modeled after Mumbai civic trends and are NOT official BMC data.",
    
    # Core Platform Volume Metrics
    "problems_registered": 4820,
    "ai_classified": 3406,
    "problems_matched": 2918,
    "help_requests_total": 1284,
    "help_requests_pending": 412,
    "help_requests_accepted": 872,
    "active_solution_projects": 1764,
    "projects_solved": 1126,
    "projects_in_progress": 638,
    
    # AI Threat Level Distribution (Strictly HIGH / MEDIUM / LOW)
    "threat_level_distribution": {
        "label": "Prototype AI Classification",
        "HIGH": 18,     # 18%
        "MEDIUM": 47,   # 47%
        "LOW": 35       # 35%
    },
    
    # Where Help is Needed (Solver Gap Analysis)
    "where_help_needed": [
        {"category": "Water Management", "short_label": "Water", "count": 184},
        {"category": "Drainage & Stormwater", "short_label": "Drainage", "count": 163},
        {"category": "Solid Waste Management", "short_label": "Waste Management", "count": 147},
        {"category": "Roads & Infrastructure", "short_label": "Roads", "count": 96},
        {"category": "Public Health & Sanitation", "short_label": "Public Health", "count": 82},
        {"category": "Education & Civic Facilities", "short_label": "Education", "count": 71}
    ],
    
    # Solver Routing Analytics
    "solver_routing_analytics": [
        {"solver_type": "BMC", "count": 1420, "color": "#1769AA"},
        {"solver_type": "Students / Universities", "count": 1106, "color": "#2E7D5B"},
        {"solver_type": "Companies / Industry", "count": 642, "color": "#B7791F"},
        {"solver_type": "Collaborative Teams (BMC + Univ + Industry)", "count": 1652, "color": "#147D86"}
    ]
}

def generate_synthetic_records(count=6200):
    """
    Generates 6,200 synthetic simulation records with weighted distribution:
    - High-volume wards (K/E, K/W, P/N, L, S) have higher counts.
    - Solid Waste, Drainage, Water have higher counts.
    - Threat levels match ~18% HIGH, 47% MEDIUM, 35% LOW.
    """
    random.seed(42)  # Deterministic for consistency
    
    ward_weights = [
        ("K/E", 14), ("K/W", 13), ("P/N", 11), ("L", 10), ("S", 9),
        ("G/N", 6), ("H/W", 6), ("P/S", 5), ("F/N", 4), ("N", 4),
        ("R/C", 3), ("R/S", 3), ("M/W", 3), ("H/E", 2), ("M/E", 2),
        ("G/S", 2), ("F/S", 1), ("T", 1), ("E", 1), ("D", 1),
        ("R/N", 1), ("C", 1), ("B", 1), ("A", 1)
    ]
    wards, w_weights = zip(*ward_weights)

    category_weights = [
        ("Solid Waste Management", 26),
        ("Drainage", 18),
        ("Water Management", 17),
        ("Roads", 12),
        ("Public Safety", 8),
        ("Healthcare", 6),
        ("Environment", 5),
        ("Education", 4),
        ("Transportation", 4)
    ]
    categories, c_weights = zip(*category_weights)

    threat_choices = ["HIGH", "MEDIUM", "LOW"]
    threat_weights = [18, 47, 35]

    solvers = ["BMC", "Students / Universities", "Companies / Industry", "Collaborative Teams"]
    solver_weights = [29, 23, 13, 35]

    statuses = ["Solved", "In Progress", "Help Accepted", "Matched", "Under Review"]
    status_weights = [45, 25, 12, 10, 8]

    records = []
    for i in range(1, count + 1):
        ward = random.choices(wards, weights=w_weights, k=1)[0]
        cat = random.choices(categories, weights=c_weights, k=1)[0]
        threat = random.choices(threat_choices, weights=threat_weights, k=1)[0]
        solver = random.choices(solvers, weights=solver_weights, k=1)[0]
        status = random.choices(statuses, weights=status_weights, k=1)[0]
        days_open = random.randint(3, 95)
        escalated = (days_open > 40 and status != "Solved" and random.random() < 0.18)

        records.append({
            "id": f"SIM-{i:05d}",
            "ward": ward,
            "category": cat,
            "threat_level": threat,
            "solver": solver,
            "status": status,
            "days_open": days_open,
            "escalated": escalated
        })
    return records
