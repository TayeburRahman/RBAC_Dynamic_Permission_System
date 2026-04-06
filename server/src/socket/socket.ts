import { Server, Socket } from 'socket.io';  
import { ENUM_SOCKET_EVENT } from '../enums/user';
import Auth from '../app/modules/auth/auth.model';

// Set to keep track of online users
const onlineUsers = new Set<string>();

const socket = (io: Server) => {
  io.on(ENUM_SOCKET_EVENT.CONNECT, async (socket: Socket) => {
    const currentUserId = socket.handshake.query.id as string;
    const role = socket.handshake.query.role as string;

    socket.join(currentUserId);
    console.log("A user connected", currentUserId);

    // Add the user to the online users set
    onlineUsers.add(currentUserId);
    io.emit("onlineUser", Array.from(onlineUsers));

    // Typing indicators
    socket.on('typing', (data: { recipientId: string; senderId: string }) => {
      socket.to(data.recipientId).emit('typing', data);
    });

    socket.on('stop_typing', (data: { recipientId: string; senderId: string }) => {
      socket.to(data.recipientId).emit('stop_typing', data);
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      console.log("A user disconnected", currentUserId);
      onlineUsers.delete(currentUserId);
      io.emit("onlineUser", Array.from(onlineUsers));

      if (currentUserId && currentUserId !== 'undefined') {
        try {
          await Auth.updateOne({ _id: currentUserId }, { 
            $set: { lastOnline: new Date() } 
          });
        } catch (err) {
          console.error("Error updating last online", err);
        }
      }
    });
  });
};

// Export the socket initialization function
export default socket;
