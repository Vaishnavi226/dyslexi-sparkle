import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DyslexiaTest from "./pages/DyslexiaTest";
import SpellingWorld from "./pages/SpellingWorld";
import FlashCards from "./pages/FlashCards";
import ARPlayground from "./pages/ARPlayground";
import VoicePractice from "./pages/VoicePractice";
import StoryMode from "./pages/StoryMode";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dyslexia-test" element={<DyslexiaTest />} />
                <Route path="/spelling-world" element={<SpellingWorld />} />
                <Route path="/flash-cards" element={<FlashCards />} />
                <Route path="/ar-playground" element={<ARPlayground />} />
                <Route path="/voice-practice" element={<VoicePractice />} />
                <Route path="/story-mode" element={<StoryMode />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
