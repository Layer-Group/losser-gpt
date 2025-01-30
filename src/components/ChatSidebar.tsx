import { MessageSquare, PenLine, Code, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors",
      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
    )}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

export const ChatSidebar = () => {
  return (
    <div className="w-64 h-screen flex flex-col bg-background border-r">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Custom GPT</h1>
        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          New chat +
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        <NavItem icon={MessageSquare} label="Chats" active />
        <NavItem icon={PenLine} label="Writing" />
        <NavItem icon={Code} label="Coding" />
      </nav>

      <div className="p-2 border-t">
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={HelpCircle} label="Help" />
        <NavItem icon={LogOut} label="Log Out" />
      </div>
    </div>
  );
};