from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import json
import bcrypt
import jwt
import logging

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# =========================================================
# CONFIG
# =========================================================

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "civicresolve")

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = "HS256"

EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civicresolve")

# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(title="CivicResolve API")

api = APIRouter(prefix="/api")

# =========================================================
# MODELS
# =========================================================


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = "citizen"


class AuthResponse(BaseModel):
    user: UserOut
    token: str


class GrievanceIn(BaseModel):
    description: str = Field(min_length=10, max_length=2000)
    category_hint: Optional[str] = None
    location: Optional[str] = None
    photo_base64: Optional[str] = None
    photo_mime: Optional[str] = None


class AIAnalysis(BaseModel):
    severity: Literal["high", "medium", "low"]
    issue_title: str
    issue_category: str
    tags: List[str] = []
    summary: str
    assigned_ministry: str
    ministry_reason: str
    estimated_response_days: str = "3-5"


class GrievanceOut(BaseModel):
    id: str
    case_number: str
    tracking_id: Optional[str] = None
    user_id: str
    description: str
    location: Optional[str]
    photo_base64: Optional[str]
    photo_mime: Optional[str]
    status: str
    created_at: str
    analysis: Optional[AIAnalysis] = None
    confirmed: bool = False


class MinistryOut(BaseModel):
    id: str
    name: str
    icon: str
    category: str
    description: str
    phone: str
    website: str
    response_time: str


# =========================================================
# HELPERS
# =========================================================


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str):
    return bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt(),
    ).decode()


def verify_password(password: str, hashed: str):
    try:
        return bcrypt.checkpw(
            password.encode(),
            hashed.encode(),
        )
    except Exception:
        return False


def create_token(user_id: str, email: str):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


async def get_current_user(request: Request):
    auth = request.headers.get("Authorization")

    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    token = auth.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = await db.users.find_one(
        {"id": payload["sub"]},
        {"_id": 0, "password_hash": 0},
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


def user_to_out(user):
    return UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role", "citizen"),
    )


def gen_case_number():
    year = datetime.now().year % 100
    code = uuid.uuid4().hex[:4].upper()

    return f"CR-{code}-{year}"


# =========================================================
# AI ANALYSIS
# =========================================================

# =========================================================
# AI ANALYSIS
# =========================================================

async def analyze_grievance(
    description: str,
    photo_base64: Optional[str] = None,
):
    text = description.lower()

    # Waste related
    if any(word in text for word in [
        "garbage", "waste", "trash", "dirty", "sanitation",
    ]):
        return AIAnalysis(
            severity="medium",
            issue_title="Waste Management Issue",
            issue_category="Waste Management",
            tags=["garbage", "sanitation", "cleanliness"],
            summary="Garbage disposal and sanitation issue reported by citizen.",
            assigned_ministry="Ministry of Urban Development",
            ministry_reason="Urban Development handles sanitation and waste management.",
            estimated_response_days="3-5",
        )

    # Road related
    if any(word in text for word in [
        "road", "pothole", "bridge", "traffic",
    ]):
        return AIAnalysis(
            severity="high",
            issue_title="Road Infrastructure Damage",
            issue_category="Road Infrastructure",
            tags=["road", "pothole", "transport"],
            summary="Road damage affecting transportation and public safety.",
            assigned_ministry="Ministry of Public Works",
            ministry_reason="Public Works manages roads and infrastructure.",
            estimated_response_days="2-4",
        )

    # Water related
    if any(word in text for word in [
        "water", "drainage", "pipe", "leak", "sewage",
    ]):
        if any(word in text for word in [
            "no water",
            "water shortage",
            "water not coming",
            "no water supply",
            "water supply stopped",
            "drinking water crisis",
        ]):
            severity = "high"
            response_days = "1-3"
        else:
            severity = "medium"
            response_days = "3-5"

        return AIAnalysis(
            severity=severity,
            issue_title="Water Supply Issue",
            issue_category="Water Resources",
            tags=["water", "pipeline", "drainage"],
            summary="Citizen reported a water supply or drainage issue.",
            assigned_ministry="Ministry of Water Resources",
            ministry_reason="Water Resources handles drainage and water supply systems.",
            estimated_response_days=response_days,
        )

    # Health related
    if any(word in text for word in [
        "hospital", "medical", "disease", "health",
    ]):
        return AIAnalysis(
            severity="high",
            issue_title="Public Health Concern",
            issue_category="Health",
            tags=["health", "medical"],
            summary="Public health concern reported by citizen.",
            assigned_ministry="Ministry of Health",
            ministry_reason="Health ministry manages medical and public health services.",
            estimated_response_days="1-3",
        )

    # Electricity / Power related
    if any(word in text for word in [
        "electricity", "powercut", "power cut", "power outage",
        "blackout", "light", "no light", "voltage",
        "transformer", "current", "wire", "electric pole",
    ]):
        return AIAnalysis(
            severity="high",
            issue_title="Electricity Supply Issue",
            issue_category="Power",
            tags=["electricity", "power", "outage"],
            summary="Citizen reported a power supply or electricity issue.",
            assigned_ministry="Ministry of Electricity",
            ministry_reason="Electricity ministry handles power supply and electrical issues.",
            estimated_response_days="1-3",
        )

    # Default fallback
    return AIAnalysis(
        severity="low",
        issue_title="General Civic Complaint",
        issue_category="Public Services",
        tags=["general"],
        summary="General public grievance submitted by citizen.",
        assigned_ministry="Ministry of Urban Development",
        ministry_reason="Issue best matches urban public service management.",
        estimated_response_days="5-7",
    )
# =========================================================
# AUTH ROUTES
# =========================================================


@api.post("/auth/register", response_model=AuthResponse)
async def register(body: RegisterIn):
    email = body.email.lower()

    existing = await db.users.find_one({"email": email})

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": body.name,
        "password_hash": hash_password(body.password),
        "role": "citizen",
        "created_at": now_iso(),
    }

    await db.users.insert_one(user)

    token = create_token(
        user["id"],
        user["email"],
    )

    return AuthResponse(
        user=user_to_out(user),
        token=token,
    )


@api.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginIn):
    email = body.email.lower()

    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(
        body.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_token(
        user["id"],
        user["email"],
    )

    return AuthResponse(
        user=user_to_out(user),
        token=token,
    )


@api.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user_to_out(user)


# =========================================================
# MINISTRIES
# =========================================================


SEED_MINISTRIES = [
    {
        "name": "Ministry of Urban Development",
        "icon": "Building2",
        "category": "Infrastructure",
        "description": "Urban planning, roads and sanitation.",
        "phone": "+91 1800-100-1001",
        "website": "urban.gov.in",
        "response_time": "3-5 days",
    },
    {
        "name": "Ministry of Health",
        "icon": "Stethoscope",
        "category": "Health",
        "description": "Public healthcare and hospitals.",
        "phone": "+91 1800-100-1002",
        "website": "health.gov.in",
        "response_time": "1-3 days",
    },
    {
        "name": "Ministry of Transport",
        "icon": "Bus",
        "category": "Transport",
        "description": "Road transport and public transit.",
        "phone": "+91 1800-100-1003",
        "website": "transport.gov.in",
        "response_time": "2-5 days",
    },
    {
        "name": "Ministry of Water Resources",
        "icon": "Droplets",
        "category": "Water",
        "description": "Water supply and drainage issues.",
        "phone": "+91 1800-100-1004",
        "website": "water.gov.in",
        "response_time": "2-4 days",
    },
    {
        "name": "Ministry of Environment",
        "icon": "Trees",
        "category": "Environment",
        "description": "Pollution and environmental concerns.",
        "phone": "+91 1800-100-1005",
        "website": "environment.gov.in",
        "response_time": "3-7 days",
    },
    {
        "name": "Ministry of Education",
        "icon": "GraduationCap",
        "category": "Education",
        "description": "Schools, colleges and education services.",
        "phone": "+91 1800-100-1006",
        "website": "education.gov.in",
        "response_time": "5-10 days",
    },
    {
        "name": "Ministry of Electricity",
        "icon": "Zap",
        "category": "Power",
        "description": "Power supply and electrical issues.",
        "phone": "+91 1800-100-1007",
        "website": "power.gov.in",
        "response_time": "1-3 days",
    },
    {
        "name": "Ministry of Public Safety",
        "icon": "Shield",
        "category": "Safety",
        "description": "Public safety and emergency concerns.",
        "phone": "+91 1800-100-1008",
        "website": "safety.gov.in",
        "response_time": "1-2 days",
    },
]

@api.get("/ministries", response_model=List[MinistryOut])
async def ministries():
    docs = await db.ministries.find(
        {},
        {"_id": 0},
    ).to_list(100)

    return docs


# =========================================================
# GRIEVANCES
# =========================================================


@api.post(
    "/grievances/analyze",
    response_model=GrievanceOut,
)
async def create_grievance(
    body: GrievanceIn,
    user=Depends(get_current_user),
):
    analysis = await analyze_grievance(
        body.description,
        body.photo_base64,
    )

    tracking_id = f"TRK-{uuid.uuid4().hex[:8].upper()}"   
    grievance = {
        "id": str(uuid.uuid4()),
        "case_number": gen_case_number(),
        "tracking_id": tracking_id,
        "user_id": user["id"],
        "description": body.description,
        "location": body.location,
        "photo_base64": body.photo_base64,
        "photo_mime": body.photo_mime,
        "status": "pending_verification",
        "created_at": now_iso(),
        "analysis": analysis.model_dump(),
        "confirmed": False,
    }

    await db.grievances.insert_one(grievance)

    return grievance


@api.post(
    "/grievances/{gid}/confirm",
    response_model=GrievanceOut,
)
async def confirm_grievance(
    gid: str,
    user=Depends(get_current_user),
):
    grievance = await db.grievances.find_one(
        {
            "id": gid,
            "user_id": user["id"],
        },
        {"_id": 0},
    )

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found",
        )

    await db.grievances.update_one(
        {"id": gid},
        {
            "$set": {
                "confirmed": True,
                "status": "submitted_to_ministry",
            }
        },
    )

    updated = await db.grievances.find_one(
        {"id": gid},
        {"_id": 0},
    )

    return updated


@api.get(
    "/grievances",
    response_model=List[GrievanceOut],
)
async def list_grievances(
    user=Depends(get_current_user),
):
    docs = (
        await db.grievances.find(
            {"user_id": user["id"]},
            {"_id": 0},
        )
        .sort("created_at", -1)
        .to_list(100)
    )

    return docs


@api.get(
    "/grievances/{gid}",
    response_model=GrievanceOut,
)
async def get_grievance(
    gid: str,
    user=Depends(get_current_user),
):
    grievance = await db.grievances.find_one(
        {
            "id": gid,
            "user_id": user["id"],
        },
        {"_id": 0},
    )

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found",
        )

    return grievance


# =========================================================
# ROOT
# =========================================================


@api.get("/")
async def api_root():
    return {
        "name": "CivicResolve API",
        "status": "running",
    }


# =========================================================
# STARTUP
# =========================================================


@app.on_event("startup")
async def startup():
    await db.users.create_index(
        "email",
        unique=True,
    )

    await db.grievances.create_index(
        "id",
        unique=True,
    )

    await db.ministries.create_index(
        "name",
        unique=True,
    )

    for ministry in SEED_MINISTRIES:
        existing = await db.ministries.find_one(
            {"name": ministry["name"]}
        )

        if not existing:
            await db.ministries.insert_one(
                {
                    "id": str(uuid.uuid4()),
                    **ministry,
                }
            )

    logger.info("Startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# =========================================================
# ROUTER + CORS
# =========================================================

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)