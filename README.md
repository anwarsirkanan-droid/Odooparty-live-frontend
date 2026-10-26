# 🎙️ OdooParty Live - Frontend

A progressive web application (PWA) built with **React 19**, **Vite**, **Tailwind CSS**, and **Socket.IO Client** for real-time live social voice audio rooms, 25-seat party lounges, lucky gifts, wallet, agency management, and host rewards.

---

## 📌 Afaan Oromoo (Qajeelfama Dhaabbachuu & Fayyadama)

### 1. Faayiloota Fe'uu (Install Dependencies)
```bash
cd Odooparty-live-frontend
npm install
```

### 2. Hojii Jalqabsiisuu (Run in Development Mode)
```bash
npm run dev
```
Appilikeeshiniin kun browser keessan irratti banama: `http://localhost:3000`

### 3. Odooparty Backend Waliin Wal-qabsiisuu
Faayilii `.env.example` gara `.env`tti garagalchaa:
```bash
cp .env.example .env
```
Yoo backend keessan `http://localhost:5000` irratti hojjechaa jiraate:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Prodaakshiniif Ijaaruu (Build for Production)
```bash
npm run build
```

### 5. GitHub Irratti Ol Kaayuu (Push to GitHub)
```bash
git init
git add .
git commit -m "feat: initial commit for Odooparty-live-frontend"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Odooparty-live-frontend.git
git push -u origin main
```

---

## 🚀 English Instructions

### Setup & Installation
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```
Starts Vite dev server with proxy enabled for `/api` and `/socket.io`.

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base API URL for HTTP requests | `/api` |
| `VITE_SOCKET_URL` | Socket.IO server endpoint | Current Origin / localhost:5000 |
| `VITE_BACKEND_URL` | Local proxy target for Vite | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |

### Production Build
```bash
npm run build
```
Generates production-optimized static files in `dist/`. Deploy to Vercel, Netlify, Firebase Hosting, Cloudflare Pages, or AWS S3.
