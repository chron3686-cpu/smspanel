# NovaText Cloud - SMS Management Platform

Professional SMS management platform with modern UI.

## 🔐 Default Login Credentials
- **Username:** `admin`
- **Password:** `NovaText2024!`

## 🚀 Local Development

### Backend
```bash
cd backend
npm install
node src/index.js
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📦 Production Build

### Frontend Build
```bash
cd frontend
npm run build
# Output in dist/ folder
```

## 🌐 Deployment

### Railway.app (Recommended)
1. Push to GitHub
2. Connect Railway to your repo
3. Deploy backend first, get URL
4. Deploy frontend, set API URL

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - production

## 🔒 Security
- Change default password before deploying
- API key is securely stored in backend only
- Rate limiting enabled on SMS endpoints

## 📱 Features
- Dashboard with analytics
- Contact management
- Single & Bulk SMS sending
- Message history
- Incoming messages
- Dark/Light theme
- Authentication system

