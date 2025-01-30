import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Outlet />
  </TooltipProvider>
);

export default App;