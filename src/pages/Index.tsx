import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";

interface Message {
  content: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [...prev, { content, isUser: true }]);
    // Here you would typically make an API call to OpenAI
    // For now, we'll just echo back a response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          content: "This is a placeholder response. OpenAI integration coming soon!",
          isUser: false,
        },
      ]);
    }, 1000);
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
        <ChatInput onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
};

export default Index;