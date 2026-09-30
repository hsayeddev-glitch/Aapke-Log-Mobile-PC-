"""
AAPKE LOG - REST API & Web Application Server
FastAPI backend powering the civic-tech problem-solving network for Mumbai/BMC.
Integrates:
- Society verified reporting
- Citizen society-matching and community voting (never altering threat level)
- Strict primary ordering by threat level (HIGH -> MEDIUM -> LOW) + secondary vote sorting
- University and Industry "OFFER HELP" workflow (only BMC/Admin forms teams)
- Society review and acceptance/rejection of help offers
- BMC automatic acceptance and team formation (Work alone or Multi-stakeholder)
- Dynamic AI-generated solution stages (no fixed 10-stage lifecycle)
- AI stage advancement recommendation with authorized user confirmation
- 3-tier escalation ticket lifecycle (Level 1 -> 2 -> 3 -> Team Replacement Required)
- Team replacement workflow preserving completed stages and project progress
- Unified synchronized state across all portals
"""

import json
import os
import datetime
import math
import uuid
import io
import zipfile
import sqlite3
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import get_db_connection, init_db, build_default_dynamic_stages
from backend.official_reference_data import OFFICIAL_BMC_2024_REFERENCE
from backend.simulation_generator import SIMULATION_SUMMARY, generate_synthetic_records
from backend.ai_engine import AIAssistantEngine

# Initialize database and safe migrations
init_db()

# Pre-generate synthetic records in memory for instant high-speed admin querying
CACHED_SYNTHETIC_RECORDS = generate_synthetic_records(count=6200)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = PROJECT_ROOT / "uploads"
EVIDENCE_UPLOAD_DIR = UPLOADS_DIR / "evidence"
EVIDENCE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
TICKET_REPORT_DIR = UPLOADS_DIR / "tickets" / "reports"
TICKET_FIELD_EVIDENCE_DIR = UPLOADS_DIR / "tickets" / "field-evidence"
TICKET_REPORT_DIR.mkdir(parents=True, exist_ok=True)
TICKET_FIELD_EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

MAX_EVIDENCE_SIZE = 5 * 1024 * 1024
MAX_PROGRESS_REPORT_SIZE = 10 * 1024 * 1024
ALLOWED_EVIDENCE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_EVIDENCE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

app = FastAPI(
    title="AAPKE LOG API",
    description="Civic-tech and AI-powered societal problem-solving platform for Mumbai / BMC.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC REQUEST MODELS -----------------

class ProblemAnalysisRequest(BaseModel):
    title: str
    description: str
    initial_category: str
    ward: str
    people_affected: int = 1000
    severity: str = "High"
    frequency: str = "Daily"

class ProblemCreateRequest(BaseModel):
    title: str
    description: str
    society_id: str
    society_name: str
    initial_category: str
    location: str
    ward: str
    people_affected: int
    frequency: str
    severity: str = "High"
    evidence_image: Optional[str] = None
    additional_notes: Optional[str] = None

class CitizenVoteRequest(BaseModel):
    citizen_id: str
    citizen_name: str
    society_id: str

class SupportVoteRequest(BaseModel):
    voter_type: str  # 'StudentUniversity' or 'IndustryStartup'
    voter_id: str
    voter_name: str
    organization_id: str
    organization_name: str
    contribution: Optional[str] = None

class HelpOfferCreateRequest(BaseModel):
    problem_id: str
    solver_id: str
    solver_name: str
    solver_type: str  # 'University' or 'Industry'
    rating: float = 4.8
    expertise: str
    experience: str
    contribution: str

class HelpOfferActionRequest(BaseModel):
    action: str  # 'accept' or 'reject'
    decision_by: str = "Society Representative"

class HelpRequestAction(BaseModel):
    action: str  # 'accept', 'decline', 'request_info'
    solver_id: str
    solver_name: str
    officer_name: str
    notes: Optional[str] = None

class TeamFormationRequest(BaseModel):
    problem_id: str
    created_by_solver: str
    team_title: str
    members: List[Dict[str, Any]]
    mode: Optional[str] = "COMBINED"  # "WORK_ALONE", "UNIVERSITY", "INDUSTRY", "COMBINED"

class DynamicStageUpdateRequest(BaseModel):
    stage_id: int
    stage_name: str
    progress_percent: int
    latest_update: str
    next_milestone: str
    completed: bool = False

class CitizenOfferRequest(BaseModel):
    problem_id: str
    citizen_name: str
    contact_email: str
    support_type: str
    description: str

class FeedbackSubmitRequest(BaseModel):
    problem_id: str
    submitted_by_type: str  # 'Society Representative' or 'Community Citizen'
    submitter_name: str
    satisfaction_stars: int  # 1 to 5
    problem_actually_solved: str  # 'YES', 'PARTIALLY', 'NO'
    rating_speed: int
    rating_communication: int
    rating_quality: int
    rating_helpfulness: int
    improvement_suggestions: Optional[str] = None

class EscalationCreateRequest(BaseModel):
    problem_id: str
    society_name: str
    reason: str
    previous_solver: Optional[str] = "Unassigned"
    current_status: str
    what_remains_unresolved: str
    evidence: Optional[str] = None
    additional_notes: Optional[str] = None

class AdminEscalationAction(BaseModel):
    new_level: int
    admin_notes: str

class TeamResponseRequest(BaseModel):
    team_name: str
    response_text: str
    evidence_url: Optional[str] = None
    action_taken: str  # "acknowledge", "submit_progress", "upload_evidence", "mark_completed"

class TeamReplacementRequest(BaseModel):
    new_team_title: str
    members: List[Dict[str, Any]]
    admin_notes: str

# ----------------- REST API ENDPOINTS -----------------

def _validate_image_signature(content: bytes, content_type: str) -> bool:
    """Validate common image signatures without adding an image library dependency."""
    if content_type == "image/jpeg":
        return content.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False

DEMO_AFFECTED_PERCENTAGES = (
    35, 48, 62, 74, 41, 57, 68, 39, 53, 71, 44, 60, 66,
    37, 50, 73, 46, 64, 55, 69, 42, 58, 72, 49, 63, 76,
)

def _demo_affected_percentage(problem_id: str) -> Optional[int]:
    """Return a stable fallback only for the 26 original seeded demo problems."""
    prefix = "PRB-MUM-2026-"
    if not problem_id.startswith(prefix):
        return None
    try:
        sequence = int(problem_id.removeprefix(prefix))
    except ValueError:
        return None
    if 1 <= sequence <= len(DEMO_AFFECTED_PERCENTAGES):
        return DEMO_AFFECTED_PERCENTAGES[sequence - 1]
    return None

def _add_society_impact_metrics(conn, problem: Dict[str, Any]) -> Dict[str, Any]:
    """Attach database-backed population and affected-participation metrics."""
    population_row = conn.execute(
        "SELECT population FROM societies WHERE id = ?",
        (problem["society_id"],)
    ).fetchone()
    society_population = population_row["population"] if population_row else None
    unique_voter_count = conn.execute(
        "SELECT COUNT(DISTINCT citizen_id) FROM citizen_votes WHERE problem_id = ?",
        (problem["id"],)
    ).fetchone()[0]

    problem["society_population"] = society_population
    problem["unique_voter_count"] = unique_voter_count
    legacy_vote_count = int(problem.get("community_votes") or 0)
    effective_vote_count = max(unique_voter_count, legacy_vote_count)
    affected_percentage = None
    if society_population and society_population > 0:
        affected_percentage = min(
            100,
            round((effective_vote_count / society_population) * 100),
        )
        if affected_percentage == 0:
            affected_percentage = _demo_affected_percentage(problem["id"]) or 0
    problem["affected_percentage"] = affected_percentage

    support_rows = conn.execute("""
        SELECT voter_type, COUNT(DISTINCT voter_id) AS voter_count
        FROM support_votes
        WHERE problem_id = ?
        GROUP BY voter_type
    """, (problem["id"],)).fetchall()
    support_counts = {row["voter_type"]: row["voter_count"] for row in support_rows}
    problem["student_university_help_count"] = support_counts.get("StudentUniversity", 0)
    problem["industry_startup_help_count"] = support_counts.get("IndustryStartup", 0)

    evidence = problem.get("evidence_image")
    if not evidence:
        problem["evidence_images"] = []
    elif isinstance(evidence, list):
        problem["evidence_images"] = evidence
    elif isinstance(evidence, str) and evidence.lstrip().startswith("["):
        try:
            parsed = json.loads(evidence)
            problem["evidence_images"] = parsed if isinstance(parsed, list) else [evidence]
        except json.JSONDecodeError:
            problem["evidence_images"] = [evidence]
    else:
        problem["evidence_images"] = [evidence]

    return problem

ESCALATION_LEVEL_DAYS = {1: 5, 2: 10, 3: 5}

def _utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def _iso_utc(value: datetime.datetime) -> str:
    return value.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

def _parse_datetime(value: Optional[str]) -> Optional[datetime.datetime]:
    if not value:
        return None
    try:
        parsed = datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        return None

def _resolve_responsible_officer(conn, problem) -> str:
    category = problem["ai_category"] or problem["initial_category"]
    officer = conn.execute("""
        SELECT lead_name
        FROM solvers
        WHERE type = 'BMC' AND (domain LIKE ? OR name LIKE ?)
        ORDER BY name
        LIMIT 1
    """, (f"%{category}%", f"%{category}%")).fetchone()
    if not officer:
        officer = conn.execute("""
            SELECT lead_name FROM solvers
            WHERE type = 'BMC'
            ORDER BY name
            LIMIT 1
        """).fetchone()
    return officer["lead_name"] if officer else "Government Officer / City Command Admin"

def _validate_ticket_evidence_reference(evidence: Optional[str]) -> None:
    if not evidence:
        return
    prefix = "/uploads/evidence/"
    if not evidence.startswith(prefix):
        raise HTTPException(status_code=400, detail="Ticket evidence must be uploaded through the image upload control.")
    filename = evidence.removeprefix(prefix)
    destination = (EVIDENCE_UPLOAD_DIR / filename).resolve()
    if destination.parent != EVIDENCE_UPLOAD_DIR.resolve() or not destination.is_file():
        raise HTTPException(status_code=400, detail="The uploaded ticket evidence could not be found.")

def _make_notifications(level: int, officer: str, solver: str, deadline: str, event: str) -> List[Dict[str, Any]]:
    return [
        {
            "audience": "Government Officer",
            "recipient": officer,
            "level": level,
            "event": event,
            "deadline": deadline,
        },
        {
            "audience": "Assigned Solver",
            "recipient": solver or "Unassigned solver",
            "level": level,
            "event": event,
            "deadline": deadline,
        },
    ]

def process_expired_escalations(now: Optional[datetime.datetime] = None) -> int:
    """
    Advance open tickets from real stored deadlines. Multiple missed levels are
    processed in one pass, using the prior deadline as the next level's start.
    """
    now = now or _utc_now()
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT * FROM escalation_tickets
        WHERE ticket_status NOT IN ('Resolved', 'Closed', 'Completion Report Submitted - Awaiting Review')
          AND COALESCE(official_action_required, 0) = 0
          AND current_deadline IS NOT NULL
    """).fetchall()
    transitions = 0

    for row in rows:
        ticket = dict(row)
        level = ticket["escalation_level"] or 1
        deadline = _parse_datetime(ticket["current_deadline"])
        history = json.loads(ticket["history_json"] or "[]")
        notifications = json.loads(ticket["notifications_json"] or "[]")

        while deadline and deadline <= now and level <= 3:
            transition_time = deadline
            if level == 1:
                level = 2
                new_deadline = transition_time + datetime.timedelta(days=ESCALATION_LEVEL_DAYS[2])
                status = "Level 2 - Senior Solver Review"
                event = "Level 1 deadline expired; automatically escalated to Senior Solver Review."
                conn.execute("UPDATE problems SET escalation_level = 2 WHERE id = ?", (ticket["problem_id"],))
            elif level == 2:
                level = 3
                new_deadline = transition_time + datetime.timedelta(days=ESCALATION_LEVEL_DAYS[3])
                status = "Level 3 - Higher Authority Escalation"
                event = "Level 2 deadline expired; automatically escalated to Higher Official / Authority."
                conn.execute("UPDATE problems SET escalation_level = 3 WHERE id = ?", (ticket["problem_id"],))
            else:
                event = "Level 3 deadline expired without a completion report. Government/Admin action is required."
                history.append({
                    "level": 3,
                    "timestamp": _iso_utc(transition_time),
                    "event": event,
                    "automatic": True,
                })
                notifications.extend(_make_notifications(
                    3,
                    ticket.get("responsible_officer") or "Government Officer / City Command Admin",
                    ticket.get("previous_solver") or "Unassigned solver",
                    ticket["current_deadline"],
                    event,
                ))
                conn.execute("""
                    UPDATE escalation_tickets
                    SET ticket_status = 'Government/Admin Action Required',
                        official_action_required = 1,
                        replacement_requested = 1,
                        history_json = ?,
                        notifications_json = ?,
                        admin_notes = ?,
                        updated_at = ?
                    WHERE id = ?
                """, (
                    json.dumps(history),
                    json.dumps(notifications),
                    event,
                    _iso_utc(now),
                    ticket["id"],
                ))
                transitions += 1
                level = 4
                break

            deadline_text = _iso_utc(new_deadline)
            history.append({
                "level": level,
                "timestamp": _iso_utc(transition_time),
                "event": event,
                "automatic": True,
                "deadline": deadline_text,
            })
            notifications.extend(_make_notifications(
                level,
                ticket.get("responsible_officer") or "Government Officer / City Command Admin",
                ticket.get("previous_solver") or "Unassigned solver",
                deadline_text,
                event,
            ))
            conn.execute("""
                UPDATE escalation_tickets
                SET escalation_level = ?,
                    ticket_status = ?,
                    delay_duration = ?,
                    level_started_at = ?,
                    current_deadline = ?,
                    history_json = ?,
                    notifications_json = ?,
                    admin_notes = ?,
                    updated_at = ?
                WHERE id = ?
            """, (
                level,
                status,
                f"{ESCALATION_LEVEL_DAYS[level]} Days",
                _iso_utc(transition_time),
                deadline_text,
                json.dumps(history),
                json.dumps(notifications),
                event,
                _iso_utc(now),
                ticket["id"],
            ))
            deadline = new_deadline
            ticket["current_deadline"] = deadline_text
            transitions += 1

    conn.commit()
    conn.close()
    return transitions

def _enrich_escalation_ticket(conn, row, now: Optional[datetime.datetime] = None) -> Dict[str, Any]:
    ticket = dict(row)
    now = now or _utc_now()
    ticket["history"] = json.loads(ticket.get("history_json") or "[]")
    ticket["notifications"] = json.loads(ticket.get("notifications_json") or "[]")
    ticket["progress_reports"] = json.loads(ticket.get("progress_reports_json") or "[]")
    ticket["field_evidence"] = json.loads(ticket.get("field_evidence_json") or "[]")

    deadline = _parse_datetime(ticket.get("current_deadline"))
    if ticket.get("ticket_status") in {"Resolved", "Completion Report Submitted - Awaiting Review"}:
        ticket["remaining_seconds"] = None
        ticket["remaining_days"] = None
        ticket["remaining_label"] = ticket["ticket_status"]
    elif deadline:
        remaining_seconds = int((deadline - now).total_seconds())
        ticket["remaining_seconds"] = remaining_seconds
        ticket["remaining_days"] = max(0, math.ceil(remaining_seconds / 86400))
        if remaining_seconds > 86400:
            ticket["remaining_label"] = f"{ticket['remaining_days']} days remaining"
        elif remaining_seconds > 0:
            ticket["remaining_label"] = f"{max(1, math.ceil(remaining_seconds / 3600))} hours remaining"
        else:
            ticket["remaining_label"] = "Deadline expired"
    else:
        ticket["remaining_seconds"] = None
        ticket["remaining_days"] = None
        ticket["remaining_label"] = "No active deadline"

    problem = conn.execute("""
        SELECT title, assigned_solver, recommended_solver, ai_category
        FROM problems WHERE id = ?
    """, (ticket["problem_id"],)).fetchone()
    ticket["problem_title"] = problem["title"] if problem else ticket["problem_id"]
    if problem and not ticket.get("previous_solver"):
        ticket["previous_solver"] = problem["assigned_solver"] or problem["recommended_solver"]
    return ticket

# Perform one real deadline check when the API process starts. Subsequent
# relevant reads and writes call the same idempotent processor.
process_expired_escalations()

@app.post("/api/upload-evidence")
async def upload_problem_evidence(file: UploadFile = File(...)):
    """
    Store one optional problem evidence image and return its public URL.
    The original filename is used only to validate its extension and is never
    used as a filesystem path.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Please choose an image to upload.")

    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_EVIDENCE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported image type. Please upload a JPG, PNG, or WEBP image."
        )

    original_extension = Path(file.filename).suffix.lower()
    if original_extension not in ALLOWED_EVIDENCE_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file extension. Please upload a .jpg, .jpeg, .png, or .webp image."
        )

    expected_extension = ALLOWED_EVIDENCE_TYPES[content_type]
    if content_type == "image/jpeg" and original_extension not in {".jpg", ".jpeg"}:
        raise HTTPException(status_code=415, detail="The file extension does not match the image type.")
    if content_type != "image/jpeg" and original_extension != expected_extension:
        raise HTTPException(status_code=415, detail="The file extension does not match the image type.")

    content = bytearray()
    try:
        while chunk := await file.read(1024 * 1024):
            content.extend(chunk)
            if len(content) > MAX_EVIDENCE_SIZE:
                raise HTTPException(status_code=413, detail="Image must be smaller than 5 MB.")
    finally:
        await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="The selected image is empty.")
    if not _validate_image_signature(bytes(content), content_type):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid supported image.")

    stored_filename = f"{uuid.uuid4().hex}{expected_extension}"
    destination = (EVIDENCE_UPLOAD_DIR / stored_filename).resolve()
    if destination.parent != EVIDENCE_UPLOAD_DIR.resolve():
        raise HTTPException(status_code=400, detail="Invalid upload path.")

    try:
        destination.write_bytes(content)
    except OSError:
        raise HTTPException(status_code=500, detail="The server could not store the image. Please try again.")

    return {
        "success": True,
        "image_url": f"/uploads/evidence/{stored_filename}"
    }

@app.get("/api/reference-data")
def get_official_reference_data():
    """
    SECTION A: OFFICIAL REFERENCE DATA
    Publicly Available BMC/Mumbai 2024 Civic Complaint Statistics.
    """
    return OFFICIAL_BMC_2024_REFERENCE

@app.get("/api/simulation-data")
def get_prototype_simulation_data():
    """
    SECTION B: AAPKE LOG PLATFORM DATA
    Prototype Simulation Data modeled after Mumbai civic patterns.
    """
    return SIMULATION_SUMMARY

@app.get("/api/simulation-records")
def get_simulation_records(limit: int = 100, ward: Optional[str] = None, category: Optional[str] = None):
    records = CACHED_SYNTHETIC_RECORDS
    if ward:
        records = [r for r in records if r["ward"] == ward]
    if category:
        records = [r for r in records if r["category"] == category]
    return {
        "total_simulated": len(CACHED_SYNTHETIC_RECORDS),
        "filtered_count": len(records),
        "sample": records[:limit]
    }

@app.get("/api/societies")
def get_societies():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM societies ORDER BY name").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/solvers")
def get_solvers(solver_type: Optional[str] = None):
    conn = get_db_connection()
    query = "SELECT * FROM solvers"
    params = []
    if solver_type and solver_type != "All":
        query += " WHERE type = ?"
        params.append(solver_type)
    query += " ORDER BY name"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["skills"] = json.loads(d["skills_json"])
        result.append(d)
    return result

@app.get("/api/students")
def get_students(university_id: Optional[str] = None):
    conn = get_db_connection()
    query = "SELECT * FROM students"
    params = []
    if university_id:
        query += " WHERE university_id = ?"
        params.append(university_id)
    rows = conn.execute(query, params).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["skills"] = json.loads(d["skills_json"])
        result.append(d)
    return result

@app.get("/api/faculty")
def get_faculty(university_id: Optional[str] = None):
    conn = get_db_connection()
    query = "SELECT * FROM faculty"
    params = []
    if university_id:
        query += " WHERE university_id = ?"
        params.append(university_id)
    rows = conn.execute(query, params).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["expertise"] = json.loads(d["expertise_json"])
        result.append(d)
    return result

@app.get("/api/problems")
def get_problems(
    status: Optional[str] = None,
    ward: Optional[str] = None,
    category: Optional[str] = None,
    threat_level: Optional[str] = None,
    society_id: Optional[str] = None,
    solver: Optional[str] = None,
    search: Optional[str] = None,
    help_voter_type: Optional[str] = None,
    help_voter_id: Optional[str] = None
):
    """
    ORDERING RULE:
    Strictly order by Threat Level first: HIGH -> MEDIUM -> LOW.
    Within the same threat level, sort by Community Votes as secondary signal.
    """
    conn = get_db_connection()
    query = "SELECT * FROM problems WHERE 1=1"
    params = []
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)
    if ward and ward != "All":
        query += " AND ward = ?"
        params.append(ward)
    if category and category != "All":
        query += " AND (ai_category = ? OR initial_category = ?)"
        params.extend([category, category])
    if threat_level and threat_level != "All":
        query += " AND threat_level = ?"
        params.append(threat_level)
    if society_id:
        query += " AND society_id = ?"
        params.append(society_id)
    if solver:
        query += " AND assigned_solver LIKE ?"
        params.append(f"%{solver}%")
    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    query += """
    ORDER BY 
        CASE threat_level 
            WHEN 'HIGH' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'LOW' THEN 3 
            ELSE 4 
        END ASC, 
        community_votes DESC, 
        created_at DESC
    """
    rows = conn.execute(query, params).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["required_skills"] = json.loads(d["required_skills_json"])
        _add_society_impact_metrics(conn, d)
        if help_voter_type and help_voter_id:
            d["has_help_voted"] = bool(conn.execute("""
                SELECT 1 FROM support_votes
                WHERE problem_id = ? AND voter_type = ? AND voter_id = ?
            """, (d["id"], help_voter_type, help_voter_id)).fetchone())
        result.append(d)
    conn.close()
    return result

@app.get("/api/problems/{problem_id}")
def get_problem_detail(problem_id: str):
    process_expired_escalations()
    conn = get_db_connection()
    p_row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
    if not p_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")
    problem = dict(p_row)
    problem["required_skills"] = json.loads(problem["required_skills_json"])
    _add_society_impact_metrics(conn, problem)

    # Associated Help Requests
    hr_rows = conn.execute("SELECT * FROM help_requests WHERE problem_id = ?", (problem_id,)).fetchall()
    problem["help_requests"] = [dict(hr) for hr in hr_rows]

    # Associated Help Offers (University & Industry)
    ho_rows = conn.execute("SELECT * FROM help_offers WHERE problem_id = ? ORDER BY created_at DESC", (problem_id,)).fetchall()
    problem["help_offers"] = [dict(ho) for ho in ho_rows]

    # Associated Project
    prj_row = conn.execute("SELECT * FROM projects WHERE problem_id = ?", (problem_id,)).fetchone()
    if prj_row:
        prj = dict(prj_row)
        prj["collaborators"] = json.loads(prj["collaborators_json"]) if prj.get("collaborators_json") else []
        prj["stages"] = json.loads(prj["stages_json"]) if prj.get("stages_json") else build_default_dynamic_stages(problem["ai_category"], prj["current_stage"], prj["progress_percent"])
        problem["project"] = prj
    else:
        # Fallback dynamic stages if project record doesn't exist yet
        problem["project"] = {
            "current_stage": problem["project_stage"] or "Verification",
            "progress_percent": problem["project_progress"] or 10,
            "stages": build_default_dynamic_stages(problem["ai_category"], problem["project_stage"] or "Verification", problem["project_progress"] or 10),
            "ai_stage_recommendation": "Phase 1 initial verification protocol active.",
            "latest_update": "Challenge registered by verified society.",
            "next_milestone": "Solver scoping & team formation"
        }

    # Associated Official Team
    tm_row = conn.execute("SELECT * FROM teams WHERE problem_id = ?", (problem_id,)).fetchone()
    if tm_row:
        tm = dict(tm_row)
        tm["members"] = json.loads(tm["members_json"])
        problem["team"] = tm
    else:
        problem["team"] = None

    # Associated Citizen Support Offers
    cso_rows = conn.execute("SELECT * FROM citizen_support_offers WHERE problem_id = ? ORDER BY created_at DESC", (problem_id,)).fetchall()
    problem["citizen_support_offers"] = [dict(c) for c in cso_rows]

    # Associated Feedbacks
    fb_rows = conn.execute("SELECT * FROM feedback WHERE problem_id = ? ORDER BY created_at DESC", (problem_id,)).fetchall()
    problem["feedbacks"] = [dict(f) for f in fb_rows]

    # Associated Escalation Ticket
    esc_row = conn.execute("SELECT * FROM escalation_tickets WHERE problem_id = ? ORDER BY created_at DESC", (problem_id,)).fetchone()
    problem["escalation_ticket"] = _enrich_escalation_ticket(conn, esc_row) if esc_row else None

    # Check if active citizen has voted
    problem["community_votes"] = problem.get("community_votes", 0)

    conn.close()
    return problem

@app.post("/api/problems/analyze")
def analyze_problem_draft(req: ProblemAnalysisRequest):
    """
    Runs structured AI intelligence on problem draft.
    Does NOT use chat. Returns structured JSON including dynamic solution stages.
    """
    conn = get_db_connection()
    existing_rows = conn.execute("SELECT id, title, description, ward, ai_category, initial_category, status FROM problems").fetchall()
    conn.close()
    existing = [dict(r) for r in existing_rows]

    analysis = AIAssistantEngine.analyze_problem(req.dict(), existing)
    return analysis

@app.post("/api/problems")
def create_problem(req: ProblemCreateRequest):
    """
    SOCIETY SUBMISSION WORKFLOW:
    Registers a new community problem. Only verified societies can submit.
    Runs full AI Problem Intelligence, assigns Threat Level (HIGH/MEDIUM/LOW + Why),
    categorization, similar problem detection, generates problem-specific stages,
    and dispatches initial Help Requests.
    IMPORTANT: DO NOT CREATE A TICKET HERE. Tickets are strictly for team failure.
    """
    conn = get_db_connection()

    # Rule: Check Society Verification
    soc = conn.execute("SELECT * FROM societies WHERE id = ?", (req.society_id,)).fetchone()
    if not soc or not soc["verified"]:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="Only verified societies and recognized community representatives can register societal problems."
        )

    existing_rows = conn.execute("SELECT id, title, description, ward, ai_category, initial_category, status FROM problems").fetchall()
    existing = [dict(r) for r in existing_rows]

    # Run Structured AI Intelligence
    ai_res = AIAssistantEngine.analyze_problem(req.dict(), existing)

    # Generate unique ID
    count_row = conn.execute("SELECT COUNT(*) FROM problems").fetchone()
    new_num = count_row[0] + 1
    prob_id = f"PRB-MUM-2026-{new_num:03d}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    default_image = req.evidence_image

    dyn_stages = ai_res.get("dynamic_stages") or AIAssistantEngine.generate_solution_stages(ai_res["category"])

    # Insert Problem with community_votes = 0
    conn.execute("""
    INSERT INTO problems (
        id, title, society_id, society_name, initial_category, ai_category, ai_subcategory,
        location, ward, people_affected, frequency, severity, description, evidence_image,
        additional_notes, status, threat_level, threat_reason, required_skills_json,
        recommended_solver, recommended_solver_reason, assigned_solver, project_stage,
        project_progress, escalation_level, community_votes, team_replacement_required, previous_teams_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Matched', ?, ?, ?, ?, ?, 'Pending Solver Acceptance', ?, 10, 0, 0, 0, '[]', ?)
    """, (
        prob_id, req.title, req.society_id, req.society_name, req.initial_category,
        ai_res["category"], ai_res["subcategory"], req.location, req.ward,
        req.people_affected, req.frequency, req.severity, req.description,
        default_image, req.additional_notes, ai_res["threat_level"],
        ai_res["threat_reason"], json.dumps(ai_res["required_skills"]),
        ai_res["recommended_solver"], ai_res["recommended_solver_reason"],
        dyn_stages[0]["name"] if dyn_stages else "Verification",
        now_iso
    ))

    # Initialize associated project with dynamic stages
    prj_id = f"PRJ-{prob_id[-3:]}"
    conn.execute("""
    INSERT INTO projects (
        id, problem_id, problem_title, society_name, ward, threat_level, lead_solver,
        collaborators_json, current_stage, stage_number, progress_percent,
        latest_update, next_milestone, expected_completion, stages_json, ai_stage_recommendation, started_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'Pending Solver Consortium', '[]', ?, 1, 10, 'Challenge submitted by verified society. Under BMC & solver review.', 'Solver acceptance & scoping', 'Within 14-21 days', ?, 'Verification phase active. Ready for solver review.', ?)
    """, (
        prj_id, prob_id, req.title, req.society_name, req.ward, ai_res["threat_level"],
        dyn_stages[0]["name"] if dyn_stages else "Verification",
        json.dumps(dyn_stages),
        now_iso
    ))

    # Dispatch official Help Requests to matched organizations
    for idx, match in enumerate(ai_res["smart_matches"]):
        hr_id = f"HR-{prob_id[-3:]}-{idx+1:02d}"
        role_needed = "Jurisdictional Excavation & Hydraulic Oversight" if match["type"] == "BMC" else ("Academic Research & Sensor Diagnostics" if match["type"] == "University" else "IoT Hardware & Telemetry Equipment")
        conn.execute("""
        INSERT INTO help_requests (id, problem_id, target_solver_type, target_solver_name, role_needed, status, response_window, created_at)
        VALUES (?, ?, ?, ?, ?, 'Pending', '24–48 hours', ?)
        """, (hr_id, prob_id, match["type"], match["entity"], role_needed, now_iso))

    conn.commit()
    conn.close()

    return {
        "problem_id": prob_id,
        "status": "Matched",
        "ai_analysis": ai_res,
        "dynamic_stages": dyn_stages,
        "message": "Community challenge registered successfully. Official help requests dispatched to recommended solvers."
    }

# ----------------- CITIZEN VOTING ENDPOINTS -----------------

@app.post("/api/problems/{problem_id}/vote")
def vote_problem(problem_id: str, req: CitizenVoteRequest):
    """
    CITIZEN VOTING RULES:
    1. Citizen must belong to the society that registered the problem (citizen.society_id == problem.society_id).
    2. ONE CITIZEN = ONE VOTE PER PROBLEM (UNIQUE constraint enforced).
    3. Citizen votes MUST NOT alter the AI Threat Level (HIGH/MEDIUM/LOW stays independent).
    4. Votes serve exclusively as community support and secondary sorting inside the same threat tier.
    """
    conn = get_db_connection()
    prob = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
    if not prob:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    # Strict Rule 1: Check Society Association
    if req.society_id != prob["society_id"]:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail=f"Restricted: You belong to society {req.society_id}. You can only vote on challenges belonging to your own society ({prob['society_name']})."
        )

    # Strict Rule 2: One Citizen = One Vote
    existing_vote = conn.execute(
        "SELECT id FROM citizen_votes WHERE citizen_id = ? AND problem_id = ?",
        (req.citizen_id, problem_id)
    ).fetchone()
    if existing_vote:
        conn.close()
        raise HTTPException(status_code=400, detail="You have already cast your vote on this community problem.")

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    vote_id = f"VOT-{problem_id[-3:]}-{req.citizen_id[-4:]}"

    conn.execute("""
    INSERT INTO citizen_votes (id, citizen_id, citizen_name, society_id, problem_id, voted_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (vote_id, req.citizen_id, req.citizen_name, req.society_id, problem_id, now_iso))

    # Increment community_votes. NOTE: Threat level remains untouched.
    conn.execute("UPDATE problems SET community_votes = community_votes + 1 WHERE id = ?", (problem_id,))
    conn.commit()

    updated_count = conn.execute("SELECT community_votes FROM problems WHERE id = ?", (problem_id,)).fetchone()[0]
    conn.close()

    return {
        "status": "success",
        "community_votes": updated_count,
        "message": "Community vote recorded successfully. (Note: Votes provide community support and do not alter AI threat level.)"
    }

@app.post("/api/problems/{problem_id}/help-vote")
def vote_to_help(problem_id: str, req: SupportVoteRequest):
    """
    Persistent willingness-to-help vote kept separate from citizen voting.
    One student or industry/startup entity may vote once per problem.
    """
    if req.voter_type not in {"StudentUniversity", "IndustryStartup"}:
        raise HTTPException(status_code=400, detail="Unsupported help-voter type.")
    contribution = (req.contribution or "").strip()
    if not contribution:
        raise HTTPException(
            status_code=422,
            detail="Please describe how you can help or contribute to this problem."
        )
    if len(contribution) > 2000:
        raise HTTPException(status_code=422, detail="Contribution must be 2,000 characters or fewer.")

    conn = get_db_connection()
    problem = conn.execute("SELECT id FROM problems WHERE id = ?", (problem_id,)).fetchone()
    if not problem:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    if req.voter_type == "StudentUniversity":
        voter = conn.execute("""
            SELECT st.id, st.name, st.university_id, s.name AS organization_name
            FROM students st
            JOIN solvers s ON s.id = st.university_id AND s.type = 'University'
            WHERE st.id = ? AND st.university_id = ?
        """, (req.voter_id, req.organization_id)).fetchone()
        if not voter:
            conn.close()
            raise HTTPException(status_code=403, detail="Student identity does not belong to the selected university.")
        voter_name = voter["name"]
        organization_name = voter["organization_name"]
    else:
        voter = conn.execute("""
            SELECT id, name FROM solvers
            WHERE id = ? AND type = 'Industry'
        """, (req.voter_id,)).fetchone()
        if not voter or req.organization_id != req.voter_id:
            conn.close()
            raise HTTPException(status_code=403, detail="Industry/startup identity is not valid.")
        voter_name = voter["name"]
        organization_name = voter["name"]

    if conn.execute("""
        SELECT 1 FROM support_votes
        WHERE problem_id = ? AND voter_type = ? AND voter_id = ?
    """, (problem_id, req.voter_type, req.voter_id)).fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="You have already voted to help with this problem.")

    vote_id = f"SUP-{uuid.uuid4().hex[:12].upper()}"
    now_iso = _iso_utc(_utc_now())
    bmc_notified_at = now_iso if req.voter_type == "IndustryStartup" else None
    bmc_notification_status = "Unread" if req.voter_type == "IndustryStartup" else "Not Applicable"
    try:
        conn.execute("""
            INSERT INTO support_votes (
                id, problem_id, voter_type, voter_id, voter_name,
                organization_id, organization_name, contribution, status,
                bmc_notified_at, bmc_notification_status, voted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?)
        """, (
            vote_id, problem_id, req.voter_type, req.voter_id, voter_name,
            req.organization_id, organization_name, contribution,
            bmc_notified_at, bmc_notification_status, now_iso
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="You have already voted to help with this problem.")

    counts = conn.execute("""
        SELECT
            SUM(CASE WHEN voter_type = 'StudentUniversity' THEN 1 ELSE 0 END) AS student_count,
            SUM(CASE WHEN voter_type = 'IndustryStartup' THEN 1 ELSE 0 END) AS industry_count
        FROM support_votes
        WHERE problem_id = ?
    """, (problem_id,)).fetchone()
    conn.close()

    return {
        "status": "success",
        "vote_id": vote_id,
        "student_university_help_count": counts["student_count"] or 0,
        "industry_startup_help_count": counts["industry_count"] or 0,
        "bmc_notification_sent": req.voter_type == "IndustryStartup",
        "bmc_notified_at": bmc_notified_at,
        "message": "Your Vote to Help has been recorded."
    }

@app.get("/api/problems/{problem_id}/university-support")
def get_university_support(problem_id: str):
    """Return saved Student/University contributions for BMC review."""
    conn = get_db_connection()
    problem = conn.execute(
        "SELECT id, title FROM problems WHERE id = ?",
        (problem_id,)
    ).fetchone()
    if not problem:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    rows = conn.execute("""
        SELECT id, problem_id, voter_id, voter_name, organization_id,
               organization_name, contribution, status, voted_at
        FROM support_votes
        WHERE problem_id = ? AND voter_type = 'StudentUniversity'
        ORDER BY voted_at DESC
    """, (problem_id,)).fetchall()
    support = [dict(row) for row in rows]
    conn.close()
    return {
        "problem_id": problem["id"],
        "problem_title": problem["title"],
        "support": support,
    }

@app.get("/api/problems/{problem_id}/industry-support")
def get_industry_support(problem_id: str):
    """Return saved Industry/Startup contributions for BMC review."""
    conn = get_db_connection()
    problem = conn.execute(
        "SELECT id, title FROM problems WHERE id = ?",
        (problem_id,)
    ).fetchone()
    if not problem:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    rows = conn.execute("""
        SELECT id, problem_id, voter_id, voter_name, organization_id,
               organization_name, contribution, status, voted_at,
               bmc_notified_at, bmc_notification_status
        FROM support_votes
        WHERE problem_id = ? AND voter_type = 'IndustryStartup'
        ORDER BY voted_at DESC
    """, (problem_id,)).fetchall()
    support = [dict(row) for row in rows]
    conn.close()
    return {
        "problem_id": problem["id"],
        "problem_title": problem["title"],
        "support": support,
    }

@app.get("/api/bmc/industry-support-notifications")
def get_bmc_industry_support_notifications():
    """Persistent BMC notification feed generated by Industry support submissions."""
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT sv.id, sv.problem_id, p.title AS problem_title,
               sv.voter_name, sv.organization_name, sv.contribution,
               sv.status AS support_status, sv.voted_at,
               sv.bmc_notified_at, sv.bmc_notification_status
        FROM support_votes sv
        JOIN problems p ON p.id = sv.problem_id
        WHERE sv.voter_type = 'IndustryStartup'
          AND COALESCE(TRIM(sv.contribution), '') <> ''
        ORDER BY COALESCE(sv.bmc_notified_at, sv.voted_at) DESC
    """).fetchall()
    notifications = [dict(row) for row in rows]
    conn.close()
    return {
        "recipient": "BMC Municipal Solver",
        "unread_count": sum(
            1 for row in notifications
            if row.get("bmc_notification_status") == "Unread"
        ),
        "notifications": notifications,
    }

@app.get("/api/citizen/my-society-problems")
def get_citizen_society_problems(society_id: str, citizen_id: Optional[str] = None):
    """
    Returns verified problems for the citizen's own society.
    Primary ordering: HIGH -> MEDIUM -> LOW.
    Secondary ordering: Community Votes DESC.
    Includes has_voted flag.
    """
    conn = get_db_connection()
    query = """
    SELECT * FROM problems 
    WHERE society_id = ?
    ORDER BY 
        CASE threat_level 
            WHEN 'HIGH' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'LOW' THEN 3 
            ELSE 4 
        END ASC, 
        community_votes DESC, 
        created_at DESC
    """
    rows = conn.execute(query, (society_id,)).fetchall()
    voted_prob_ids = set()
    if citizen_id:
        v_rows = conn.execute("SELECT problem_id FROM citizen_votes WHERE citizen_id = ?", (citizen_id,)).fetchall()
        voted_prob_ids = {r[0] for r in v_rows}

    result = []
    for r in rows:
        d = dict(r)
        d["required_skills"] = json.loads(d["required_skills_json"])
        d["has_voted"] = d["id"] in voted_prob_ids
        _add_society_impact_metrics(conn, d)
        result.append(d)
    conn.close()
    return result

# ----------------- HELP OFFERS (UNIVERSITY & INDUSTRY) -----------------

@app.post("/api/help-offers")
def submit_help_offer(req: HelpOfferCreateRequest):
    """
    CRITICAL WORKFLOW RULE:
    Universities and Industry partners can ONLY offer help.
    They cannot create official teams.
    """
    if req.solver_type not in ["University", "Industry"]:
        raise HTTPException(
            status_code=400,
            detail="Only University and Industry partners can submit help offers. BMC operates official municipal support directly."
        )

    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM help_offers").fetchone()[0]
    offer_id = f"HO-{count + 1:03d}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    conn.execute("""
    INSERT INTO help_offers (id, problem_id, solver_id, solver_name, solver_type, rating, expertise, experience, contribution, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)
    """, (offer_id, req.problem_id, req.solver_id, req.solver_name, req.solver_type, req.rating, req.expertise, req.experience, req.contribution, now_iso))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "offer_id": offer_id,
        "message": f"Help offer from {req.solver_name} submitted successfully for Society review and BMC team inclusion."
    }

@app.get("/api/problems/{problem_id}/help-offers")
def get_problem_help_offers(problem_id: str):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM help_offers WHERE problem_id = ? ORDER BY created_at DESC", (problem_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/help-offers/{offer_id}/action")
def society_help_offer_action(offer_id: str, req: HelpOfferActionRequest):
    """
    Society can ACCEPT or REJECT University and Industry offers.
    BMC support is automatically accepted.
    """
    conn = get_db_connection()
    offer = conn.execute("SELECT * FROM help_offers WHERE id = ?", (offer_id,)).fetchone()
    if not offer:
        conn.close()
        raise HTTPException(status_code=404, detail="Help offer not found")

    new_status = "Accepted" if req.action == "accept" else "Rejected"
    conn.execute("UPDATE help_offers SET status = ? WHERE id = ?", (new_status, offer_id))

    if req.action == "accept":
        prob = conn.execute("SELECT assigned_solver FROM problems WHERE id = ?", (offer["problem_id"],)).fetchone()
        curr = prob["assigned_solver"] or ""
        if offer["solver_name"] not in curr:
            updated = f"{curr} + {offer['solver_name']}" if curr and curr != "Pending Solver Acceptance" else offer["solver_name"]
            conn.execute("UPDATE problems SET assigned_solver = ? WHERE id = ?", (updated, offer["problem_id"]))

    conn.commit()
    conn.close()
    return {"status": "success", "offer_id": offer_id, "action": req.action, "offer_status": new_status}

@app.post("/api/help-requests/{hr_id}/action")
def solver_help_request_action(hr_id: str, action_data: HelpRequestAction):
    """
    Solver responds to dispatched system request.
    If solver is BMC, acceptance is automatic and official.
    """
    conn = get_db_connection()
    hr_row = conn.execute("SELECT * FROM help_requests WHERE id = ?", (hr_id,)).fetchone()
    if not hr_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Help request not found")

    problem_id = hr_row["problem_id"]
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    if action_data.action == "accept":
        new_status = "Accepted"
        accepted_at = now_iso
        accepted_by = f"{action_data.officer_name} ({action_data.solver_name})"

        conn.execute("""
        UPDATE help_requests 
        SET status = ?, accepted_at = ?, accepted_by = ?
        WHERE id = ?
        """, (new_status, accepted_at, accepted_by, hr_id))

        prob_row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
        current_assigned = prob_row["assigned_solver"]
        if not current_assigned or current_assigned == "Pending Solver Acceptance":
            updated_assigned = action_data.solver_name
        else:
            updated_assigned = current_assigned if action_data.solver_name in current_assigned else f"{current_assigned} + {action_data.solver_name}"

        conn.execute("""
        UPDATE problems 
        SET status = 'Help Accepted', assigned_solver = ?
        WHERE id = ?
        """, (updated_assigned, problem_id))

    elif action_data.action == "decline":
        conn.execute("UPDATE help_requests SET status = 'Declined' WHERE id = ?", (hr_id,))
    elif action_data.action == "request_info":
        conn.execute("UPDATE help_requests SET status = 'Info_Requested' WHERE id = ?", (hr_id,))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "action": action_data.action,
        "message": f"Help request {action_data.action}ed."
    }

# ----------------- OFFICIAL TEAM FORMATION (BMC / ADMIN ONLY) -----------------

@app.post("/api/teams/reset")
def reset_official_teams():
    """Demo reset that preserves problems and archives each current team before clearing it."""
    conn = get_db_connection()
    team_rows = conn.execute("SELECT * FROM teams").fetchall()
    reset_at = _iso_utc(_utc_now())

    for team_row in team_rows:
        team = dict(team_row)
        problem = conn.execute(
            "SELECT previous_teams_json FROM problems WHERE id = ?",
            (team["problem_id"],)
        ).fetchone()
        previous_teams = []
        if problem and problem["previous_teams_json"]:
            try:
                previous_teams = json.loads(problem["previous_teams_json"])
            except json.JSONDecodeError:
                previous_teams = []
        previous_teams.append({
            "team_title": team["team_title"],
            "created_by_solver": team["created_by_solver"],
            "members": json.loads(team["members_json"] or "[]"),
            "formed_at": team["formed_at"],
            "reset_at": reset_at,
            "reset_reason": "Hackathon demo reset",
        })
        conn.execute("""
            UPDATE problems
            SET status = 'Pending Team Formation',
                assigned_solver = 'No Team',
                previous_teams_json = ?
            WHERE id = ?
        """, (json.dumps(previous_teams), team["problem_id"]))

    conn.execute("DELETE FROM teams")
    conn.commit()
    conn.close()
    return {
        "status": "success",
        "reset_count": len(team_rows),
        "message": f"{len(team_rows)} team assignment(s) reset to No Team.",
    }

@app.post("/api/teams")
def form_official_team(req: TeamFormationRequest):
    """
    CRITICAL GOVERNANCE RULES:
    1. ONLY BMC / Government and Admin can create/finalize official teams.
    2. University CANNOT create teams. Industry CANNOT create teams.
    3. BMC options:
       A. WORK ALONE ('BMC Direct Implementation' - 'No External Team Required')
       B. CREATE TEAM WITH UNIVERSITY
       C. CREATE TEAM WITH INDUSTRY
       D. CREATE COMBINED TEAM (BMC + University + Industry)
    """
    conn = get_db_connection()
    prob_row = conn.execute("SELECT * FROM problems WHERE id = ?", (req.problem_id,)).fetchone()
    if not prob_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    creator = req.created_by_solver.lower()
    if "bmc" not in creator and "admin" not in creator and "municipal" not in creator and "government" not in creator:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: Only BMC / Municipal Government and Admin can form official solution teams. Universities and industries can only offer help."
        )

    team_id = f"TM-{req.problem_id[-3:]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    # Insert or update team
    conn.execute("""
    INSERT OR REPLACE INTO teams (id, problem_id, project_id, created_by_solver, team_title, members_json, formed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        team_id, req.problem_id, f"PRJ-{req.problem_id[-3:]}",
        req.created_by_solver, req.team_title, json.dumps(req.members), now_iso
    ))

    # Mark selected help offers as 'Selected for Team'
    for m in req.members:
        org_name = m.get("organization", "")
        conn.execute("UPDATE help_offers SET status = 'Selected for Team' WHERE problem_id = ? AND solver_name LIKE ?", (req.problem_id, f"%{org_name}%"))

    # Determine dynamic stages and progress
    dyn_stages = AIAssistantEngine.generate_solution_stages(prob_row["ai_category"])
    current_stage_name = dyn_stages[1]["name"] if len(dyn_stages) > 1 else "Assessment"
    dyn_stages[0]["status"] = "completed"
    if len(dyn_stages) > 1:
        dyn_stages[1]["status"] = "in_progress"

    conn.execute("""
    UPDATE problems 
    SET status = 'In Progress', project_stage = ?, project_progress = 35,
        assigned_solver = ?
    WHERE id = ?
    """, (current_stage_name, req.team_title, req.problem_id))

    conn.execute("""
    UPDATE projects
    SET current_stage = ?, progress_percent = 35,
        lead_solver = ?,
        latest_update = ?,
        next_milestone = 'Comprehensive on-site technical diagnostic & telemetry setup',
        stages_json = ?,
        ai_stage_recommendation = 'Official team mobilized. Initial diagnostic work underway.'
    WHERE problem_id = ?
    """, (
        current_stage_name, req.team_title,
        f"Official team '{req.team_title}' formed by BMC/Admin. Active work mobilized.",
        json.dumps(dyn_stages), req.problem_id
    ))

    conn.commit()
    conn.close()

    return {
        "team_id": team_id,
        "status": "Team Formed",
        "team_title": req.team_title,
        "message": f"Official team '{req.team_title}' formed successfully by authorized authority."
    }

# ----------------- DYNAMIC PROJECT STAGE ADVANCEMENT -----------------

@app.post("/api/projects/{problem_id}/update-stage")
def update_dynamic_project_stage(problem_id: str, stage_data: DynamicStageUpdateRequest):
    """
    Updates dynamic AI-generated stages.
    AI evaluates stage completion recommendation; authorized user finalizes official state change.
    """
    conn = get_db_connection()
    prj_row = conn.execute("SELECT * FROM projects WHERE problem_id = ?", (problem_id,)).fetchone()
    if not prj_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    stages = json.loads(prj_row["stages_json"]) if prj_row["stages_json"] else []
    
    # Update stage status in dynamic stages list
    for s in stages:
        if s["id"] < stage_data.stage_id:
            s["status"] = "completed"
        elif s["id"] == stage_data.stage_id:
            s["status"] = "completed" if stage_data.completed else "in_progress"
        else:
            s["status"] = "pending"

    # If marked completed, set next stage to in_progress if exists
    if stage_data.completed and stage_data.stage_id < len(stages):
        stages[stage_data.stage_id]["status"] = "in_progress"
        active_stage_name = stages[stage_data.stage_id]["name"]
    else:
        active_stage_name = stage_data.stage_name

    completed_count = sum(1 for s in stages if s["status"] == "completed")
    total_stages = max(len(stages), 1)
    computed_progress = int((completed_count / total_stages) * 100) if not stage_data.completed else max(stage_data.progress_percent, int((completed_count / total_stages) * 100))

    is_final = completed_count >= total_stages or active_stage_name in ["Community Review", "Society Review", "Solved"]
    prob_status = "Solved" if is_final else "In Progress"

    # AI progress evaluation
    ai_eval = AIAssistantEngine.evaluate_stage_progress(active_stage_name, computed_progress, True)

    conn.execute("""
    UPDATE projects
    SET current_stage = ?, progress_percent = ?, latest_update = ?, next_milestone = ?,
        stages_json = ?, ai_stage_recommendation = ?
    WHERE problem_id = ?
    """, (active_stage_name, computed_progress, stage_data.latest_update, stage_data.next_milestone, json.dumps(stages), ai_eval["recommendation"], problem_id))

    conn.execute("""
    UPDATE problems
    SET project_stage = ?, project_progress = ?, status = ?
    WHERE id = ?
    """, (active_stage_name, computed_progress, prob_status, problem_id))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "stage": active_stage_name,
        "progress": computed_progress,
        "ai_recommendation": ai_eval["recommendation"],
        "stages": stages
    }

# ----------------- CITIZEN SUPPORT OFFERS -----------------

@app.post("/api/citizen-offers")
def submit_citizen_support_offer(req: CitizenOfferRequest):
    """
    CITIZEN ROLE:
    Citizens can offer voluntary assistance (local data, photos, volunteer work).
    Does NOT count as official solver acceptance.
    Does NOT change official problem status.
    """
    conn = get_db_connection()
    count_row = conn.execute("SELECT COUNT(*) FROM citizen_support_offers").fetchone()
    cso_id = f"CSO-{count_row[0] + 1:03d}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    conn.execute("""
    INSERT INTO citizen_support_offers (id, problem_id, citizen_name, contact_email, support_type, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?)
    """, (cso_id, req.problem_id, req.citizen_name, req.contact_email, req.support_type, req.description, now_iso))

    conn.commit()
    conn.close()

    return {
        "id": cso_id,
        "status": "Submitted",
        "message": "Citizen voluntary support offer recorded. The official solver team will review your offer."
    }

# ----------------- POST-RESOLUTION FEEDBACK -----------------

@app.post("/api/feedback")
def submit_feedback(req: FeedbackSubmitRequest):
    """
    RATE THE SOLUTION:
    Post-resolution satisfaction feedback from society representatives or citizens.
    """
    conn = get_db_connection()
    count_row = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()
    fb_id = f"FB-{count_row[0] + 1:03d}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    conn.execute("""
    INSERT INTO feedback (
        id, problem_id, submitted_by_type, submitter_name, satisfaction_stars,
        problem_actually_solved, rating_speed, rating_communication, rating_quality,
        rating_helpfulness, improvement_suggestions, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        fb_id, req.problem_id, req.submitted_by_type, req.submitter_name,
        req.satisfaction_stars, req.problem_actually_solved, req.rating_speed,
        req.rating_communication, req.rating_quality, req.rating_helpfulness,
        req.improvement_suggestions, now_iso
    ))

    conn.commit()
    conn.close()

    return {"feedback_id": fb_id, "message": "Thank you! Your feedback has been recorded for community transparency."}

# ----------------- ESCALATION TICKETS & TEAM REPLACEMENT -----------------

@app.post("/api/escalations")
def create_escalation_ticket(req: EscalationCreateRequest):
    """
    CRITICAL WORKFLOW RULES:
    1. A ticket exists ONLY when the responsible team fails to perform or complete work.
       DO NOT create a ticket when society first submits a problem.
    2. Every new ticket ALWAYS starts at LEVEL 1. Never skip Level 1.
    """
    process_expired_escalations()
    _validate_ticket_evidence_reference(req.evidence)

    conn = get_db_connection()
    prob = conn.execute("SELECT * FROM problems WHERE id = ?", (req.problem_id,)).fetchone()
    if not prob:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    active = conn.execute("""
        SELECT id FROM escalation_tickets
        WHERE problem_id = ?
          AND ticket_status NOT IN ('Resolved', 'Closed', 'Team Replaced - In Progress')
        LIMIT 1
    """, (req.problem_id,)).fetchone()
    if active:
        conn.close()
        raise HTTPException(status_code=409, detail=f"An active escalation ticket already exists for this problem: {active['id']}.")

    next_num = conn.execute("""
        SELECT COALESCE(MAX(CAST(substr(id, -3) AS INTEGER)), 0) + 1
        FROM escalation_tickets
    """).fetchone()[0]
    esc_id = f"ESC-2026-{next_num:03d}"
    now = _utc_now()
    now_iso = _iso_utc(now)
    deadline_iso = _iso_utc(now + datetime.timedelta(days=ESCALATION_LEVEL_DAYS[1]))
    assigned_solver = prob["assigned_solver"] or prob["recommended_solver"] or "Unassigned"
    responsible_officer = _resolve_responsible_officer(conn, prob)

    ticket_status = "Level 1 - Team Action Required"
    initial_event = "Ticket created at Level 1. Platform Support Review started with a 5-day deadline."
    initial_history = [{
        "level": 1,
        "timestamp": now_iso,
        "event": initial_event,
        "deadline": deadline_iso,
        "automatic": False,
    }]
    notifications = _make_notifications(
        1, responsible_officer, assigned_solver, deadline_iso,
        f"New Level 1 ticket {esc_id}: {req.reason}"
    )

    conn.execute("""
    INSERT INTO escalation_tickets (
        id, problem_id, society_name, reason, previous_solver, current_status,
        what_remains_unresolved, evidence, additional_notes, escalation_level,
        delay_duration, team_response, history_json, replacement_requested,
        admin_notes, ticket_status, level_started_at, current_deadline, updated_at,
        responsible_officer, completion_report, completion_reported_at,
        official_action_required, notifications_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '5 Days', 'Awaiting responsible team initial response.', ?, 0, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, ?, ?)
    """, (
        esc_id, req.problem_id, req.society_name, req.reason, assigned_solver,
        prob["status"], req.what_remains_unresolved, req.evidence,
        req.additional_notes, json.dumps(initial_history), initial_event, ticket_status,
        now_iso, deadline_iso, now_iso, responsible_officer,
        json.dumps(notifications), now_iso
    ))

    conn.execute("UPDATE problems SET status = 'Escalated', escalation_level = 1 WHERE id = ?", (req.problem_id,))

    conn.commit()
    conn.close()

    return {
        "escalation_id": esc_id,
        "escalation_level": 1,
        "ticket_status": ticket_status,
        "current_deadline": deadline_iso,
        "responsible_officer": responsible_officer,
        "assigned_solver": assigned_solver,
        "message": f"Ticket {esc_id} created at Level 1. The responsible officer and solver have 5 days to respond."
    }

@app.get("/api/escalations/{ticket_id}")
def get_escalation_ticket(ticket_id: str):
    process_expired_escalations()
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM escalation_tickets WHERE id = ?", (ticket_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Escalation ticket not found")
    ticket = _enrich_escalation_ticket(conn, row)
    conn.close()
    return ticket

def _validate_progress_report(content: bytes, extension: str, content_type: str) -> None:
    allowed = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    if extension not in allowed or content_type != allowed[extension]:
        raise HTTPException(status_code=415, detail="Progress reports must be PDF, DOC, or DOCX files.")
    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid PDF.")
    if extension == ".doc" and not content.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid DOC document.")
    if extension == ".docx":
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                names = set(archive.namelist())
                if "[Content_Types].xml" not in names or "word/document.xml" not in names:
                    raise HTTPException(status_code=415, detail="The uploaded file is not a valid DOCX document.")
        except zipfile.BadZipFile:
            raise HTTPException(status_code=415, detail="The uploaded file is not a valid DOCX document.")

@app.post("/api/escalations/{ticket_id}/attachments")
async def upload_ticket_attachment(
    ticket_id: str,
    attachment_type: str = Form(...),
    uploaded_by: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Attach a validated progress report or field-work image to an escalation
    ticket without resolving it or changing its deadline/level.
    """
    process_expired_escalations()
    if attachment_type not in {"progress_report", "field_evidence"}:
        raise HTTPException(status_code=400, detail="Unsupported ticket attachment type.")
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Please choose a file to upload.")

    original_name = Path(file.filename).name
    original_name = "".join(
        char if char.isalnum() or char in {" ", ".", "_", "-"} else "_"
        for char in original_name
    )[:150] or "attachment"
    extension = Path(original_name).suffix.lower()
    content_type = (file.content_type or "").lower()
    max_size = MAX_PROGRESS_REPORT_SIZE if attachment_type == "progress_report" else MAX_EVIDENCE_SIZE

    content = bytearray()
    try:
        while chunk := await file.read(1024 * 1024):
            content.extend(chunk)
            if len(content) > max_size:
                limit = "10 MB" if attachment_type == "progress_report" else "5 MB"
                raise HTTPException(status_code=413, detail=f"File must be smaller than {limit}.")
    finally:
        await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="The selected file is empty.")

    if attachment_type == "progress_report":
        _validate_progress_report(bytes(content), extension, content_type)
        destination_dir = TICKET_REPORT_DIR
    else:
        expected_extension = ALLOWED_EVIDENCE_TYPES.get(content_type)
        if extension not in ALLOWED_EVIDENCE_EXTENSIONS or not expected_extension:
            raise HTTPException(status_code=415, detail="Field evidence must be a JPG, PNG, or WEBP image.")
        if content_type == "image/jpeg":
            if extension not in {".jpg", ".jpeg"}:
                raise HTTPException(status_code=415, detail="The file extension does not match the image type.")
            stored_extension = ".jpg"
        elif extension != expected_extension:
            raise HTTPException(status_code=415, detail="The file extension does not match the image type.")
        else:
            stored_extension = expected_extension
        if not _validate_image_signature(bytes(content), content_type):
            raise HTTPException(status_code=415, detail="The uploaded file is not a valid supported image.")
        extension = stored_extension
        destination_dir = TICKET_FIELD_EVIDENCE_DIR

    conn = get_db_connection()
    ticket_row = conn.execute("SELECT * FROM escalation_tickets WHERE id = ?", (ticket_id,)).fetchone()
    if not ticket_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Escalation ticket not found.")

    stored_filename = f"{uuid.uuid4().hex}{extension}"
    destination = (destination_dir / stored_filename).resolve()
    if destination.parent != destination_dir.resolve():
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid attachment path.")

    try:
        destination.write_bytes(content)
    except OSError:
        conn.close()
        raise HTTPException(status_code=500, detail="The server could not store the attachment.")

    relative_path = destination.relative_to(UPLOADS_DIR).as_posix()
    metadata = {
        "type": attachment_type,
        "url": f"/uploads/{relative_path}",
        "original_name": original_name,
        "content_type": content_type,
        "size_bytes": len(content),
        "uploaded_at": _iso_utc(_utc_now()),
        "uploaded_by": uploaded_by,
    }
    column = "progress_reports_json" if attachment_type == "progress_report" else "field_evidence_json"
    attachments = json.loads(ticket_row[column] or "[]")
    attachments.append(metadata)
    history = json.loads(ticket_row["history_json"] or "[]")
    history.append({
        "action": attachment_type,
        "timestamp": metadata["uploaded_at"],
        "team": uploaded_by,
        "response": f"Uploaded {original_name}",
    })
    conn.execute(f"""
        UPDATE escalation_tickets
        SET {column} = ?, history_json = ?, team_response = ?, updated_at = ?
        WHERE id = ?
    """, (
        json.dumps(attachments),
        json.dumps(history),
        f"{uploaded_by} uploaded {original_name}.",
        metadata["uploaded_at"],
        ticket_id,
    ))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "ticket_id": ticket_id,
        "attachment": metadata,
        "message": "Progress report uploaded." if attachment_type == "progress_report" else "Field evidence uploaded.",
    }

@app.post("/api/admin/escalation/{ticket_id}/action")
@app.post("/api/escalations/{ticket_id}/advance")
def advance_escalation_ticket(ticket_id: str, action: AdminEscalationAction):
    """
    Manual Level 2/3 escalation is prohibited. Those transitions are performed
    only by process_expired_escalations() from stored deadlines.
    """
    process_expired_escalations()
    conn = get_db_connection()
    t_row = conn.execute("SELECT * FROM escalation_tickets WHERE id = ?", (ticket_id,)).fetchone()
    if not t_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_level = action.new_level
    now_iso = _iso_utc(_utc_now())
    history = json.loads(t_row["history_json"]) if t_row["history_json"] else []

    if new_level in (2, 3):
        conn.close()
        raise HTTPException(
            status_code=409,
            detail="Level 2 and Level 3 are activated automatically only after the current stored deadline expires."
        )

    if new_level >= 4:
        ticket_status = "Government/Admin Action Required"
        official_action_required = 1
        history.append({
            "level": t_row["escalation_level"],
            "timestamp": now_iso,
            "event": action.admin_notes or "Government/Admin action acknowledged.",
            "automatic": False,
        })
    else:
        ticket_status = "Resolved"
        official_action_required = 0
        history.append({
            "level": 0,
            "timestamp": now_iso,
            "event": action.admin_notes or "Ticket resolved after corrective action review.",
            "automatic": False,
        })
        conn.execute(
            "UPDATE problems SET status = 'In Progress', escalation_level = 0 WHERE id = ?",
            (t_row["problem_id"],)
        )

    conn.execute("""
        UPDATE escalation_tickets
        SET admin_notes = ?, ticket_status = ?, history_json = ?,
            official_action_required = ?, updated_at = ?
        WHERE id = ?
    """, (
        action.admin_notes,
        ticket_status,
        json.dumps(history),
        official_action_required,
        now_iso,
        ticket_id,
    ))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "ticket_id": ticket_id,
        "new_level": t_row["escalation_level"],
        "ticket_status": ticket_status,
        "official_action_required": official_action_required
    }

@app.post("/api/escalations/{ticket_id}/team-response")
def team_submit_response(ticket_id: str, req: TeamResponseRequest):
    """
    Responsible team responds to ticket raised against them:
    [ACKNOWLEDGE], [RESPOND], [SUBMIT PROGRESS], [UPLOAD EVIDENCE], [MARK WORK COMPLETED].
    """
    process_expired_escalations()
    conn = get_db_connection()
    t_row = conn.execute("SELECT * FROM escalation_tickets WHERE id = ?", (ticket_id,)).fetchone()
    if not t_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    now_iso = _iso_utc(_utc_now())
    history = json.loads(t_row["history_json"]) if t_row["history_json"] else []
    history.append({
        "action": req.action_taken,
        "timestamp": now_iso,
        "team": req.team_name,
        "response": req.response_text
    })

    if req.action_taken == "mark_completed":
        conn.execute("""
            UPDATE escalation_tickets
            SET team_response = ?, completion_report = ?, completion_reported_at = ?,
                ticket_status = 'Completion Report Submitted - Awaiting Review',
                history_json = ?, admin_notes = ?, current_deadline = NULL,
                official_action_required = 0, updated_at = ?
            WHERE id = ?
        """, (
            req.response_text,
            req.response_text,
            now_iso,
            json.dumps(history),
            "Completion report submitted before automatic escalation.",
            now_iso,
            ticket_id,
        ))
    else:
        conn.execute("""
            UPDATE escalation_tickets
            SET team_response = ?, history_json = ?, admin_notes = ?, updated_at = ?
            WHERE id = ?
        """, (
            req.response_text,
            json.dumps(history),
            f"Team response logged: {req.action_taken}",
            now_iso,
            ticket_id,
        ))

    conn.commit()
    conn.close()

    return {"status": "success", "ticket_id": ticket_id, "message": "Team response and progress update logged."}

@app.post("/api/admin/replace-team/{problem_id}")
def admin_replace_team(problem_id: str, req: TeamReplacementRequest):
    """
    CRITICAL WORKFLOW RULES:
    After Level 3 failure:
    1. DO NOT restart from stage zero!
    2. Completed stages remain completed.
    3. Old team is reassigned / recorded in history.
    4. New official team formed by BMC/Admin.
    5. Problem continues from the existing stage.
    """
    conn = get_db_connection()
    prob = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
    if not prob:
        conn.close()
        raise HTTPException(status_code=404, detail="Problem not found")

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    prev_teams = json.loads(prob["previous_teams_json"]) if prob["previous_teams_json"] else []
    prev_teams.append({
        "team_title": prob["assigned_solver"],
        "reassigned_date": now_iso[:10],
        "reason": "Level 3 SLA breach - work incomplete after 18+ days"
    })

    new_team_id = f"TM-REP-{problem_id[-3:]}"
    conn.execute("""
    INSERT OR REPLACE INTO teams (id, problem_id, project_id, created_by_solver, team_title, members_json, formed_at)
    VALUES (?, ?, ?, 'BMC / City Command Admin', ?, ?, ?)
    """, (new_team_id, problem_id, f"PRJ-{problem_id[-3:]}", req.new_team_title, json.dumps(req.members), now_iso))

    # Update problem: remove replacement required flag, retain project_stage and progress!
    conn.execute("""
    UPDATE problems 
    SET assigned_solver = ?,
        team_replacement_required = 0,
        previous_teams_json = ?,
        status = 'In Progress',
        escalation_level = 0
    WHERE id = ?
    """, (req.new_team_title, json.dumps(prev_teams), problem_id))

    # Update project: update latest update and lead solver, retain completed stages!
    conn.execute("""
    UPDATE projects
    SET lead_solver = ?,
        latest_update = ?,
        ai_stage_recommendation = 'New official team deployed. Resuming remediation from existing milestone.'
    WHERE problem_id = ?
    """, (
        req.new_team_title,
        f"New official replacement team '{req.new_team_title}' mobilized by BMC/Admin. Work continues from current stage without resetting progress.",
        problem_id
    ))

    # Update associated ticket status
    conn.execute("""
    UPDATE escalation_tickets
    SET ticket_status = 'Team Replaced - In Progress',
        replacement_requested = 0,
        official_action_required = 0,
        current_deadline = NULL,
        admin_notes = ?,
        updated_at = ?
    WHERE problem_id = ?
    """, (
        f"Replaced team with {req.new_team_title}. Project continuity preserved.",
        now_iso,
        problem_id
    ))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "problem_id": problem_id,
        "new_team": req.new_team_title,
        "message": f"New team '{req.new_team_title}' mobilized successfully. Project progress preserved and continuing."
    }

# ----------------- ADMIN DASHBOARD & DEPARTMENT ACCOUNTABILITY -----------------

@app.get("/api/admin/overview")
def get_admin_overview():
    """
    ADMIN COMMAND & DEPARTMENT ACCOUNTABILITY OVERVIEW
    Aggregates Section A (Official BMC 2024 Reference) & Section B (Simulation Data),
    department ticket analytics, live escalation queue, team replacement queue, and feedback metrics.
    """
    process_expired_escalations()
    conn = get_db_connection()

    total_probs = conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0]
    unresolved_count = conn.execute("SELECT COUNT(*) FROM problems WHERE status NOT IN ('Solved', 'Resolved')").fetchone()[0]
    solved_count = conn.execute("SELECT COUNT(*) FROM problems WHERE status = 'Solved'").fetchone()[0]
    escalated_count = conn.execute("SELECT COUNT(*) FROM escalation_tickets WHERE ticket_status != 'Resolved'").fetchone()[0]

    # Real Department Accountability Metrics derived from problem/ticket rows.
    dept_rows = conn.execute("""
        SELECT
            COALESCE(p.ai_category, p.initial_category, 'Uncategorized') AS department,
            COUNT(e.id) AS total,
            SUM(CASE WHEN e.ticket_status NOT IN ('Resolved', 'Closed', 'Team Replaced - In Progress') THEN 1 ELSE 0 END) AS open,
            SUM(CASE WHEN e.escalation_level = 1 THEN 1 ELSE 0 END) AS level1,
            SUM(CASE WHEN e.escalation_level = 2 THEN 1 ELSE 0 END) AS level2,
            SUM(CASE WHEN e.escalation_level = 3 THEN 1 ELSE 0 END) AS level3,
            SUM(CASE WHEN e.ticket_status IN ('Resolved', 'Closed', 'Team Replaced - In Progress') THEN 1 ELSE 0 END) AS resolved,
            AVG(MAX(0, julianday('now') - julianday(e.created_at))) AS avg_age_days
        FROM escalation_tickets e
        JOIN problems p ON p.id = e.problem_id
        GROUP BY COALESCE(p.ai_category, p.initial_category, 'Uncategorized')
        ORDER BY open DESC, total DESC, department ASC
    """).fetchall()
    dept_tickets = [{
        "department": row["department"],
        "total": row["total"] or 0,
        "open": row["open"] or 0,
        "level1": row["level1"] or 0,
        "level2": row["level2"] or 0,
        "level3": row["level3"] or 0,
        "resolved": row["resolved"] or 0,
        "avg_age_days": round(row["avg_age_days"] or 0, 1),
    } for row in dept_rows]

    # Live Feedback Metrics
    fb_stats = conn.execute("""
    SELECT 
        COUNT(*) as total_feedback,
        AVG(satisfaction_stars) as avg_satisfaction,
        AVG(rating_speed) as avg_speed,
        AVG(rating_quality) as avg_quality,
        SUM(CASE WHEN problem_actually_solved = 'YES' THEN 1 ELSE 0 END) as count_yes,
        SUM(CASE WHEN problem_actually_solved = 'PARTIALLY' THEN 1 ELSE 0 END) as count_partially,
        SUM(CASE WHEN problem_actually_solved = 'NO' THEN 1 ELSE 0 END) as count_no
    FROM feedback
    """).fetchone()

    # Live Escalation Queue
    esc_rows = conn.execute("SELECT * FROM escalation_tickets ORDER BY escalation_level DESC, created_at DESC").fetchall()
    now = _utc_now()
    escalations = [_enrich_escalation_ticket(conn, e, now) for e in esc_rows]

    # Team Replacement Queue (Level 3 Failures)
    rep_rows = conn.execute("SELECT * FROM problems WHERE team_replacement_required = 1").fetchall()
    team_replacement_queue = [dict(r) for r in rep_rows]

    # Help Offers Summary
    ho_rows = conn.execute("SELECT * FROM help_offers ORDER BY created_at DESC").fetchall()
    help_offers = [dict(h) for h in ho_rows]

    recent_fb = conn.execute("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5").fetchall()

    conn.close()

    return {
        "section_a_official": OFFICIAL_BMC_2024_REFERENCE,
        "section_b_simulation": SIMULATION_SUMMARY,
        "department_tickets": dept_tickets,
        "live_metrics": {
            "total_problems": total_probs,
            "unresolved_count": unresolved_count,
            "solved_count": solved_count,
            "escalated_count": escalated_count,
            "team_replacements_needed": len(team_replacement_queue),
            "feedback": {
                "total": fb_stats["total_feedback"] or 0,
                "avg_satisfaction": round(fb_stats["avg_satisfaction"] or 4.8, 1),
                "avg_speed": round(fb_stats["avg_speed"] or 4.7, 1),
                "avg_quality": round(fb_stats["avg_quality"] or 4.9, 1),
                "resolved_yes": fb_stats["count_yes"] or 0,
                "resolved_partially": fb_stats["count_partially"] or 0,
                "resolved_no": fb_stats["count_no"] or 0
            }
        },
        "escalations": escalations,
        "team_replacement_queue": team_replacement_queue,
        "help_offers": help_offers,
        "recent_feedback": [dict(f) for f in recent_fb]
    }

@app.post("/api/admin/verify-society/{society_id}")
def admin_verify_society(society_id: str):
    conn = get_db_connection()
    now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    conn.execute("UPDATE societies SET verified = 1, verification_date = ? WHERE id = ?", (now_iso, society_id))
    conn.commit()
    conn.close()
    return {"status": "success", "society_id": society_id, "verified": True}

# ----------------- STATIC FRONTEND HOSTING -----------------
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

@app.get("/")
def serve_index():
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "AAPKE LOG Backend API is operational. Frontend index.html not found."}
