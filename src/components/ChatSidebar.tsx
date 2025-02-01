import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types/chat";
import { Pencil, Trash2, Archive } from "lucide-react";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  isProtected: boolean;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
}

export function ChatSidebar({
  chats,
  selectedChatId,
  onChatSelect,
  onNewChat,
  isProtected,
  showTooltip,
  setShowTooltip,
}: ChatSidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const activeChats = chats.filter((chat) => !chat.archived);
  const archivedChats = chats.filter((chat) => chat.archived);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het uitloggen.",
      });
    }
  };

  const handleEditClick = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setNewTitle(currentTitle);
  };

  const handleTitleSubmit = async (chatId: string) => {
    if (newTitle.length > 12) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "De titel mag maximaal 12 karakters bevatten.",
      });
      return;
    }

    const { error } = await supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", chatId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de chat.",
      });
    } else {
      toast({
        title: "Chat bijgewerkt",
        description: "De chattitel is succesvol bijgewerkt.",
      });
      setEditingChatId(null);
      setNewTitle("");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de chat.",
      });
    } else {
      toast({
        title: "Chat verwijderd",
        description: "De chat is succesvol verwijderd.",
      });
      if (selectedChatId === chatId) {
        onNewChat();
      }
    }
  };

  const handleArchiveChat = async (chatId: string) => {
    const { error } = await supabase
      .from("chats")
      .update({ archived: true })
      .eq("id", chatId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het archiveren van de chat.",
      });
    } else {
      toast({
        title: "Chat gearchiveerd",
        description: "De chat is succesvol gearchiveerd.",
      });
    }
  };

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Losser GPT</h1>
          {isProtected && (
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
              {showTooltip && (
                <div className="absolute left-7 top-0 bg-popover text-popover-foreground p-2 rounded shadow-lg text-sm whitespace-nowrap">
                  Je gegevens zijn beschermd
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full mb-4"
          variant="outline"
        >
          Nieuwe chat +
        </Button>

        <div className="space-y-4 flex-1">
          <div>
            <h2 className="font-medium mb-2">Actieve Chats</h2>
            <div className="space-y-1">
              {activeChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between group">
                  <span
                    className={`cursor-pointer truncate flex-1 ${selectedChatId === chat.id ? 'font-bold' : ''}`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    {chat.title}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(chat.id, chat.title)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleArchiveChat(chat.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteChat(chat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {archivedChats.length > 0 && (
            <div>
              <h2 className="font-medium mb-2">Gearchiveerde Chats</h2>
              <div className="space-y-1">
                {archivedChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between group">
                    <span
                      className={`cursor-pointer truncate flex-1 ${selectedChatId === chat.id ? 'font-bold' : ''}`}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      {chat.title}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(chat.id, chat.title)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteChat(chat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => navigate('/help')}
          >
            Help
          </Button>
          <Button
            className="w-full text-destructive"
            variant="ghost"
            onClick={handleSignOut}
          >
            Uitloggen
          </Button>
        </div>
      </div>
    </div>
  );
}