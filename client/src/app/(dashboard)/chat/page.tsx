"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import { useAuthContext } from "@/providers/auth-provider";
import { useSocket } from "@/providers/socket-provider";
import api from "@/lib/api";
import {
  Search,
  Send,
  Plus,
  Paperclip,
  MoreVertical,
  X,
  FileText,
  Trash2,
  User as UserIcon,
  Smile,
  ImageIcon,
  Loader2,
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const POPULAR_EMOJIS = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", 
    "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", 
    "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", 
    "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", 
    "😾", "🤲", "👐", "🙌", "👏", "🤝", "👍", "👎", "👊", "✊", 
    "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", 
    "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", 
    "💪", "🦾", "🖕", "✍️", "🙏", "💍", "💄", "💋", "👄", "🦷", 
    "👅", "👂", "🦻", "👃", "👣", "👁️", "👀", "🧠", "🗣️", "👤", 
    "👥", "🫂", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", 
    "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"
];

interface Message {
  _id: string;
  sender: any;
  recipient: any;
  content: string;
  attachments?: string[];
  isDeleted: boolean;
  createdAt: string;
  conversationId: string;
}

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: any;
  unreadCount?: number;
}

export default function ChatPage() {
  const auth = useAuthContext();
  const { socket, onlineUsers } = useSocket();
  const currentUserId = auth?.user?._id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [mobileShowSidebar, setMobileShowSidebar] = useState(true);
  const [isMessageSearchMode, setIsMessageSearchMode] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCustomer = auth?.user?.role === "CUSTOMER";

  useEffect(() => {
    if (selectedConversation) {
        setMobileShowSidebar(false);
    }
  }, [selectedConversation]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/messages/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      // Mark as read when opening
      api.patch(`/chat/mark-as-read/${selectedConversation._id}`).then(() => {
          fetchConversations(); // Update counts
      });
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages, fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // If we're in the conversation where the message arrived
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update conversations list to show new lastMessage
      fetchConversations();
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages(prev => 
          prev.map(msg => msg._id === data.messageId ? { ...msg, isDeleted: true } : msg)
        );
      }
    };

    const onTyping = (data: { senderId: string }) => {
      if (selectedConversation && selectedConversation.participants.some(p => String(p._id) === String(data.senderId))) {
        setRemoteTyping(data.senderId);
      }
    };

    const onStopTyping = () => {
      setRemoteTyping(null);
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
    };
  }, [socket, selectedConversation, fetchConversations, currentUserId]);

  const getOtherUser = (conv: Conversation | null) => {
    if (!conv?.participants || !currentUserId) return null;
    const other = conv.participants.find(p => {
        const id = (typeof p === 'string') ? p : (p?._id || p?.id);
        return id && String(id) !== String(currentUserId);
    });

    if (!other) return null;
    
    // If other is just an ID (not populated yet), return a placeholder so sending message doesn't fail
    if (typeof other === 'string') {
        return { _id: other, name: 'Loading...', role: 'User' };
    }
    
    return other;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    const recipient = getOtherUser(selectedConversation);
    if (!recipient) return;
    
    // Final check for the ID itself (covers all cases: unpopulated ID, populated object, or _id vs id)
    const recipientId = (recipient as any)._id || (recipient as any).id || (typeof recipient === 'string' ? recipient : null);

    if (!recipientId) {
        toast.error("Contact information missing");
        return;
    }

    try {
      const formData = new FormData();
      formData.append("conversationId", selectedConversation._id);
      formData.append("recipientId", String(recipientId));
      formData.append("content", inputText);
      
      attachments.forEach(file => {
        formData.append("attachments", file);
      });

      const res = await api.post("/chat/send-message", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setInputText("");
        setAttachments([]);
        fetchConversations();
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await api.patch(`/chat/delete-message/${messageId}`);
      if (res.data.success) {
        setMessages(prev => 
          prev.map(msg => msg._id === messageId ? { ...msg, isDeleted: true } : msg)
        );
        toast.success("Message removed");
      }
    } catch (err) {
      toast.error("Failed to remove message");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments([...attachments, ...Array.from(files)]);
    }
  };

  const handleUserSearch = async (term: string) => {
    if (!term.trim()) {
      setUserSearchResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const res = await api.get(`/chat/users?searchTerm=${term}`);
      if (res.data.success) {
        setUserSearchResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleStartNewConversation = async (user: any) => {
    try {
      const res = await api.post("/chat/conversation", { recipientId: user._id });
      if (res.data.success) {
        let newConv = res.data.data;
        
        // Safety: If participants aren't populated for some reason, 
        // inject the user data we already have from search
        if (newConv.participants.some((p: any) => typeof p === 'string')) {
            newConv.participants = newConv.participants.map((p: any) => 
                String(p) === String(user._id) ? user : p
            );
        }

        // Check if we already have it in list
        const existing = conversations.find(c => String(c._id) === String(newConv._id));
        if (!existing) {
          fetchConversations();
        }
        setSelectedConversation(newConv);
        setIsSearchMode(false);
        setSearchQuery("");
      }
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };



  const conversationList = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardPageLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <DashboardHeader
          title="Messenger"
          description="Real-time communication with your team and clients."
        />

        <div className="flex flex-1 overflow-hidden mt-6 rounded-2xl border shadow-lg bg-card relative">
          {/* Conversation Sidebar */}
          <div className={cn(
            "w-full md:w-80 border-r flex flex-col bg-muted/20 transition-all duration-300 md:translate-x-0 absolute md:relative z-20 h-full",
            mobileShowSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="p-4 border-b space-y-4 bg-card/40 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isSearchMode ? "Search all users..." : "Search chats..."}
                    className="pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (isSearchMode) handleUserSearch(e.target.value);
                    }}
                  />
                </div>
                {!isCustomer && (
                  <Button
                    variant={isSearchMode ? "default" : "outline"}
                    size="icon"
                    className="rounded-xl shrink-0 h-10 w-10 transition-all"
                    onClick={() => {
                      setIsSearchMode(!isSearchMode);
                      setSearchQuery("");
                      setUserSearchResults([]);
                    }}
                  >
                    {isSearchMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {isSearchMode ? (
                  <>
                    <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary/50">User Search Results</p>
                    {searchingUsers ? (
                      <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
                    ) : userSearchResults.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground text-xs font-medium">Type to search users...</div>
                    ) : (
                      userSearchResults.map(user => (
                        <button
                          key={user._id}
                          onClick={() => handleStartNewConversation(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all text-left"
                        >
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={user.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${user.profile_image}` : ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold truncate">{user.name}</h4>
                              {onlineUsers.includes(String(user._id)) ? (
                                <span className="text-[7px] font-black uppercase text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">Online</span>
                              ) : (
                                <span className={cn(
                                    "text-[7px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                                    (user.lastOnline || user.updatedAt) ? "text-muted-foreground bg-muted/50 border-muted/20" : "text-amber-600 bg-amber-50 border-amber-100"
                                )}>
                                  {(() => {
                                      const date = new Date(user.lastOnline || user.updatedAt || user.createdAt);
                                      return isValid(date) ? `Seen ${formatDistanceToNow(date, { addSuffix: true })}` : "Away";
                                  })()}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">{user.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary/50">Recent Conversations</p>
                    {loadingConversations ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-3 animate-pulse">
                          <div className="h-10 w-10 bg-muted rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-3 bg-muted rounded w-3/4" />
                          </div>
                        </div>
                      ))
                    ) : conversationList.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground text-sm">
                        No active chats
                      </div>
                    ) : (
                      conversationList.map(conv => {
                        const otherUser = getOtherUser(conv);
                        const isActive = selectedConversation?._id === conv._id;
                        return (
                          <button
                            key={conv._id}
                            onClick={() => setSelectedConversation(conv)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-all relative group",
                              isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent"
                            )}
                          >
                            <div className="relative">
                                <Avatar className={cn(
                                    "h-10 w-10 border shadow-sm",
                                    onlineUsers.includes(String(otherUser?._id)) && !isActive && "ring-2 ring-emerald-500 ring-offset-2"
                                )}>
                                    <AvatarImage src={otherUser?.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${otherUser.profile_image}` : ""} />
                                    <AvatarFallback className={cn("font-bold text-xs", isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                                        {otherUser?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                {onlineUsers.includes(String(otherUser?._id)) && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex justify-between items-center pr-1">
                                <h4 className={cn(
                                    "text-sm truncate",
                                    !isActive && (conv.unreadCount ?? 0) > 0 ? "font-black" : "font-bold"
                                )}>
                                    {otherUser?.name || "Anonymous"}
                                </h4>
                                {conv.lastMessage && (
                                  <div className="flex flex-col items-end shrink-0 pl-2">
                                      <span className={cn("text-[10px]", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                        {format(new Date(conv.lastMessage.createdAt), "HH:mm")}
                                      </span>
                                      {!onlineUsers.includes(String(otherUser?._id)) && (
                                         <span className={cn("text-[8px] mt-0.5 whitespace-nowrap", isActive ? "text-primary-foreground/50 italic font-medium" : "text-muted-foreground/60")}>
                                            {(() => {
                                                const date = new Date(otherUser?.lastOnline || otherUser?.updatedAt || otherUser?.createdAt);
                                                return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "Away";
                                            })()}
                                         </span>
                                      )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <p className={cn(
                                    "text-xs truncate",
                                    !isActive && (conv.unreadCount ?? 0) > 0 ? "font-bold text-foreground" : "font-medium text-muted-foreground",
                                    isActive ? "text-primary-foreground/80" : ""
                                )}>
                                    {conv.lastMessage?.isDeleted ? "Message removed" : conv.lastMessage?.content || "Start a conversation"}
                                </p>
                                {!isActive && (conv.unreadCount ?? 0) > 0 && (
                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                                        {conv.unreadCount}
                                    </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Chat Area */}
          <div className={cn(
               "flex-1 flex flex-col bg-background relative overflow-hidden transition-all duration-300 md:ml-0 h-full",
               mobileShowSidebar ? "hidden md:flex" : "flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className={cn("p-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm z-10 transition-all", isMessageSearchMode ? "h-[73px]" : "h-[73px]")}>
                  <div className="flex items-center gap-3 flex-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden rounded-full h-8 w-8 -ml-2"
                        onClick={() => setMobileShowSidebar(true)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {!isMessageSearchMode ? (
                      <>
                        <div className="relative">
                            <Avatar className="h-10 w-10 border shadow-sm ring-2 ring-primary/10">
                                <AvatarImage src={getOtherUser(selectedConversation)?.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${getOtherUser(selectedConversation).profile_image}` : ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {getOtherUser(selectedConversation)?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            {onlineUsers.includes(String(getOtherUser(selectedConversation)?._id)) && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
                            )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold leading-tight truncate">{getOtherUser(selectedConversation)?.name}</h4>
                          <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">
                            {remoteTyping ? "Typing..." : (
                                onlineUsers.includes(String(getOtherUser(selectedConversation)?._id)) 
                                    ? "Online" 
                                    : (() => {
                                        const date = new Date(getOtherUser(selectedConversation)?.lastOnline || getOtherUser(selectedConversation)?.updatedAt);
                                        return isValid(date) ? `Seen ${formatDistanceToNow(date, { addSuffix: true })}` : "Away";
                                    })()
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative flex-1 animate-in slide-in-from-left-2 duration-300">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                              autoFocus
                              placeholder="Search messages..." 
                              value={messageSearchQuery}
                              onChange={(e) => setMessageSearchQuery(e.target.value)}
                              className="h-10 pl-10 text-sm bg-muted/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
                           />
                           <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    setIsMessageSearchMode(false);
                                    setMessageSearchQuery("");
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-white/20"
                           >
                                <X className="h-4 w-4" />
                           </Button>
                      </div>
                    )}
                  </div>

                  {!isMessageSearchMode && (
                    <div className="flex items-center gap-1 animate-in fade-in duration-300">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMessageSearchMode(true)}
                            className="rounded-full h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 p-1 rounded-2xl shadow-2xl border-primary/10">
                                <DropdownMenuItem 
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="gap-3 rounded-xl py-3 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 transition-all"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">View Profile</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">User details & info</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Messages List */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-stable"
                >
                  {messages.map((message, idx) => {
                    const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
                    const isSelf = String(senderId) === String(currentUserId);
                    const isMatch = messageSearchQuery && message.content?.toLowerCase().includes(messageSearchQuery.toLowerCase());

                    if (messageSearchQuery && !isMatch) return null;

                    return (
                      <div
                        key={message._id}
                        className={cn(
                          "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isSelf ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div className="flex items-end gap-2 px-1 mb-1">
                             {!isSelf && <span className="text-[10px] font-bold text-muted-foreground">{message.sender.name}</span>}
                             <span className="text-[9px] font-black text-muted-foreground/50">{format(new Date(message.createdAt), "HH:mm")}</span>
                        </div>

                        <div
                          className={cn(
                            "relative group px-4 py-2.5 rounded-2xl shadow-sm border transition-all duration-200",
                            message.isDeleted 
                              ? "bg-muted/30 text-muted-foreground italic border-dashed border-muted" 
                              : isSelf 
                                ? "bg-primary text-primary-foreground border-primary shadow-primary/20" 
                                : "bg-card text-foreground border-primary/10"
                          )}
                        >
                          {message.isDeleted ? (
                            <span className="text-xs flex items-center gap-1.5 opacity-60">
                              <Trash2 className="h-3 w-3" /> This message was removed
                            </span>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                                  {message.attachments.map((file, fIdx) => (
                                    <a
                                      key={fIdx}
                                      href={`${process.env.NEXT_PUBLIC_BASE_API}/${file}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors",
                                          isSelf ? "bg-white/10 hover:bg-white/20" : "bg-muted/50 hover:bg-muted"
                                      )}
                                    >
                                      {file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                        <ImageIcon className="h-4 w-4" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                      <span className="max-w-[120px] truncate">{file.split('-').pop()}</span>
                                    </a>
                                  ))}
                                </div>
                              )}

                              {isSelf && (
                                <div className="absolute top-1/2 -left-10 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-card shadow-sm border border-primary/5">
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="p-1 rounded-xl shadow-xl">
                                      <DropdownMenuItem 
                                        className="text-destructive focus:text-white focus:bg-destructive gap-2 font-bold text-xs"
                                        onClick={() => handleDeleteMessage(message._id)}
                                      >
                                        Delete Forever
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {remoteTyping && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse font-bold tracking-tight">
                        <div className="flex gap-1">
                            <div className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce delay-0" />
                            <div className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                            <div className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce delay-300" />
                        </div>
                        typing...
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-card/30 backdrop-blur-md">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 bg-muted/30 p-3 rounded-xl border border-dashed border-primary/20">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border text-[10px] font-bold shadow-sm animate-in zoom-in">
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="max-w-[120px] truncate uppercase tracking-tighter">{file.name}</span>
                          <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <Input
                        placeholder="Type message..."
                        className="pr-20 py-6 rounded-2xl bg-background border-muted-foreground/10 shadow-inner"
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            // handle typing notification here if needed
                        }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="center" side="top" className="w-[300px] p-2 rounded-2xl shadow-2xl border-primary/10">
                                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Quick Select Emojis</div>
                                    <ScrollArea className="h-[200px]">
                                        <div className="grid grid-cols-8 gap-1">
                                            {POPULAR_EMOJIS.map((emoji, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setInputText(prev => prev + emoji)}
                                                    className="h-8 w-8 flex items-center justify-center hover:bg-primary/10 rounded-lg text-xl transition-all hover:scale-125"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Button type="submit" className={cn(
                        "h-12 w-12 rounded-2xl shadow-lg transition-transform active:scale-95",
                        inputText.trim() || attachments.length > 0 ? "bg-primary shadow-primary/30" : "bg-muted text-muted-foreground grayscale cursor-not-allowed"
                    )}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>

                {/* Profile Modal */}
                <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                  <DialogContent className="p-0 border-none rounded-[32px] overflow-hidden max-w-sm sm:max-w-md shadow-2xl bg-card">
                    <div className="h-40 bg-primary relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-600" />
                         <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                            <div className="relative">
                              <Avatar className="h-28 w-28 border-[6px] border-card shadow-2xl ring-1 ring-black/5">
                                  <AvatarImage src={getOtherUser(selectedConversation)?.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${getOtherUser(selectedConversation).profile_image}` : ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                                      {getOtherUser(selectedConversation)?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                              </Avatar>
                              {onlineUsers.includes(String(getOtherUser(selectedConversation)?._id)) && (
                                  <div className="absolute bottom-2 right-2 h-6 w-6 bg-emerald-500 border-[4px] border-card rounded-full shadow-lg" />
                              )}
                            </div>
                         </div>
                    </div>
                    <div className="pt-20 pb-10 px-8 text-center space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{getOtherUser(selectedConversation)?.name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-[11px] uppercase font-black tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    {getOtherUser(selectedConversation)?.role || "User"}
                                </span>
                                {onlineUsers.includes(String(getOtherUser(selectedConversation)?._id)) ? (
                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 ml-1">
                                        <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Active Now
                                    </span>
                                ) : (() => {
                                    const date = new Date(getOtherUser(selectedConversation)?.lastOnline || getOtherUser(selectedConversation)?.updatedAt || getOtherUser(selectedConversation)?.createdAt);
                                    return isValid(date) 
                                        ? <span className="text-[11px] font-bold text-muted-foreground/80 italic ml-1">Last seen {formatDistanceToNow(date, { addSuffix: true })}</span>
                                        : <span className="text-[11px] font-bold text-muted-foreground/80 italic ml-1">Away</span>;
                                })()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5 text-left">
                            <div className="group p-4 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">Contact Email</p>
                                        <p className="text-sm font-bold text-foreground truncate">{getOtherUser(selectedConversation)?.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group p-4 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">Phone Number</p>
                                        <p className="text-sm font-bold text-foreground truncate">{getOtherUser(selectedConversation)?.phone_number || "Not available"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group p-4 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">Joined Platform</p>
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {getOtherUser(selectedConversation)?.createdAt ? format(new Date(getOtherUser(selectedConversation).createdAt), "PPP") : "User since 2024"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full rounded-[20px] h-14 font-black text-base shadow-xl active:scale-[0.98] transition-all duration-200 bg-primary hover:bg-primary/90"
                            onClick={() => setIsProfileModalOpen(false)}
                        >
                            Close Profile
                        </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground animate-in fade-in duration-700">
                <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-8 ring-primary/[0.02]">
                    <MessageSquare className="h-10 w-10 text-primary opacity-30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Your Workspace</h3>
                <p className="max-w-[320px] text-sm font-medium leading-relaxed">
                  Select a contact from the sidebar to start a real-time secure conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
