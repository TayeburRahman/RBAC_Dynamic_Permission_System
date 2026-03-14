"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./auth-provider";
import { toast } from "sonner";
import { Bell } from "lucide-react";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const auth = useAuthContext();

  useEffect(() => {
    if (!auth?.user?._id) return;

    const newSocket = io(process.env.NEXT_PUBLIC_BASE_API?.replace('/api/v1', '') || "http://localhost:5000", {
      query: {
        id: auth.user._id,
        role: auth.user.role,
      },
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("notification", (data: any) => {
      toast(data.message, {
        icon: <Bell className="h-4 w-4 text-primary" />,
        description: new Date(data.timestamp).toLocaleTimeString(),
      });
    });

    newSocket.on("role_notification", (data: any) => {
      if (data.roles.includes(auth.user?.role)) {
        toast(data.message, {
          icon: <Bell className="h-4 w-4 text-primary" />,
          description: "System Alert",
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [auth?.user?._id, auth?.user?.role]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
