import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, ArchiveBoxIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chat } from "@/types/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const activeChats = chats.filter((chat) => !chat.archived);
  const archivedChats = chats.filter((chat) => chat.archived);

  const updateChatTitle = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const { error } = await supabase
        .from("chats")
        .update({ title })
        .eq("id", chatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setEditingChatId(null);
      setNewTitle("");
      toast({
        description: "Chat titel is bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de chat titel.",
      });
    },
  });

  const toggleArchiveChat = useMutation({
    mutationFn: async (chat: Chat) => {
      const { error } = await supabase
        .from("chats")
        .update({ archived: !chat.archived })
        .eq("id", chat.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast({
        description: "Chat status is bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fout",
        description:
          "Er is een fout opgetreden bij het bijwerken van de chat status.",
      });
    },
  });

  const handleEditClick = (chat: Chat) => {
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
  };

  const handleTitleSubmit = (chatId: string) => {
    if (newTitle.length > 10) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "De titel mag maximaal 10 karakters bevatten.",
      });
      return;
    }
    updateChatTitle.mutate({ chatId, title: newTitle });
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={`group flex items-center justify-between p-2 hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer relative ${
        selectedChatId === chat.id ? 'bg-accent text-accent-foreground font-medium' : ''
      }`}
      onClick={() => onChatSelect(chat.id)}
    >
      <div className="flex-1 min-w-0">
        {editingChatId === chat.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTitleSubmit(chat.id);
            }}
            className="flex items-center space-x-2"
          >
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8"
              maxLength={10}
              onClick={(e) => e.stopPropagation()}
            />
          </form>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="truncate">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(chat);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PencilIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleArchiveChat.mutate(chat);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
      >
        <ArchiveBoxIcon className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <div className="w-64 h-screen p-4 border-r bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex items-center space-x-2">
          {isProtected && (
            <TooltipProvider>
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <div>
                    <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gegevens zijn beschermd</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button onClick={onNewChat} size="sm" className="w-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nieuwe Chat
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["active", "archived"]} className="space-y-4">
        <AccordionItem value="active">
          <AccordionTrigger className="text-sm font-medium">
            Actieve Chats
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {activeChats.map(renderChatItem)}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="archived">
          <AccordionTrigger className="text-sm font-medium">
            Gearchiveerde Chats
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {archivedChats.map(renderChatItem)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
