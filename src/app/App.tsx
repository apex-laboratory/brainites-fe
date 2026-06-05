import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { AppRouter } from "@/app/router";
import { AppShell } from "@/components/shared/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <AppShell>
              <AppRouter />
            </AppShell>
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
