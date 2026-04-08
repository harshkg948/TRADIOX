/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dashboard } from "./components/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Onboarding } from "./components/Onboarding";
import { Layout } from "lucide-react";

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">
        {/* Nature Background Elements */}
        <div className="nature-bg-element w-[600px] h-[600px] bg-primary/10 -top-48 -left-48 blob-shape animate-float" />
        <div className="nature-bg-element w-[400px] h-[400px] bg-accent/20 top-1/2 -right-24 blob-shape animate-sway" style={{ animationDelay: '-2s' }} />
        <div className="nature-bg-element w-[500px] h-[500px] bg-secondary/30 bottom-0 left-1/4 blob-shape animate-pulse-soft" />
        
        <Onboarding />
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 leaf-gradient rounded-xl flex items-center justify-center soft-shadow">
                <span className="text-white font-serif font-bold text-2xl">T</span>
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">TRADIOX</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">Nature AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-serif text-lg">Dashboard</a>
              <a href="#" className="hover:text-primary transition-colors font-serif text-lg">Markets</a>
              <a href="#" className="hover:text-primary transition-colors font-serif text-lg">Portfolio</a>
              <a href="#" className="hover:text-primary transition-colors font-serif text-lg">Academy</a>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Market Status</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> OPEN
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 soft-shadow">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src="https://picsum.photos/seed/nature-user/100/100" alt="User" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative">
          <Dashboard />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6 mt-12 bg-secondary/20">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                <span className="text-xs font-bold">T</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">TRADIOX</span>
              <span className="text-xs ml-4">© 2026 AI Trading Systems</span>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Risk Disclosure</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </footer>

        <Toaster position="bottom-right" theme="dark" />
      </div>
    </TooltipProvider>
  );
}

