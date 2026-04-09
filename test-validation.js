require("dotenv").config({ path: "backend/.env" });
const mongoose = require("mongoose");
const User = require("./backend/models/User");

async function testValidations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const testCases = [
      {
        name: "Too short name",
        data: { userId: "V001", name: "Al", email: "al@test.com", age: 20 },
        expectedError: "Name must be at least 3 characters"
      },
      {
        name: "Invalid email",
        data: { userId: "V002", name: "Alice", email: "alice-invalid", age: 20 },
        expectedError: "Please fill a valid email address"
      },
      {
        name: "Age < 0",
        data: { userId: "V003", name: "Alice", email: "al@test.com", age: -1 },
        expectedError: "Age must be at least 0"
      },
      {
        name: "Valid user",
        data: { userId: "V004", name: "Alice", email: "alice@test.com", age: 0 },
        expectedError: null
      }
    ];

    for (const tc of testCases) {
      console.log(`\nTesting: ${tc.name}...`);
      try {
        const user = new User(tc.data);
        await user.validate();
        console.log("✅ Validation passed");
        if (tc.expectedError) console.error(`❌ Expected error "${tc.expectedError}" but passed!`);
      } catch (err) {
        if (tc.expectedError && err.message.includes(tc.expectedError)) {
          console.log(`✅ Validation failed as expected: ${err.message}`);
        } else {
          console.error(`❌ Unexpected validation error:`, err.message);
        }
      }
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testValidations();
