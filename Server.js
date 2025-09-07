const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const roasts = [
  "Wow, {user}, that was so bad it lowered my IQ by 10 points 🤦",
  "You call that a question, {user}? My toaster has asked smarter things.",
  "Hold on {user}, let me grab a microscope to find the logic in that 💀",
  "That question deserves to be left on read, {user} 📵",
  "Congrats {user}, you just asked the dumbest thing I've heard today 🎉",
  "I'd answer that, but I don’t speak nonsense, {user} 🗑️",
  "You typed that with full confidence, didn’t you {user}? 😂",
  "Even autocorrect gave up on you, {user} 🤔",
  "Bruh. Just… bruh, {user}. 🙄",
  "Next time, let Google save you from this embarrassment, {user}."
];

// Simple in-memory leaderboard: { username: roastCount }
const leaderboard = {};

app.use(express.static("public")); // serve the frontend

io.on("connection", (socket) => {
  // Send current leaderboard when someone connects
  socket.emit("leaderboard", leaderboard);

  socket.on("question", ({ user, text }) => {
    const username = (user || "Anonymous").trim() || "Anonymous";
    const message = (text || "").trim();
    if (!message) return;

    // Broadcast user message
    io.emit("message", { sender: username, text: `👤 ${username}: ${message}`, type: "user" });

    // Roast response
    const roast = roasts[Math.floor(Math.random() * roasts.length)].replaceAll("{user}", username);
    io.emit("message", { sender: "RoastGPT", text: `🔥 RoastGPT: ${roast}`, type: "roast" });

    // Update leaderboard
    leaderboard[username] = (leaderboard[username] || 0) + 1;

    // Send updated leaderboard
    io.emit("leaderboard", leaderboard);
  });

  socket.on("disconnect", () => {
    // no-op for now
  });
});

server.listen(PORT, () => {
  console.log(`🔥 RoastGPT running at http://localhost:${PORT}`);
});
