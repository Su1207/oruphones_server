import express from "express";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.js";
import http from "http";
import { Server } from "socket.io";
// import { User } from "./models/user.js";
import cors from "cors";
// import { UserActivity } from "./models/userActivity.js";
import useragent from "express-useragent";
const PORT = 4000;
// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
// Initialize Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
connectDB();
app.use(useragent.express());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use("/user", userRoutes);
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on("login", (s) => {
        console.log(s);
        io.emit("message", s);
    });
    socket.on("logout", (s) => {
        console.log(s);
        io.emit("message", s);
    });
    socket.on("signout", (token) => {
        console.log(token);
        io.emit("signout user", token);
    });
    // Event listener for user disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
server.listen(PORT, () => console.log(`Express is running on ${PORT}`));
