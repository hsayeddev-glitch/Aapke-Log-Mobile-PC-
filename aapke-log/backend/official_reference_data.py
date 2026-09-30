"""
AAPKE LOG - Official Reference Data
Source: Publicly Available BMC / Mumbai 2024 Civic Complaint Statistics
Note: Strictly labeled as "Publicly Available BMC/Mumbai 2024 Reference Data".
Never confused with Aapke Log prototype simulation data.
"""

OFFICIAL_BMC_2024_REFERENCE = {
    "title": "Publicly Available BMC/Mumbai 2024 Reference Data",
    "disclaimer": "Mumbai-focused prototype inspired by publicly available BMC civic complaint data. Unclosed complaints are designated strictly as 'NOT CLOSED' (not confirmed pending).",
    "total_complaints": 115396,
    "closed": 88308,
    "not_closed": 27088,
    "closure_rate_percent": 76.53,  # ~77%
    "average_resolution_days": 41,
    
    # 24 Official BMC Wards
    "ward_analysis": [
        {"ward": "K/E", "name": "Andheri East, Jogeshwari East", "complaints": 8145, "high_volume": True},
        {"ward": "K/W", "name": "Andheri West, Vile Parle West, Juhu", "complaints": 7945, "high_volume": True},
        {"ward": "P/N", "name": "Malad, Marve, Manori", "complaints": 7327, "high_volume": True},
        {"ward": "L", "name": "Kurla, Chunabhatti, Sakinaka", "complaints": 7047, "high_volume": True},
        {"ward": "S", "name": "Bhandup, Powai, Vikhroli", "complaints": 6221, "high_volume": True},
        {"ward": "G/N", "name": "Dadar West, Mahim, Dharavi", "complaints": 5840, "high_volume": False},
        {"ward": "H/W", "name": "Bandra West, Khar, Santacruz West", "complaints": 5712, "high_volume": False},
        {"ward": "P/S", "name": "Goregaon West & East", "complaints": 5420, "high_volume": False},
        {"ward": "F/N", "name": "Matunga, Sion, Wadala", "complaints": 5210, "high_volume": False},
        {"ward": "N", "name": "Ghatkopar, Vikhroli West", "complaints": 5104, "high_volume": False},
        {"ward": "R/C", "name": "Borivali, Gorai", "complaints": 4980, "high_volume": False},
        {"ward": "R/S", "name": "Kandivali East & West", "complaints": 4825, "high_volume": False},
        {"ward": "M/W", "name": "Chembur West, Tilak Nagar", "complaints": 4650, "high_volume": False},
        {"ward": "H/E", "name": "Santacruz East, Khar East", "complaints": 4510, "high_volume": False},
        {"ward": "M/E", "name": "Govandi, Mankhurd, Trombay", "complaints": 4320, "high_volume": False},
        {"ward": "G/S", "name": "Worli, Prabhadevi, Lower Parel", "complaints": 4180, "high_volume": False},
        {"ward": "F/S", "name": "Parel, Sewri, Naigaon", "complaints": 3940, "high_volume": False},
        {"ward": "T", "name": "Mulund, Nahur", "complaints": 3760, "high_volume": False},
        {"ward": "E", "name": "Byculla, Mazgaon, Mumbai Central", "complaints": 3520, "high_volume": False},
        {"ward": "D", "name": "Malabar Hill, Breach Candy, Tardeo", "complaints": 3310, "high_volume": False},
        {"ward": "R/N", "name": "Dahisar", "complaints": 3110, "high_volume": False},
        {"ward": "C", "name": "Marine Lines, Dhobi Talao, Pydhonie", "complaints": 2350, "high_volume": False},
        {"ward": "B", "name": "Dongri, Bhendi Bazaar, Mandvi", "complaints": 2180, "high_volume": False},
        {"ward": "A", "name": "Colaba, Fort, Nariman Point, Churchgate", "complaints": 2070, "high_volume": False}
    ],

    # Issues Distribution - Solid Waste Management is highlighted as largest
    "category_analysis": [
        {"category": "Solid Waste Management", "complaints": 25031, "is_largest": True, "percentage": 21.7},
        {"category": "Drainage", "complaints": 15701, "is_largest": False, "percentage": 13.6},
        {"category": "Water Supply", "complaints": 14522, "is_largest": False, "percentage": 12.6},
        {"category": "Buildings", "complaints": 14451, "is_largest": False, "percentage": 12.5},
        {"category": "License", "complaints": 12275, "is_largest": False, "percentage": 10.6},
        {"category": "Roads", "complaints": 9800, "is_largest": False, "percentage": 8.5},
        {"category": "Pest Control", "complaints": 8721, "is_largest": False, "percentage": 7.6},
        {"category": "Public Health & Sanitation", "complaints": 5430, "is_largest": False, "percentage": 4.7},
        {"category": "Storm Water Drains", "complaints": 4210, "is_largest": False, "percentage": 3.6},
        {"category": "Encroachment & Garden", "complaints": 3120, "is_largest": False, "percentage": 2.7},
        {"category": "Street Lighting & Electrical", "complaints": 2135, "is_largest": False, "percentage": 1.9}
    ]
}
