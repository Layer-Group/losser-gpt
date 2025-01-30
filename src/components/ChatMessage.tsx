import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUser?: boolean;
}

export const ChatMessage = ({ content, isUser }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full max-w-4xl mx-auto p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground dark:glass-morphism" 
            : "bg-secondary dark:bg-secondary/10"
        )}
      >
        {content}
      </div>
    </div>
  );
};