const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ─────────────────────────────────────────────
// POST /api/users — Create a new user
// ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { userId, name, email, age, hobbies, bio } = req.body;

    const user = await User.create({ userId, name, email, age, hobbies, bio });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/users — Retrieve all users
// Supports query params: name, email, age, hobby, bio (text search)
// ─────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    let { name, email, age, hobby, bio, page, limit, sortBy } = req.query;
    const filter = {};

    // ── Search by name (regex, case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // ── Filter by email (exact)
    if (email) {
      filter.email = email.toLowerCase();
    }

    // ── Filter by age (exact)
    if (age) {
      filter.age = Number(age);
    }

    // ── Filter by hobby
    if (hobby) {
      filter.hobbies = hobby;
    }

    // ── Full-text search on bio
    if (bio) {
      filter.$text = { $search: bio };
    }

    // ── Pagination logic
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // ── Sorting logic (format: field:asc or field:desc)
    let sort = { createdAt: -1 };
    if (sortBy) {
      const parts = sortBy.split(":");
      sort = { [parts[0]]: parts[1] === "desc" ? -1 : 1 };
    }

    // ── Execution
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/users/:id — Get single user by MongoDB _id
// ─────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/users/:id — Update user by MongoDB _id
// ─────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,          // return updated document
      runValidators: true // run schema validators on update
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/users/:id — Delete user by MongoDB _id
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: { deletedId: req.params.id },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
