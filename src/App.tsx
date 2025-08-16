import React, { Suspense } from "react";

const Profile = React.lazy(() => import('./pages/Profile'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FlashCards = React.lazy(() => import('./pages/FlashCards'));
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DyslexiaTest from "./pages/DyslexiaTest";
import SpellingWorld from "./pages/SpellingWorld";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="ml-64 p-8">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dyslexia-test" element={<DyslexiaTest />} />
                <Route path="/spelling-world" element={<SpellingWorld />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/flash-cards" element={<FlashCards />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
