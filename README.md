# 📚 IELTS Academic Reading Platform

Welcome to the **IELTS Academic Reading Platform**!  
This project is a full-stack web application for simulating IELTS reading tests, built with **React** (frontend) and **Django REST Framework** (backend).  
It supports user sessions, timer-based tests, automatic scoring, and a clean, responsive UI.

---

## 🗂️ Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Development Workflow](#development-workflow)
- [API Endpoints](#api-endpoints)
- [Customizing Content](#customizing-content)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## ✨ Features

- **Full IELTS Reading Test Simulation**
- **Timer and Session Management**
- **Multiple Question Types:** MCQ, True/False/Not Given, Fill in the Blanks, Matching, Text
- **Admin Panel for Content Management**
- **Automatic Band Score Calculation**
- **Responsive, Side-by-Side Layout**
- **Secure Session Handling**
- **Environment-based Configuration**

---

## 🏗️ Project Structure

```
ielts-platform/
├── backend/
│   ├── exam/                # Django app for exam logic
│   ├── ielts_platform/      # Django project settings
│   ├── manage.py
│   ├── .env.template        # Environment variable template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup (Django)

#### **Requirements**
- Python 3.10+
- pip
- PostgreSQL (recommended)

#### **Steps**

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Copy `.env.template` to `.env` and fill in your secrets and DB info.
   - Example:
     ```
     DJANGO_SECRET_KEY=your-secret-key
     DJANGO_DEBUG=True
     DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
     POSTGRES_DB=ielts_db
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=yourpassword
     POSTGRES_HOST=localhost
     POSTGRES_PORT=5432
     ```

3. **Apply migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create superuser (for admin panel):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the backend server:**
   ```bash
   python manage.py runserver
   ```

---

### 2. Frontend Setup (React)

#### **Requirements**
- Node.js 18+
- npm or yarn

#### **Steps**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the frontend dev server:**
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

- **Backend:**  
  See `/backend/.env.template` for all required variables.
- **Frontend:**  
  If you need to set API URLs, use `.env` in `/frontend` (optional).

---

## 🚀 Running the App

1. **Start the backend:**  
   ```bash
   cd backend
   python manage.py runserver
   ```
2. **Start the frontend:**  
   ```bash
   cd frontend
   npm start
   ```
3. **Access the app:**  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Development Workflow

- **Backend:**  
  - All API logic is in `/backend/exam/`.
  - Models: `ReadingPassage`, `Question`, `TestSession`, `UserAnswer`
  - Admin: [http://localhost:8000/admin](http://localhost:8000/admin)
  - API: [http://localhost:8000/api/](http://localhost:8000/api/)

- **Frontend:**  
  - Main UI in `/frontend/src/components/`
  - Key file: `TestPage.jsx` (side-by-side passage/questions)
  - Timer logic in `Timer.jsx`
  - API calls use `axios`

---

## 📡 API Endpoints

| Endpoint                   | Method | Description                          |
|----------------------------|--------|--------------------------------------|
| `/api/start-reading-test/` | POST   | Start a new test session             |
| `/api/reading-test/`       | GET    | Get passage and questions            |
| `/api/submit-reading/`     | POST   | Submit answers for scoring           |
| `/api/end-session/`        | POST   | End session and record time taken    |

**Session ID** is returned by `/api/start-reading-test/` and must be sent with all other requests.

---

## ✍️ Customizing Content

- **Add/Edit Passages & Questions:**  
  - Go to Django admin panel (`/admin`)
  - Add `ReadingPassage` and related `Question` objects
  - Each passage should have 13-14 questions

- **Supported Question Types:**  
  - Multiple Choice (MCQ)
  - True/False/Not Given
  - Fill in the Blanks
  - Matching
  - Text

---

## 🧪 Testing

- **Backend:**  
  - Run Django tests:
    ```bash
    python manage.py test
    ```
- **Frontend:**  
  - Run React tests:
    ```bash
    npm test
    ```

---

## 🆘 Troubleshooting

- **CORS Errors:**  
  - Make sure `django-cors-headers` is installed and configured in `settings.py`.
  - Example:
    ```python
    INSTALLED_APPS += ['corsheaders']
    MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE
    CORS_ALLOW_ALL_ORIGINS = True
    ```

- **Database Issues:**  
  - Check your `.env` and PostgreSQL connection.
  - Run migrations after changing models.

- **Session Issues:**  
  - Always use the `session_id` returned from `/api/start-reading-test/`.
  - Store it in `localStorage` for later requests.

- **Frontend Layout:**  
  - If passage/questions are not side by side, ensure your browser is wide enough and you use the provided layout code.

---

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy your IELTS Academic Reading Platform!**  
Feel free to contribute, customize, and share feedback.
<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 51 46" src="https://github.com/user-attachments/assets/38fc8a7d-11e7-49cd-b754-b4937a416ea3" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 52 02" src="https://github.com/user-attachments/assets/47af6871-9bc2-4c37-bb61-049822801b81" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 52 08" src="https://github.com/user-attachments/assets/ecee8daf-d97f-442f-924a-cd756bdc1e1d" />



<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 52 20" src="https://github.com/user-attachments/assets/8033cd66-33bc-4730-af31-e94664e5b7f3" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 52 42" src="https://github.com/user-attachments/assets/cafb2552-bb52-4226-9f1a-a661e4748075" />



<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 56 15" src="https://github.com/user-attachments/assets/a9471caf-9b74-4a6b-a2af-bc6e088733cc" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 56 16" src="https://github.com/user-attachments/assets/5f4538ce-c822-4206-952d-b45393810287" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 56 20" src="https://github.com/user-attachments/assets/79c92f76-8760-4f8a-879f-4aeee41c6be6" />


<img width="1440" height="900" alt="Screenshot 2025-08-14 at 19 56 24" src="https://github.com/user-attachments/assets/271073bf-2ba5-4836-9eab-c1e7c85e2b1b" />
