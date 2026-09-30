"""
AAPKE LOG - Database Layer (SQLite)
Maintains persistent application state for societies, solvers, problems, help requests,
help offers, projects (dynamic stages), teams, citizen support offers, citizen votes, feedback, and escalation tickets.
The database is the single source of truth.
"""

import sqlite3
import json
import os
import datetime
from typing import List, Dict, Any, Optional
from backend.seed_data import (
    DEMO_SOCIETIES,
    DEMO_BMC_DEPARTMENTS,
    DEMO_UNIVERSITIES,
    DEMO_FACULTY,
    DEMO_STUDENTS,
    DEMO_COMPANIES,
    DEMO_PROBLEMS
)

DB_PATH = os.path.join(os.path.dirname(__file__), "aapke_log.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Societies Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS societies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rep_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        address TEXT NOT NULL,
        ward TEXT NOT NULL,
        org_type TEXT NOT NULL,
        population INTEGER,
        verified INTEGER DEFAULT 1,
        verification_date TEXT,
        avatar TEXT
    )
    """)

    # 2. Solvers Table (BMC, Universities, Companies)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS solvers (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL, -- 'BMC', 'University', 'Industry'
        name TEXT NOT NULL,
        lead_name TEXT NOT NULL,
        email TEXT NOT NULL,
        location TEXT NOT NULL,
        domain TEXT NOT NULL,
        skills_json TEXT NOT NULL,
        capabilities TEXT,
        verification_badge INTEGER DEFAULT 1,
        availability TEXT DEFAULT 'Active'
    )
    """)

    # 3. Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        university_id TEXT NOT NULL,
        major TEXT NOT NULL,
        year TEXT NOT NULL,
        skills_json TEXT NOT NULL
    )
    """)

    # 4. Faculty Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS faculty (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        university_id TEXT NOT NULL,
        department TEXT NOT NULL,
        expertise_json TEXT NOT NULL,
        lab TEXT NOT NULL
    )
    """)

    # 5. Problems Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS problems (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        society_id TEXT NOT NULL,
        society_name TEXT NOT NULL,
        initial_category TEXT NOT NULL,
        ai_category TEXT NOT NULL,
        ai_subcategory TEXT,
        location TEXT NOT NULL,
        ward TEXT NOT NULL,
        people_affected INTEGER NOT NULL,
        frequency TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_image TEXT,
        additional_notes TEXT,
        status TEXT NOT NULL, -- 'New', 'Under Review', 'Verified', 'Matched', 'Help Accepted', 'Team Formed', 'In Progress', 'Solved', 'Escalated'
        threat_level TEXT NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
        threat_reason TEXT NOT NULL,
        required_skills_json TEXT NOT NULL,
        recommended_solver TEXT NOT NULL,
        recommended_solver_reason TEXT,
        assigned_solver TEXT,
        project_stage TEXT,
        project_progress INTEGER DEFAULT 0,
        escalation_level INTEGER DEFAULT 0,
        community_votes INTEGER DEFAULT 0,
        team_replacement_required INTEGER DEFAULT 0,
        previous_teams_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL
    )
    """)

    # 6. Help Requests Table (dispatched system matching)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS help_requests (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        target_solver_type TEXT NOT NULL, -- 'BMC', 'University', 'Industry'
        target_solver_name TEXT NOT NULL,
        role_needed TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Pending', 'Accepted', 'Declined', 'Info_Requested'
        response_window TEXT DEFAULT '24–48 hours',
        accepted_at TEXT,
        accepted_by TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 7. Help Offers Table (Universities and Industries OFFER HELP)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS help_offers (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        solver_id TEXT NOT NULL,
        solver_name TEXT NOT NULL,
        solver_type TEXT NOT NULL, -- 'University' or 'Industry'
        rating REAL DEFAULT 4.8,
        expertise TEXT NOT NULL,
        experience TEXT NOT NULL,
        contribution TEXT NOT NULL,
        status TEXT DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Selected for Team'
        created_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 8. Projects Table (Dynamic AI-generated stages)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        problem_id TEXT UNIQUE NOT NULL,
        problem_title TEXT NOT NULL,
        society_name TEXT NOT NULL,
        ward TEXT NOT NULL,
        threat_level TEXT NOT NULL,
        lead_solver TEXT NOT NULL,
        collaborators_json TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        stage_number INTEGER NOT NULL,
        progress_percent INTEGER NOT NULL,
        latest_update TEXT NOT NULL,
        next_milestone TEXT NOT NULL,
        expected_completion TEXT NOT NULL,
        stages_json TEXT, -- JSON array of dynamic AI-generated stages
        ai_stage_recommendation TEXT,
        started_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 9. Official Teams Table (Formed exclusively by BMC/Admin)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        problem_id TEXT UNIQUE NOT NULL,
        project_id TEXT,
        created_by_solver TEXT NOT NULL,
        team_title TEXT NOT NULL,
        members_json TEXT NOT NULL,
        formed_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 10. Citizen Support Offers (Voluntary assistance only)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS citizen_support_offers (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        support_type TEXT NOT NULL, -- 'Local Information', 'Photographs & Ground Data', 'Technical Expertise', 'Field Testing Volunteer'
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Submitted', -- 'Submitted', 'Acknowledged', 'Incorporated'
        created_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 11. Citizen Votes Table (Strictly citizen_id + problem_id unique; citizen.society_id == problem.society_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS citizen_votes (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        society_id TEXT NOT NULL,
        problem_id TEXT NOT NULL,
        voted_at TEXT NOT NULL,
        UNIQUE(citizen_id, problem_id)
    )
    """)

    # 12. Student/University and Industry/Startup willingness-to-help votes.
    # Kept separate from citizen community voting by design.
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_votes (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        voter_type TEXT NOT NULL, -- 'StudentUniversity' or 'IndustryStartup'
        voter_id TEXT NOT NULL,
        voter_name TEXT NOT NULL,
        organization_id TEXT,
        organization_name TEXT,
        contribution TEXT,
        status TEXT DEFAULT 'Submitted',
        bmc_notified_at TEXT,
        bmc_notification_status TEXT DEFAULT 'Not Applicable',
        voted_at TEXT NOT NULL,
        UNIQUE(voter_type, voter_id, problem_id),
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 13. Feedback Table (Post-Resolution Evaluation)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        submitted_by_type TEXT NOT NULL, -- 'Society Representative', 'Community Citizen'
        submitter_name TEXT NOT NULL,
        satisfaction_stars INTEGER NOT NULL, -- 1 to 5
        problem_actually_solved TEXT NOT NULL, -- 'YES', 'PARTIALLY', 'NO'
        rating_speed INTEGER NOT NULL,
        rating_communication INTEGER NOT NULL,
        rating_quality INTEGER NOT NULL,
        rating_helpfulness INTEGER NOT NULL,
        improvement_suggestions TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    # 14. Escalation Tickets Table (3-Tier Customer Support Review: Level 1 -> 2 -> 3 -> Team Replacement)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS escalation_tickets (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        society_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        previous_solver TEXT,
        current_status TEXT NOT NULL,
        what_remains_unresolved TEXT NOT NULL,
        evidence TEXT,
        additional_notes TEXT,
        escalation_level INTEGER DEFAULT 1, -- 1 (Initial Failure), 2 (Senior Review), 3 (Final Escalation)
        delay_duration TEXT DEFAULT '3 Days',
        team_response TEXT,
        history_json TEXT DEFAULT '[]',
        replacement_requested INTEGER DEFAULT 0,
        admin_notes TEXT,
        ticket_status TEXT DEFAULT 'Open', -- 'Open', 'Under Senior Review', 'Higher Authority Notified', 'Team Replacement Required', 'Resolved'
        level_started_at TEXT,
        current_deadline TEXT,
        updated_at TEXT,
        responsible_officer TEXT,
        completion_report TEXT,
        completion_reported_at TEXT,
        official_action_required INTEGER DEFAULT 0,
        notifications_json TEXT DEFAULT '[]',
        progress_reports_json TEXT DEFAULT '[]',
        field_evidence_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
    """)

    conn.commit()

    # Apply safe migrations if columns are missing from existing database tables
    def ensure_column(table: str, col_name: str, col_type: str):
        cursor.execute(f"PRAGMA table_info({table})")
        existing_cols = [r[1] for r in cursor.fetchall()]
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")

    ensure_column("problems", "community_votes", "INTEGER DEFAULT 0")
    ensure_column("problems", "team_replacement_required", "INTEGER DEFAULT 0")
    ensure_column("problems", "previous_teams_json", "TEXT DEFAULT '[]'")
    ensure_column("societies", "population", "INTEGER")
    ensure_column("support_votes", "contribution", "TEXT")
    ensure_column("support_votes", "status", "TEXT DEFAULT 'Submitted'")
    ensure_column("support_votes", "bmc_notified_at", "TEXT")
    ensure_column("support_votes", "bmc_notification_status", "TEXT DEFAULT 'Not Applicable'")
    ensure_column("projects", "stages_json", "TEXT")
    ensure_column("projects", "ai_stage_recommendation", "TEXT")
    ensure_column("escalation_tickets", "delay_duration", "TEXT DEFAULT '3 Days'")
    ensure_column("escalation_tickets", "team_response", "TEXT")
    ensure_column("escalation_tickets", "history_json", "TEXT DEFAULT '[]'")
    ensure_column("escalation_tickets", "replacement_requested", "INTEGER DEFAULT 0")
    ensure_column("escalation_tickets", "level_started_at", "TEXT")
    ensure_column("escalation_tickets", "current_deadline", "TEXT")
    ensure_column("escalation_tickets", "updated_at", "TEXT")
    ensure_column("escalation_tickets", "responsible_officer", "TEXT")
    ensure_column("escalation_tickets", "completion_report", "TEXT")
    ensure_column("escalation_tickets", "completion_reported_at", "TEXT")
    ensure_column("escalation_tickets", "official_action_required", "INTEGER DEFAULT 0")
    ensure_column("escalation_tickets", "notifications_json", "TEXT DEFAULT '[]'")
    ensure_column("escalation_tickets", "progress_reports_json", "TEXT DEFAULT '[]'")
    ensure_column("escalation_tickets", "field_evidence_json", "TEXT DEFAULT '[]'")

    # Backfill the maintained population for existing demo societies. The
    # percentage calculation always reads this database value at request time.
    for society in DEMO_SOCIETIES:
        cursor.execute(
            """
            UPDATE societies
            SET population = ?
            WHERE id = ? AND (population IS NULL OR population <= 0)
            """,
            (society["population"], society["id"])
        )

    # Backfill deadline metadata for pre-existing tickets. Automatic lifecycle
    # processing in backend/main.py will advance any genuinely expired ticket.
    ticket_rows = cursor.execute("""
        SELECT id, escalation_level, created_at, level_started_at,
               current_deadline, updated_at, notifications_json
        FROM escalation_tickets
    """).fetchall()
    level_days = {1: 5, 2: 10, 3: 5}
    for ticket in ticket_rows:
        started_at = ticket["level_started_at"] or ticket["created_at"]
        deadline = ticket["current_deadline"]
        if not deadline and started_at:
            try:
                started_dt = datetime.datetime.fromisoformat(started_at.replace("Z", "+00:00"))
                deadline_dt = started_dt + datetime.timedelta(days=level_days.get(ticket["escalation_level"], 5))
                deadline = deadline_dt.isoformat().replace("+00:00", "Z")
            except ValueError:
                deadline = None
        cursor.execute("""
            UPDATE escalation_tickets
            SET level_started_at = COALESCE(level_started_at, ?),
                current_deadline = COALESCE(current_deadline, ?),
                updated_at = COALESCE(updated_at, created_at),
                notifications_json = COALESCE(notifications_json, '[]')
            WHERE id = ?
        """, (started_at, deadline, ticket["id"]))

    conn.commit()

    # Seed initial demo data if tables are empty
    cursor.execute("SELECT COUNT(*) FROM societies")
    if cursor.fetchone()[0] == 0:
        seed_database(conn)
    else:
        # Ensure seed demo data for help_offers and citizen_votes exists
        seed_extension_data(conn)

    # Fresh databases seed tickets after the first migration pass, so apply the
    # same real timestamp metadata once more to any newly inserted rows.
    ticket_rows = cursor.execute("""
        SELECT id, escalation_level, created_at, level_started_at, current_deadline
        FROM escalation_tickets
        WHERE level_started_at IS NULL OR current_deadline IS NULL
    """).fetchall()
    for ticket in ticket_rows:
        started_at = ticket["level_started_at"] or ticket["created_at"]
        deadline = ticket["current_deadline"]
        if not deadline and started_at:
            try:
                started_dt = datetime.datetime.fromisoformat(started_at.replace("Z", "+00:00"))
                deadline_dt = started_dt + datetime.timedelta(days=level_days.get(ticket["escalation_level"], 5))
                deadline = deadline_dt.isoformat().replace("+00:00", "Z")
            except ValueError:
                deadline = None
        cursor.execute("""
            UPDATE escalation_tickets
            SET level_started_at = COALESCE(level_started_at, ?),
                current_deadline = COALESCE(current_deadline, ?),
                updated_at = COALESCE(updated_at, created_at),
                notifications_json = COALESCE(notifications_json, '[]')
            WHERE id = ?
        """, (started_at, deadline, ticket["id"]))
    conn.commit()

    conn.close()

def build_default_dynamic_stages(category: str, current_stage_name: str = "Field Investigation", progress: int = 52) -> List[Dict[str, Any]]:
    """Generates problem-specific dynamic solution stages."""
    if category == "Water Management":
        stage_names = [
            "Verification",
            "BMC Assessment",
            "Expert Analysis",
            "Field Investigation",
            "Repair Planning",
            "Field Repair",
            "Testing",
            "Community Review"
        ]
    elif category in ["Roads", "Infrastructure"]:
        stage_names = [
            "Verification",
            "Municipal Inspection",
            "Polymer Mastic Formulation",
            "Field Resurfacing",
            "Load Testing & Society Review"
        ]
    elif category == "Drainage":
        stage_names = [
            "Verification",
            "Stormwater Culvert Profiling",
            "Robotic Silt Inspection",
            "Desilting & Jetting Execution",
            "Flow Monitoring",
            "Society Review"
        ]
    elif category == "Solid Waste Management":
        stage_names = [
            "Verification",
            "Ward SWM Assessment",
            "Bio-Methanation Plan",
            "Segregation Infrastructure Deployment",
            "Community Review"
        ]
    else:
        stage_names = [
            "Verification",
            "Assignment",
            "Field Action",
            "Resolution",
            "Society Review"
        ]

    stages = []
    found_current = False
    for i, name in enumerate(stage_names, start=1):
        if name == current_stage_name:
            status = "in_progress"
            found_current = True
        elif not found_current:
            status = "completed"
        else:
            status = "pending"
        stages.append({
            "id": i,
            "name": name,
            "status": status,
            "description": f"Phase {i}: {name} protocol execution."
        })
    return stages

def seed_extension_data(conn):
    """Seeds help offers, citizen votes, and dynamic stages if not already present."""
    cursor = conn.cursor()

    # 1. Seed Help Offers if empty
    cursor.execute("SELECT COUNT(*) FROM help_offers")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO help_offers (id, problem_id, solver_id, solver_name, solver_type, rating, expertise, experience, contribution, status, created_at)
        VALUES 
        ('HO-001', 'PRB-MUM-2026-001', 'UNI-001', 'Demo Tech University Mumbai', 'University', 4.8, 'Civil & Hydraulic Engineering', 'Hydraulic transient pressure modeling & EPANET simulations across 12 civic corridors', 'Faculty lead + 2 graduate student researchers for acoustic leak isolation & pressure transient monitoring', 'Accepted', '2026-03-01T12:00:00Z'),
        ('HO-002', 'PRB-MUM-2026-001', 'COM-001', 'Demo IoT Solutions Pvt Ltd', 'Industry', 4.6, 'Water Pipeline IoT & Acoustic Clamp Sensors', 'Deployed 200+ clamp-on acoustic flow meters across MIDC industrial and residential corridors', 'Provide 4 clamp-on acoustic sensors, cellular telemetry gateway, and live leak alert dashboard at no cost via CSR', 'Accepted', '2026-03-01T13:30:00Z'),
        ('HO-003', 'PRB-MUM-2026-002', 'UNI-003', 'Demo National Technical Institute', 'University', 4.7, 'Sewer Inspection Robotics', 'Developed IP68 waterproof underwater drone platforms for stormwater profiling', 'Provide 2 robotic crawlers with HD inspection sonars for canal silt profiling', 'Submitted', '2026-03-03T10:00:00Z'),
        ('HO-004', 'PRB-MUM-2026-002', 'COM-005', 'Demo CivicRobotics Labs', 'Industry', 4.5, 'IP68 Sewer Crawlers & Jetting Drones', 'Contracted with municipal SWD teams across 6 cities for high-pressure canal restoration', 'Deploy heavy-duty mobile jetting pump and telemetry monitoring unit', 'Submitted', '2026-03-03T11:00:00Z')
        """)

    # 2. Seed Citizen Votes if empty
    cursor.execute("SELECT COUNT(*) FROM citizen_votes")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT OR IGNORE INTO citizen_votes (id, citizen_id, citizen_name, society_id, problem_id, voted_at)
        VALUES 
        ('VOT-001', 'CIT-001', 'Rahul Sharma', 'SOC-002', 'PRB-MUM-2026-001', '2026-03-02T10:00:00Z')
        """)

    # 3. Update community_votes on problems for realistic ordering demonstration
    cursor.execute("UPDATE problems SET community_votes = 1284 WHERE id = 'PRB-MUM-2026-001'")
    cursor.execute("UPDATE problems SET community_votes = 200 WHERE id = 'PRB-MUM-2026-004'") # HIGH, 200 votes
    cursor.execute("UPDATE problems SET community_votes = 1500 WHERE id = 'PRB-MUM-2026-002'") # MEDIUM, 1500 votes
    cursor.execute("UPDATE problems SET community_votes = 800 WHERE id = 'PRB-MUM-2026-017'") # MEDIUM, 800 votes
    cursor.execute("UPDATE problems SET community_votes = 2500 WHERE id = 'PRB-MUM-2026-014'") # LOW, 2500 votes (proves LOW never beats HIGH)
    cursor.execute("UPDATE problems SET community_votes = 450 WHERE id = 'PRB-MUM-2026-016'") # LOW, 450 votes

    # 4. Ensure dynamic stages and AI recommendation are populated on projects
    p1_stages = build_default_dynamic_stages("Water Management", "Field Investigation", 52)
    cursor.execute("""
    UPDATE projects 
    SET stages_json = ?, 
        ai_stage_recommendation = 'Required field evidence received. Stage appears complete.',
        current_stage = 'Field Investigation',
        progress_percent = 52
    WHERE problem_id = 'PRB-MUM-2026-001'
    """, (json.dumps(p1_stages),))

    cursor.execute("""
    UPDATE problems 
    SET project_stage = 'Field Investigation',
        project_progress = 52
    WHERE id = 'PRB-MUM-2026-001'
    """)

    # 5. Seed escalation ticket ESC-2026-004 for PRB-MUM-2026-001 if not exists
    cursor.execute("SELECT id FROM escalation_tickets WHERE id = 'ESC-2026-004'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO escalation_tickets (
            id, problem_id, society_name, reason, previous_solver, current_status,
            what_remains_unresolved, evidence, additional_notes, escalation_level,
            delay_duration, team_response, history_json, replacement_requested, admin_notes, ticket_status, created_at
        )
        VALUES (
            'ESC-2026-004', 'PRB-MUM-2026-001', 'Lokhandwala Residents Association',
            'Work not completed: repeated delay in field excavation and acoustic sensor calibration',
            'Official Task Force - Water Management', 'In Progress',
            'Excavation halted for 72 hours on 4th cross road; water loss continues at 4,000 L/hr',
            'Geotagged photographs and resident water pressure logs',
            'Requested immediate senior solver review and municipal intervention',
            1, '3 Days', 'Team received ticket and scheduled on-site inspection.',
            ?, 0, 'Level 1 logged: awaiting team field response.', 'Level 1 - Team Action Required', '2026-03-05T09:00:00Z'
        )
        """, (json.dumps([{"level": 1, "date": "2026-03-05", "note": "Ticket raised at Level 1 due to 3-day work delay."}]),))

    conn.commit()

def seed_database(conn):
    cursor = conn.cursor()

    # 1. Insert Societies
    for s in DEMO_SOCIETIES:
        cursor.execute("""
        INSERT INTO societies (id, name, rep_name, email, mobile, address, ward, org_type, population, verified, verification_date, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (s["id"], s["name"], s["rep_name"], s["email"], s["mobile"], s["address"], s["ward"], s["org_type"], s["population"], 1 if s["verified"] else 0, s["verification_date"], s["avatar"]))

    # 2. Insert BMC Solvers
    for b in DEMO_BMC_DEPARTMENTS:
        cursor.execute("""
        INSERT INTO solvers (id, type, name, lead_name, email, location, domain, skills_json, capabilities, verification_badge, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (b["id"], "BMC", b["name"], b["head_officer"], b["email"], b["ward_jurisdiction"], b["domain"], json.dumps(b["skills"]), b["capabilities"], b["availability"]))

    # 3. Insert Universities
    for u in DEMO_UNIVERSITIES:
        cursor.execute("""
        INSERT INTO solvers (id, type, name, lead_name, email, location, domain, skills_json, capabilities, verification_badge, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (u["id"], "University", u["name"], u["dean_or_coordinator"], u["email"], u["campus_location"], ", ".join(u["specialties"]), json.dumps(u["specialties"]), ", ".join(u["research_labs"]), "Active R&D Cell"))

    # 4. Insert Industry Partners
    for c in DEMO_COMPANIES:
        cursor.execute("""
        INSERT INTO solvers (id, type, name, lead_name, email, location, domain, skills_json, capabilities, verification_badge, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (c["id"], "Industry", c["name"], c["lead_rep"], c["email"], c["office_location"], c["domain"], json.dumps([c["domain"]]), c["capabilities"], "Active Equipment & CSR Partner"))

    # 5. Insert Students
    for st in DEMO_STUDENTS:
        cursor.execute("""
        INSERT INTO students (id, name, university_id, major, year, skills_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (st["id"], st["name"], st["university_id"], st["major"], st["year"], json.dumps(st["skills"])))

    # 6. Insert Faculty
    for f in DEMO_FACULTY:
        cursor.execute("""
        INSERT INTO faculty (id, name, university_id, department, expertise_json, lab)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (f["id"], f["name"], f["university_id"], f["department"], json.dumps(f["expertise"]), f["lab"]))

    # 7. Insert Demo Problems
    for p in DEMO_PROBLEMS:
        cursor.execute("""
        INSERT INTO problems (
            id, title, society_id, society_name, initial_category, ai_category, ai_subcategory,
            location, ward, people_affected, frequency, severity, description, evidence_image,
            additional_notes, status, threat_level, threat_reason, required_skills_json,
            recommended_solver, recommended_solver_reason, assigned_solver, project_stage,
            project_progress, escalation_level, community_votes, team_replacement_required, previous_teams_json, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["title"], p["society_id"], p["society_name"], p["initial_category"],
            p["ai_category"], p["ai_subcategory"], p["location"], p["ward"], p["people_affected"],
            p["frequency"], p["severity"], p["description"], p["evidence_image"],
            p["additional_notes"], p["status"], p["threat_level"], p["threat_reason"],
            json.dumps(p["required_skills"]), p["recommended_solver"], p["recommended_solver_reason"],
            p["assigned_solver"], p["project_stage"], p["project_progress"], 0, 50, 0, '[]', p["created_at"]
        ))

        # Seed corresponding Project with dynamic stages if active or solved
        if p["status"] in ["In Progress", "Solved", "Team Formed"]:
            dyn_stages = build_default_dynamic_stages(p["ai_category"], p["project_stage"] or "Field Investigation", p["project_progress"])
            cursor.execute("""
            INSERT INTO projects (
                id, problem_id, problem_title, society_name, ward, threat_level, lead_solver,
                collaborators_json, current_stage, stage_number, progress_percent,
                latest_update, next_milestone, expected_completion, stages_json, ai_stage_recommendation, started_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 4, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"PRJ-{p['id'][-4:]}", p["id"], p["title"], p["society_name"], p["ward"],
                p["threat_level"], p["assigned_solver"] or "BMC Water Management",
                json.dumps(["BMC Municipal Ward", "Demo University Research Lab", "Demo Industry Partner"]),
                p["project_stage"] or "Field Investigation", p["project_progress"],
                f"Active field operation underway for {p['ai_category']} remediation.",
                "Consortium engineering review and milestone delivery inspection.",
                "Within 10-14 days",
                json.dumps(dyn_stages),
                "Required field evidence received. Stage appears complete.",
                p["created_at"]
            ))

            # Seed official team formed by verified solver
            cursor.execute("""
            INSERT INTO teams (id, problem_id, project_id, created_by_solver, team_title, members_json, formed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"TM-{p['id'][-4:]}", p["id"], f"PRJ-{p['id'][-4:]}",
                p["assigned_solver"] or "BMC Water Management",
                f"Official Task Force - {p['ai_category']}",
                json.dumps([
                    {"role": "Lead Municipal Officer", "organization": "BMC Engineering", "name": "Er. Arvind Patil", "expertise": "Jurisdictional Oversight"},
                    {"role": "Academic Research Lead", "organization": "Demo Tech University Mumbai", "name": "Prof. Alok Verma", "expertise": "Hydraulic Diagnostics"},
                    {"role": "Student Research Associate", "organization": "Demo Tech University Mumbai", "name": "Aarav Sharma", "expertise": "GIS & Telemetry"},
                    {"role": "Industry Technology Specialist", "organization": "Demo IoT Solutions", "name": "Nikhil Agarwal", "expertise": "Acoustic Telemetry Sensors"}
                ]),
                p["created_at"]
            ))

    # 8. Seed Sample Citizen Support Offers
    cursor.execute("""
    INSERT INTO citizen_support_offers (id, problem_id, citizen_name, contact_email, support_type, description, status, created_at)
    VALUES 
    ('CSO-001', 'PRB-MUM-2026-001', 'Dr. Farooq Qureshi', 'farooq.q@gmail.com', 'Photographs & Ground Data', 'I have documented geotagged photos of the road cavity during morning rush hour.', 'Acknowledged', '2026-03-02T10:15:00Z'),
    ('CSO-002', 'PRB-MUM-2026-001', 'Kavita Menon', 'kmenon.tech@gmail.com', 'Technical Expertise', 'I am an IoT firmware engineer resident here; happy to assist university students in calibrating sensor nodes.', 'Incorporated', '2026-03-03T14:20:00Z'),
    ('CSO-003', 'PRB-MUM-2026-002', 'Suraj Jadhav', 'suraj.jadhav@outlook.com', 'Field Testing Volunteer', 'Can volunteer with our local youth club during canal depth profiling.', 'Submitted', '2026-03-04T09:45:00Z')
    """)

    # 9. Seed Sample Feedbacks for Solved Problems
    cursor.execute("""
    INSERT INTO feedback (id, problem_id, submitted_by_type, submitter_name, satisfaction_stars, problem_actually_solved, rating_speed, rating_communication, rating_quality, rating_helpfulness, improvement_suggestions, created_at)
    VALUES
    ('FB-001', 'PRB-MUM-2026-006', 'Society Representative', 'Rajesh V. Merchant (Sea Breeze CHS)', 5, 'YES', 5, 5, 5, 5, 'Exceptional coordination between BMC and university testers. Tap water is crystal clear again.', '2026-03-01T17:00:00Z'),
    ('FB-002', 'PRB-MUM-2026-012', 'Community Citizen', 'Sushma Dandekar (Resident)', 5, 'YES', 4, 5, 5, 5, 'Streetlights are bright and smart solar backup works perfectly. The dark alley is safe now.', '2026-02-28T19:30:00Z'),
    ('FB-003', 'PRB-MUM-2026-020', 'Society Representative', 'Farhan Qureshi (Malad Welfare)', 5, 'YES', 5, 5, 5, 5, 'The UV filtration skid donated by the company and installed by students is running wonderfully for 1,400 school kids.', '2026-02-20T12:00:00Z')
    """)

    # 10. Seed Sample Escalation Tickets
    cursor.execute("""
    INSERT INTO escalation_tickets (id, problem_id, society_name, reason, previous_solver, current_status, what_remains_unresolved, evidence, additional_notes, escalation_level, delay_duration, team_response, history_json, replacement_requested, admin_notes, ticket_status, created_at)
    VALUES
    ('ESC-2026-001', 'PRB-MUM-2026-008', 'Chembur Greens Society', 'Night chemical fumes recurring past 30 days without containment', 'Unassigned', 'Under Review', 'Fugitive toxic gas emissions continue nightly between 11 PM and 4 AM', 'Video and air meter readings exceeding 320 PM2.5', 'Demanding MPCB joint inspection and automated stack sensors', 2, '8 Days', 'Team under senior review; stack sensor deployment planned.', '[]', 0, 'Assigned to Senior BMC Environmental Health Officer for joint university stack audit.', 'Under Senior Review', '2026-03-09T08:00:00Z'),
    ('ESC-2026-002', 'PRB-MUM-2026-021', 'Kurla Civic Action Group', 'Fire tender lane obstruction unresolved for 45 days', 'Unassigned', 'Under Review', 'Illegal corrugated sheds still block emergency access completely', 'Drone aerial survey showing road width constricted to 7 feet', 'Ward office cited boundary verification delays; escalation needed.', 3, '18 Days', 'Previous team failed to clear encroachments after repeated warnings.', '[]', 1, 'Escalated to Municipal Additional Commissioner. Team Replacement Required.', 'Team Replacement Required', '2026-03-07T11:30:00Z')
    """)

    seed_extension_data(conn)
    conn.commit()
