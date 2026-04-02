import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Certificate from "./pages/Certificate";
import Admin from "./pages/Admin";
import Kiosk from "./pages/Kiosk";
import IpadAir from "./pages/IpadAir";
import JoinQueue from "./pages/JoinQueue";
import JoinDemo from "./pages/JoinDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/ipadair" element={<IpadAir />} />
          <Route path="/join/demo" element={<JoinDemo />} />
          <Route path="/join/:secret" element={<JoinQueue />} />
          <Route path="/c/demo" element={<Certificate />} />
          <Route path="/c/:code" element={<Certificate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
