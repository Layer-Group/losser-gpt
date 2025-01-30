import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  content: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { content, isUser: true }]);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: content }
      });

      if (error) throw error;

      setMessages((prev) => [...prev, { content: data.reply, isUser: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
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
      <ChatSidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                isUser={message.isUser}
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