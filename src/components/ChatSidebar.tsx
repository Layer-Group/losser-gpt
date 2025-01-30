import { MessageSquare, Settings, HelpCircle, LogOut, Trash2, Archive, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsDialog } from "./SettingsDialog";
import { Chat } from "@/types/chat";
import { Input } from "./ui/input";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick, actions }: NavItemProps) => (
  <div className="group relative">
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left truncate">{label}</span>
      {actions && (
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {actions}
        </div>
      )}
    </button>
  </div>
);

export const ChatSidebar = ({ chats, selectedChatId, onChatSelect, onNewChat }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Fout bij uitloggen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["chats"] });

      toast({
        title: "Chat verwijderd",
        description: "De chat is permanent verwijderd.",
      });

      if (selectedChatId === chatId) {
        onNewChat();
      }
    } catch (error: any) {
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleArchiveChat = async (chatId: string, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ archived: !isArchived })
        .eq('id', chatId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["chats"] });

      toast({
        title: isArchived ? "Chat uit archief gehaald" : "Chat gearchiveerd",
        description: isArchived 
          ? "De chat is terug verplaatst naar actieve chats."
          : "De chat is verplaatst naar het archief.",
      });
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEditingTitle = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleUpdateTitle = async (chatId: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: editingTitle.slice(0, 10) })
        .eq('id', chatId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setEditingChatId(null);
      
      toast({
        title: "Titel bijgewerkt",
        description: "De chat titel is succesvol bijgewerkt.",
      });
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeChats = chats.filter(chat => !chat.archived);
  const archivedChats = chats.filter(chat => chat.archived);

  return (
    <div className="w-64 h-screen flex flex-col bg-background border-r">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Losser GPT</h1>
        <button 
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Nieuwe chat +
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="px-3 text-sm font-medium text-muted-foreground mb-2">Actieve Chats</h2>
          {activeChats.map((chat) => (
            <div key={chat.id} className="relative">
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value.slice(0, 10))}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateTitle(chat.id)}
                    className="h-8 w-8"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingChatId(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <NavItem
                  icon={MessageSquare}
                  label={chat.title}
                  active={chat.id === selectedChatId}
                  onClick={() => onChatSelect(chat.id)}
                  actions={
                    <div className="flex items-center gap-1 bg-background/80 rounded-md px-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(chat);
                        }}
                        className="h-6 w-6"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveChat(chat.id, chat.archived);
                        }}
                        className="h-6 w-6"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          ))}
        </div>

        {archivedChats.length > 0 && (
          <div className="mb-4">
            <h2 className="px-3 text-sm font-medium text-muted-foreground mb-2">Gearchiveerde Chats</h2>
            {archivedChats.map((chat) => (
              <NavItem
                key={chat.id}
                icon={MessageSquare}
                label={chat.title}
                active={chat.id === selectedChatId}
                onClick={() => onChatSelect(chat.id)}
                actions={
                  <div className="flex items-center gap-1 bg-background/80 rounded-md px-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveChat(chat.id, chat.archived);
                      }}
                      className="h-6 w-6"
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="h-6 w-6 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </nav>

      <div className="p-2 border-t">
        <NavItem 
          icon={Settings} 
          label="Instellingen" 
          onClick={() => setShowSettings(true)}
        />
        <NavItem 
          icon={HelpCircle} 
          label="Help" 
          onClick={() => navigate("/help")}
        />
        <NavItem 
          icon={LogOut} 
          label="Uitloggen" 
          onClick={handleLogout}
        />
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};