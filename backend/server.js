require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Custom Request Logger Middleware ────────
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ➡️  ${req.method} ${req.url}`);
  if (Object.keys(req.query).length > 0) {
    console.log("   🔍 Query:", req.query);
  }
  if (Object.keys(req.body).length > 0) {
    console.log("   📦 Body:", req.body);
  }
  next();
});

// ── Routes ──────────────────────────────────
app.use("/api/users", userRoutes);

// ── Serve Frontend ──────────────────────────
const path = require('path');
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ── Root Route (Serves Dashboard) ───────────
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Health Check Endpoint ───────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is healthy 🚀" });
});

// ── Error Handler (must be last) ─────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ── Connect to MongoDB ──────────────────────
    // Await the connection before starting server
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📄 API Docs available at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`❌ Failed to start server: ${err.message}`);
  }
};

startServer();
