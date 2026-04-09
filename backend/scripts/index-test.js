/**
 * index-test.js
 * ─────────────────────────────────────────────────────────────────────────
 * Inserts sample data and runs .explain("executionStats") on each index
 * to verify MongoDB is using the correct index for each query.
 *
 * Usage:  node scripts/index-test.js
 * ─────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

// ── Sample Data ───────────────────────────────────────────────────────────
const sampleUsers = [
  {
    userId: "USR001",
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
    hobbies: ["reading", "hiking", "photography"],
    bio: "Passionate software engineer who loves open source projects and nature walks.",
    createdAt: new Date(),
  },
  {
    userId: "USR002",
    name: "Bob Smith",
    email: "bob@example.com",
    age: 34,
    hobbies: ["gaming", "cooking", "reading"],
    bio: "Creative chef and avid gamer exploring the intersection of food and technology.",
    createdAt: new Date(),
  },
  {
    userId: "USR003",
    name: "Carol Davis",
    email: "carol@example.com",
    age: 22,
    hobbies: ["dancing", "music", "painting"],
    bio: "Artist and musician who enjoys creative expression through various art forms.",
    createdAt: new Date(),
  },
  {
    userId: "USR004",
    name: "David Lee",
    email: "david@example.com",
    age: 45,
    hobbies: ["cycling", "photography", "travel"],
    bio: "Travel photographer documenting beautiful landscapes and cultures around the world.",
    createdAt: new Date(),
  },
  {
    userId: "USR005",
    name: "Eva Martinez",
    email: "eva@example.com",
    age: 31,
    hobbies: ["yoga", "hiking", "cooking"],
    bio: "Wellness coach passionate about healthy living, mindfulness, and outdoor adventures.",
    createdAt: new Date(),
  },
];

// ── Helper: Print Explain Stats ───────────────────────────────────────────
function printStats(label, stats) {
  const es = stats?.executionStats;
  if (!es) {
    console.log(`  [${label}] No executionStats returned.`);
    return;
  }

  const winStage = stats?.queryPlanner?.winningPlan?.inputStage;
  const indexUsed =
    winStage?.indexName ||
    winStage?.inputStage?.indexName ||
    stats?.queryPlanner?.winningPlan?.queryPlan?.inputStage?.indexName ||
    "N/A";

  console.log(`\n  ┌─ ${label}`);
  console.log(`  │  Index Used       : ${indexUsed}`);
  console.log(`  │  Keys Examined    : ${es.totalKeysExamined}`);
  console.log(`  │  Docs Examined    : ${es.totalDocsExamined}`);
  console.log(`  │  Docs Returned    : ${es.nReturned}`);
  console.log(`  │  Execution Time   : ${es.executionTimeMillis} ms`);
  console.log(`  └─ Stage            : ${winStage?.stage || "N/A"}`);
}

// ── Main Test Runner ──────────────────────────────────────────────────────
async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // ── Insert Sample Data ──────────────────────────────────────────────
    console.log("📥 Inserting sample users...");
    await User.deleteMany({}); // clean slate
    await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} users\n`);

    // ── Ensure all indexes are created ─────────────────────────────────
    await User.ensureIndexes();
    console.log("📐 Indexes ensured\n");

    console.log("═══════════════════════════════════════════════════════");
    console.log("               INDEX EXECUTION STATS REPORT             ");
    console.log("═══════════════════════════════════════════════════════");

    // ─────────────────────────────────────────────────────────────────
    // TEST 1: Single Field Index on name
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[1] Single Field Index — name");
    const t1 = await User.find({ name: "Alice Johnson" })
      .explain("executionStats");
    printStats("idx_name_single", t1);

    // ─────────────────────────────────────────────────────────────────
    // TEST 2: Compound Index on email + age
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[2] Compound Index — email + age");
    const t2 = await User.find({ email: "bob@example.com", age: 34 })
      .explain("executionStats");
    printStats("idx_email_age_compound", t2);

    // ─────────────────────────────────────────────────────────────────
    // TEST 3: Multikey Index on hobbies
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[3] Multikey Index — hobbies");
    const t3 = await User.find({ hobbies: "hiking" })
      .explain("executionStats");
    printStats("idx_hobbies_multikey", t3);

    // ─────────────────────────────────────────────────────────────────
    // TEST 4: Text Index on bio
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[4] Text Index — bio");
    const t4 = await User.find({ $text: { $search: "engineer" } })
      .explain("executionStats");
    printStats("idx_bio_text", t4);

    // ─────────────────────────────────────────────────────────────────
    // TEST 5: Hashed Index on userId
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[5] Hashed Index — userId");
    const t5 = await User.find({ userId: "USR003" })
      .explain("executionStats");
    printStats("idx_userId_hashed", t5);

    // ─────────────────────────────────────────────────────────────────
    // TEST 6: TTL Index on createdAt (just verifies index exists)
    // ─────────────────────────────────────────────────────────────────
    console.log("\n[6] TTL Index — createdAt (index existence check)");
    const indexes = await User.collection.indexes();
    const ttlIndex = indexes.find((i) => i.name === "idx_createdAt_ttl");
    if (ttlIndex) {
      console.log(`  ┌─ TTL Index Found`);
      console.log(`  │  Name              : ${ttlIndex.name}`);
      console.log(`  │  Field             : ${JSON.stringify(ttlIndex.key)}`);
      console.log(`  └─ Expires After     : ${ttlIndex.expireAfterSeconds} seconds`);
    } else {
      console.log("  ⚠️  TTL index not found. Run ensureIndexes() first.");
    }

    // ─────────────────────────────────────────────────────────────────
    // All Indexes Summary
    // ─────────────────────────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("               ALL INDEXES ON COLLECTION                ");
    console.log("═══════════════════════════════════════════════════════");
    indexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.name.padEnd(30)} → ${JSON.stringify(idx.key)}${idx.expireAfterSeconds !== undefined ? ` [TTL: ${idx.expireAfterSeconds}s]` : ""}`);
    });

    console.log("\n✅ All index tests completed successfully!\n");
  } catch (err) {
    console.error("❌ Error during index test:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

runTests();
