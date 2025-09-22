const fs = require("fs")
const path = require("path")

const uploadsDir = path.join(__dirname, "..", "backend", "uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("✅ Created uploads directory")
} else {
  console.log("📁 Uploads directory already exists")
}
