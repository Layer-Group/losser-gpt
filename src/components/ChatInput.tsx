import { useState } from "react";
import { Send } from "lucide-react";
import { Loader2 } from "lucide-react";
import { containsProfanity } from "@/utils/profanityCheck";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showProfanityAlert, setShowProfanityAlert] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      if (containsProfanity(message)) {
        setShowProfanityAlert(true);
        return;
      }
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleProfanityConfirm = () => {
    setShowProfanityAlert(false);
    setMessage("");
    toast({
      variant: "destructive",
      title: "Waarschuwing",
      description: "Je bericht bevat ongepast taalgebruik en is gerapporteerd.",
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2 max-w-4xl mx-auto px-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Typ een bericht..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 dark:glass-morphism"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      <AlertDialog open={showProfanityAlert} onOpenChange={setShowProfanityAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ongepast taalgebruik gedetecteerd</AlertDialogTitle>
            <AlertDialogDescription>
              Je bericht bevat ongepast taalgebruik. Dit is niet toegestaan en zal worden gerapporteerd. 
              Houd de communicatie respectvol en professioneel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowProfanityAlert(false)}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleProfanityConfirm}>
              Begrepen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};