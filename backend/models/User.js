const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age must be at least 0"],
      max: [120, "Age must be at most 120"],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // we manage createdAt manually for TTL demo
    versionKey: false,
  }
);

// ─────────────────────────────────────────────
// INDEX DEFINITIONS
// ─────────────────────────────────────────────

// 1. Single Field Index on name
UserSchema.index({ name: 1 }, { name: "idx_name_single" });

// 2. Compound Index on email + age
UserSchema.index({ email: 1, age: 1 }, { name: "idx_email_age_compound" });

// 3. Multikey Index on hobbies (auto-created because hobbies is an array field)
UserSchema.index({ hobbies: 1 }, { name: "idx_hobbies_multikey" });

// 4. Text Index on bio
UserSchema.index({ bio: "text" }, { name: "idx_bio_text" });

// 5. Hashed Index on userId
UserSchema.index({ userId: "hashed" }, { name: "idx_userId_hashed" });

// 6. TTL Index on createdAt (documents expire after 1 year = 31536000 seconds)
//    Change expireAfterSeconds to a small value (e.g., 60) to test TTL quickly
UserSchema.index(
  { createdAt: 1 },
  { name: "idx_createdAt_ttl", expireAfterSeconds: 31536000 }
);

module.exports = mongoose.model("User", UserSchema);
