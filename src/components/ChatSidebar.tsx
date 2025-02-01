import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { supabase } from "@/integrations/supabase/client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Chat } from "@/types/chat";

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

  const handleTitleSubmit = (chatId: string) => {
    if (newTitle.length > 12) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "De titel mag maximaal 12 karakters bevatten.",
      });
      return;
    }

    const updateChat = async () => {
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

    updateChat();
  };

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col">
      <div className="p-4 flex flex-col">
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

        <NavigationMenu className="mb-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink
                    className="block px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => navigate('/help')}
                  >
                    Help
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    className="block px-2 py-2 hover:bg-accent rounded-md cursor-pointer text-destructive"
                    onClick={handleSignOut}
                  >
                    Uitloggen
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Actieve Chats</h2>
            <div className="space-y-1">
              {activeChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between">
                  <span
                    className={`cursor-pointer ${selectedChatId === chat.id ? 'font-bold' : ''}`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    {chat.title}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => handleEditClick(chat.id, chat.title)}
                  >
                    Bewerken
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {archivedChats.length > 0 && (
            <div>
              <h2 className="font-medium mb-2">Gearchiveerde Chats</h2>
              <div className="space-y-1">
                {archivedChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between">
                    <span
                      className={`cursor-pointer ${selectedChatId === chat.id ? 'font-bold' : ''}`}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      {chat.title}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => handleEditClick(chat.id, chat.title)}
                    >
                      Bewerken
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
