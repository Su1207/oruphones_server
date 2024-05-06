// import { Server } from "socket.io";
// import { User } from "../models/user.js";
// import { UserActivity } from "../models/userActivity.js";
export {};
// export class SocketService {
//   private readonly io: Server;
//   constructor(io: Server) {
//     this.io = io;
//   }
//   emitActivityUpdate(activity: any) {
//     this.io.emit("activity-update", activity);
//   }
//   // Add a method to handle user activity events:
//   handleUserActivity(socket: any) {
//     // Replace "any" with appropriate type
//     socket.on("user-activity", async (userId: string) => {
//       const user = await User.findById(userId);
//       if (!user) {
//         return;
//       }
//       const activity = new UserActivity({
//         user: user._id,
//         type: socket.connected ? "login" : "logout",
//         device: socket.client.conn.transport.name, // Get device type (e.g., "websocket")
//       });
//       await activity.save();
//       this.emitActivityUpdate(activity); // Call internal method to broadcast
//     });
//   }
// }
