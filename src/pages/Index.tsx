import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Chat } from "@/types/chat";

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

const Index = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("chats")
        .insert([{ 
          user_id: user.id,
          archived: false 
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChatId(newChat.id);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het maken van een nieuwe chat. Probeer het opnieuw.",
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
        title: "Fout",
        description: "Er ging iets mis bij het versturen van je bericht. Probeer het opnieuw.",
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
          {(!selectedChatId || messages.length === 0) ? (
            <WelcomeScreen />
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