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
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PencilSquareIcon, ArchiveBoxIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";

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
  isProtected: boolean;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
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

export const ChatSidebar = ({ chats, selectedChatId, onChatSelect, onNewChat, isProtected, showTooltip, setShowTooltip }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <h1 className="text-xl font-semibold">Losser GPT</h1>
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <ShieldCheckIcon 
              className={`w-5 h-5 ${isProtected ? 'text-green-500' : 'text-gray-400'}`}
            />
            {showTooltip && (
              <div className="absolute left-0 top-full mt-2 px-3 py-1 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap z-50">
                {isProtected ? 'Gegevensbescherming ingeschakeld' : 'Gegevensbescherming uitgeschakeld'}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => {
            onNewChat();
            if (isMobile) setIsDrawerOpen(false);
          }}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Nieuwe chat +
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["active", "archived"]} className="space-y-2">
          <AccordionItem value="active" className="border-none">
            <AccordionTrigger className="py-2 px-3 text-sm font-medium text-muted-foreground hover:no-underline">
              Actieve Chats
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="group flex items-center justify-between px-3 py-2 hover:bg-secondary rounded-md cursor-pointer"
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <div className="flex items-center gap-1 invisible group-hover:visible">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(chat);
                        }}
                        className="h-6 w-6 hover:bg-secondary-foreground/10"
                      >
                        <PencilSquareIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveChat(chat.id, chat.archived);
                        }}
                        className="h-6 w-6 hover:bg-secondary-foreground/10"
                      >
                        <ArchiveBoxIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {archivedChats.length > 0 && (
            <AccordionItem value="archived" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm font-medium text-muted-foreground hover:no-underline">
                Gearchiveerde Chats
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {archivedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="group flex items-center justify-between px-3 py-2 hover:bg-secondary rounded-md cursor-pointer"
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5" />
                        <span className="truncate">{chat.title}</span>
                      </div>
                      <div className="flex items-center gap-1 invisible group-hover:visible">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTitle(chat);
                          }}
                          className="h-6 w-6 hover:bg-secondary-foreground/10"
                        >
                          <PencilSquareIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveChat(chat.id, chat.archived);
                          }}
                          className="h-6 w-6 hover:bg-secondary-foreground/10"
                        >
                          <ArchiveBoxIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </nav>

      <div className="p-2 border-t">
        <NavItem 
          icon={Settings} 
          label="Instellingen" 
          onClick={() => {
            setShowSettings(true);
            if (isMobile) setIsDrawerOpen(false);
          }}
        />
        <NavItem 
          icon={HelpCircle} 
          label="Help" 
          onClick={() => {
            navigate("/help");
            if (isMobile) setIsDrawerOpen(false);
          }}
        />
        <NavItem 
          icon={LogOut} 
          label="Uitloggen" 
          onClick={handleLogout}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <SidebarContent />
          </DrawerContent>
        </Drawer>
        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </>
    );
  }

  return (
    <div className="w-64 h-screen flex flex-col bg-background border-r">
      <SidebarContent />
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};