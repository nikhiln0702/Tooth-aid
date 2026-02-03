import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io';
import { setPiSocket } from './config/socket.js';
import { getPiSocket } from './config/socket.js';
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import uploadRoutes from './routes/analysis.js'

dotenv.config()
connectDB()

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Allows the Pi to connect from a different "origin"
});
app.use(express.json());

// Store the Pi's connection globally
let piSocket = null;

io.on("connection", (socket) => {
  // 1. Send current status to anyone who just opened the website
  const currentPi = getPiSocket();
  socket.emit("PI_STATUS_UPDATE", { 
    status: currentPi ? "CONNECTED" : "DISCONNECTED" 
  });

  // 2. PI SIDE: Pi connects and enters the 'Waiting Room'
  socket.on("register-pi", () => {
    socket.join("pi-waiting-room"); 
    io.emit("PI_STATUS_UPDATE", { status: "WAITING" });
    console.log("Raspberry Pi is in the waiting room...");
  });

  // 3. UI SIDE: User clicks the 'Connect' button in the UI
  socket.on("ui-authorize-pi", () => {
    // Check if there is a Pi actually waiting in the room
    const waitingRoom = io.sockets.adapter.rooms.get("pi-waiting-room");
    
    if (waitingRoom && waitingRoom.size > 0) {
      // Get the first socket ID in the waiting room
      const piSocketId = Array.from(waitingRoom)[0];
      const actualPiSocket = io.sockets.sockets.get(piSocketId);

      if (actualPiSocket) {
        setPiSocket(actualPiSocket); // Move to global store (Authorized)
        actualPiSocket.leave("pi-waiting-room"); // Remove from waiting
        
        io.emit("PI_STATUS_UPDATE", { status: "CONNECTED" });
        console.log("Raspberry Pi has been authorized by User.");
      }
    } else {
      socket.emit("error", { message: "No Raspberry Pi found in waiting room." });
    }
  });

  // 4. DISCONNECT LOGIC
  socket.on("disconnect", () => {
    if (getPiSocket()?.id === socket.id) {
        setPiSocket(null);
        io.emit("PI_STATUS_UPDATE", { status: "DISCONNECTED" });
        console.log("Authorized Pi disconnected.");
    } else {
        // If a waiting Pi disconnects, update status back to disconnected
        const waitingRoom = io.sockets.adapter.rooms.get("pi-waiting-room");
        if (!waitingRoom || waitingRoom.size === 0) {
            io.emit("PI_STATUS_UPDATE", { status: "DISCONNECTED" });
        }
    }
  });
});

const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes);
app.use("/api/analysis", uploadRoutes);


server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
