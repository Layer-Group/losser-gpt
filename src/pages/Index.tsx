import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chat, Message } from "@/types/chat";
import { ShieldCheckIcon } from '@heroicons/react/24/solid'

export default function Index() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProtected, setIsProtected] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [user, setUser] = useState(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
          });
        }, 100);
      });
    }
  };

  // Add authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: chats, isLoading: isLoadingChats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: chats, error } = await supabase
        .from("chats")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return chats;
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return messages;
    },
    enabled: !!selectedChatId,
  });

  const createChat = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: chat, error } = await supabase
        .from("chats")
        .insert([{ 
          title: "Nieuwe Chat",
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChatId(chat.id);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van een nieuwe chat.",
      });
    },
  });

  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  // Add auto-scroll effect with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [localMessages, pendingMessage]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChatId) throw new Error("No chat selected");

      // Create a temporary message to show immediately
      const tempUserMessage: Message = {
        id: 'temp-' + Date.now(),
        chat_id: selectedChatId,
        content,
        is_user: true,
        created_at: new Date().toISOString(),
      };

      // Add the user message to local state immediately
      setLocalMessages(prev => [...prev, tempUserMessage]);

      // First, save the user's message
      const { error: messageError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: selectedChatId,
            content,
            is_user: true,
          },
        ]);

      if (messageError) throw messageError;

      // Set pending message for immediate display
      setPendingMessage({
        id: 'pending',
        chat_id: selectedChatId,
        content: '',
        is_user: false,
        created_at: new Date().toISOString(),
      });

      // Then call the Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          chatId: selectedChatId,
        },
      });

      setPendingMessage(null);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
    },
    onError: () => {
      setPendingMessage(null);
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het versturen van je bericht.",
      });
    },
  });

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessage.mutate(content);
  };

  const handleNewChat = () => {
    createChat.mutate();
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setLocalMessages([]); // Clear local messages when switching chats
  };

  const isLoading = sendMessage.isPending;

  const showWelcomeScreen = !selectedChatId || (localMessages.length === 0 && !messages?.length);

  // Voeg deze useEffect toe om de user op te halen
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect voor de gegevensbescherming status
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsProtected(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsProtected(false);
    }
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        chats={chats || []}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isProtected={isProtected}
        showTooltip={showTooltip}
        setShowTooltip={setShowTooltip}
      />
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {showWelcomeScreen ? (
            <WelcomeScreen />
          ) : (
            <>
              {localMessages.map((message: Message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.is_user}
                />
              ))}
              {pendingMessage && (
                <ChatMessage
                  key="pending"
                  content=""
                  isUser={false}
                  isLoading={true}
                />
              )}
              <div ref={messagesEndRef} className="h-px" />
            </>
          )}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
