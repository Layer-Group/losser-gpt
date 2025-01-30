import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

const Index = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chats
  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Chat[];
    }
  });

  // Fetch messages for selected chat
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedChatId
  });

  // Create new chat mutation
  const createChat = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .insert([{ user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChatId(newChat.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      // If no chat is selected, create a new one
      if (!selectedChatId) {
        await createChat.mutateAsync();
        return;
      }

      // Insert user message
      const { error: messageError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: selectedChatId,
            content,
            is_user: true
          }
        ]);

      if (messageError) throw messageError;

      // Get AI response
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: content }
      });

      if (error) throw error;

      // Insert AI response
      await supabase
        .from("messages")
        .insert([
          {
            chat_id: selectedChatId,
            content: data.reply,
            is_user: false
          }
        ]);

      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar 
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
        onNewChat={() => createChat.mutate()}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {!selectedChatId ? (
            <WelcomeScreen />
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Start a new conversation
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.is_user}
              />
            ))
          )}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Index;