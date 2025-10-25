import dotenv from "dotenv";
import { connectDB } from "./database/index.js";
import { app } from "./app.js";
dotenv.config({ path: "./.env" }); // adjust path if needed
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
};

startServer();
