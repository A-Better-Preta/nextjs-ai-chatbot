// You can run this in a temporary file or via a sqlite GUI/CLI
const sqlite3 = require('better-sqlite3');
const db = new sqlite3('user_data.db');

// Add the missing column
try {
  db.prepare('ALTER TABLE accounts ADD COLUMN userId TEXT').run();
  console.log("✅ Added userId to accounts");
} catch (e) {
  console.log("userId might already exist");
}

try {
  db.prepare('ALTER TABLE transactions ADD COLUMN userId TEXT').run();
  console.log("✅ Added userId to transactions");
} catch (e) {
  console.log("userId might already exist");
}