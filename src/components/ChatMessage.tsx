import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser?: boolean;
  isLoading?: boolean;
}

export const ChatMessage = ({ content, isUser, isLoading }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full max-w-4xl mx-auto p-4",
        isUser ? "justify-end" : "justify-start",
        "animate-fade-in"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground dark:glass-morphism" 
            : "bg-secondary text-secondary-foreground dark:bg-secondary/10"
        )}
      >
        {!isUser && isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Antwoord genereren...</span>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
};