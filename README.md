# MongoDB Mongoose API — Full Stack Project

> Node.js + Express + MongoDB (Mongoose) with CRUD, Indexes, Filtering, and Premium UI

---

## 📁 Project Structure

```
mongodb-project/
├── backend/
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js     ← Global error handler
│   ├── models/
│   │   └── User.js             ← Mongoose schema + ALL 6 indexes
│   ├── routes/
│   │   └── userRoutes.js       ← Full CRUD + filtering routes
│   ├── scripts/
│   │   └── index-test.js       ← Index test with executionStats
│   ├── .env                    ← Secret config (NOT committed to git)
│   ├── .env.example            ← Template for teammates
│   ├── .gitignore
│   ├── package.json
│   └── server.js               ← Express app entry point
└── frontend/
    └── index.html              ← Premium dashboard UI
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally OR MongoDB Atlas URI

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure `.env`
```bash
# Edit .env (already created):
MONGO_URI=mongodb://localhost:27017/userdb
PORT=5000
NODE_ENV=development
```
> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 4. Start the server
```bash
npm run dev     # development (with nodemon auto-restart)
# or
npm start       # production
```

### 5. Open the UI
Open `frontend/index.html` in your browser. Enter your API URL (default: `http://localhost:5000`) and click **Connect**.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users?name=Alice` | Search by name |
| `GET` | `/api/users?email=x&age=25` | Filter by email + age |
| `GET` | `/api/users?hobby=hiking` | Filter by hobby |
| `GET` | `/api/users?bio=engineer` | Full-text search on bio |
| `GET` | `/api/users/:id` | Get user by ID |
| `PUT` | `/api/users/:id` | Update user by ID |
| `DELETE` | `/api/users/:id` | Delete user by ID |

---

## 📦 Request Body (POST / PUT)

```json
{
  "userId": "USR001",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "hobbies": ["reading", "hiking"],
  "bio": "Passionate software engineer who loves open source."
}
```

---

## 🗂 Indexes

| Index | Type | Field(s) | Purpose |
|-------|------|----------|---------|
| `idx_name_single` | Single Field | `name` | Fast name lookup |
| `idx_email_age_compound` | Compound | `email + age` | Combined filter |
| `idx_hobbies_multikey` | Multikey | `hobbies[]` | Array field queries |
| `idx_bio_text` | Text | `bio` | Full-text search |
| `idx_userId_hashed` | Hashed | `userId` | Equality & sharding |
| `idx_createdAt_ttl` | TTL | `createdAt` | Auto-expire (1 year) |

---

## 🧪 Running Index Tests

```bash
cd backend
node scripts/index-test.js
```

**Sample output:**
```
✅ Connected to MongoDB
📥 Inserting 5 sample users...
📐 Indexes ensured

═══════════════════════════════════════════════════════
               INDEX EXECUTION STATS REPORT
═══════════════════════════════════════════════════════

[1] Single Field Index — name
  ┌─ idx_name_single
  │  Index Used       : idx_name_single
  │  Keys Examined    : 1
  │  Docs Examined    : 1
  │  Docs Returned    : 1
  │  Execution Time   : 0 ms
  └─ Stage            : IXSCAN
```

---

## 🧪 Postman Testing

### Import these requests:

**Create User**
```
POST http://localhost:5000/api/users
Body (JSON): { "userId": "USR001", "name": "Alice", "email": "alice@example.com", "age": 28, "hobbies": ["reading"], "bio": "Engineer" }
```

**Get All Users**
```
GET http://localhost:5000/api/users
```

**Search by Name**
```
GET http://localhost:5000/api/users?name=Alice
```

**Filter by Email + Age**
```
GET http://localhost:5000/api/users?email=alice@example.com&age=28
```

**Filter by Hobby**
```
GET http://localhost:5000/api/users?hobby=reading
```

**Text Search Bio**
```
GET http://localhost:5000/api/users?bio=engineer
```

**Update User**
```
PUT http://localhost:5000/api/users/<_id>
Body (JSON): { "age": 29, "bio": "Updated bio here" }
```

**Delete User**
```
DELETE http://localhost:5000/api/users/<_id>
```

---

## 🛡 Environment Variable Security

- `.env` is in `.gitignore` — **never committed to version control**
- `.env.example` is committed as a template
- All sensitive config (DB URI, port) lives in `.env` only
- `dotenv` loads it at runtime via `require('dotenv').config()`
