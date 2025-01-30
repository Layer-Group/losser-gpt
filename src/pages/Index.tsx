import { useState } from "react";
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

export default function Index() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chats, isLoading: isLoadingChats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data: chats, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return chats;
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return [];
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data: chat, error } = await supabase
        .from("chats")
        .insert([{ 
          title: "Nieuwe Chat",
          user_id: user.user.id 
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

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChatId) throw new Error("No chat selected");

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          chatId: selectedChatId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
    },
    onError: () => {
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
  };

  const isLoading = sendMessage.isPending;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        chats={chats || []}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {selectedChatId ? (
            messages?.map((message: Message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.is_user}
              />
            ))
          ) : (
            <WelcomeScreen />
          )}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}