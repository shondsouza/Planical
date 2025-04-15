@echo off
echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing required packages...
pip install flask requests plotly pandas numpy firebase-admin fastapi uvicorn python-dotenv

echo Setting up static files...
if not exist "static" mkdir static
if not exist "static\favicon.ico" (
    echo Creating placeholder favicon.ico...
    copy static\logo.png static\favicon.ico >nul 2>&1
    if not exist "static\favicon.ico" (
        echo Unable to copy logo.png - trying from Chatbot images
        copy Chatbot\chatbot\images\logo.png static\favicon.ico >nul 2>&1
        if not exist "static\favicon.ico" (
            echo Unable to copy logo.png - creating empty favicon
            echo. > static\favicon.ico
        )
    )
)

echo Setting up data directories...
if not exist "chroma_db" mkdir chroma_db
if not exist "data" mkdir data

echo.
echo ====================================================
echo USING EXISTING API KEYS
echo ====================================================
echo Using the Groq API key already configured in your .env file.
echo If you want to change it, you can edit the .env file directly.
echo.

echo Checking script.js for problematic URL...
findstr /C:"localhost:8000" Chatbot\chatbot\script.js > nul
if %errorlevel% equ 0 (
    echo Found problematic URL in script.js, fixing...
    powershell -Command "(Get-Content Chatbot\chatbot\script.js) -replace 'http://localhost:8000/chat', '/chat' | Set-Content Chatbot\chatbot\script.js"
) else (
    echo No problematic URL found in script.js, good!
)

echo Starting application...
set FLASK_DEBUG=0
python app.py

pause 