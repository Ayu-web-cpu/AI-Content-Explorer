from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.db.session import engine, get_session
from app.models.base import Base
from app.models.user import User
from app.routers import auth, search, image, dashboard   
from app.core import security

app = FastAPI(title="AI Explorer API")


origins = [
    "http://localhost:5173",   
    "http://127.0.0.1:5173",   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def create_default_admin():
    async for db in get_session():
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        admin = result.scalar_one_or_none()

        if not admin:
            hashed = security.hash_password("admin123")
            admin = User(
                email="admin@example.com",
                hashed_password=hashed,
                role="admin",
            )
            db.add(admin)
            await db.commit()
            print(" Default admin created: admin@example.com / admin123")
        break

@app.on_event("shutdown")
async def shutdown_event():
    await engine.dispose()

app.include_router(auth.router)              
app.include_router(search.search_router)     
app.include_router(image.image_router)       
app.include_router(dashboard.dashboard_router)

