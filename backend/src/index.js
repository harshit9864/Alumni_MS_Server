import "./env.js";
import http from "http";
import { connectDB } from "./database/index.js";
import { app } from "./app.js";
import { initSocket } from "./socket.js";


const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    // Create ONE http server
    const server = http.createServer(app);

    // Initialize socket.io on the SAME server
    initSocket(server);

    // Start server ONCE
    server.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
