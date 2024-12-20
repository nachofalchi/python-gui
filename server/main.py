from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from routes import user, email
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mailappchona.vercel.app"],  # Permitir solicitudes desde localhost:3000
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Main route
@app.get("/")
def get():
    return HTMLResponse("""
    <html>
        <body>
            <h1>Welcome to the chat server!</h1>
        </body>
    </html>
    """)

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(email.router, prefix="/email", tags=["Email"])
