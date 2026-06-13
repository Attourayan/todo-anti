"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, CheckSquare, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if deferredPrompt is already set on mount
    if (window.deferredPrompt) {
      const timer = setTimeout(() => {
        setIsInstallable(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    const handleInstallable = () => {
      setIsInstallable(true);
    };

    const handleInstalled = () => {
      setIsInstallable(false);
    };

    window.addEventListener('app-installable', handleInstallable);
    window.addEventListener('app-installed', handleInstalled);

    return () => {
      window.removeEventListener('app-installable', handleInstallable);
      window.removeEventListener('app-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;

    // Trigger the install prompt
    promptEvent.prompt();

    // Check user's choice
    const { outcome } = await promptEvent.userChoice;
    console.log(`[PWA] Install choice outcome: ${outcome}`);

    // Clean up
    window.deferredPrompt = null;
    setIsInstallable(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b border-white/10 dark:border-white/10 border-black/10 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
          <CheckSquare className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight text-black dark:text-white">TodoApp</span>
        </div>

        <div className="flex items-center gap-3">
          {isInstallable && (
            <Button
              onClick={handleInstallClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold h-9 rounded-lg transition-all"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Install App</span>
            </Button>
          )}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger >
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                <Avatar className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50">
                  <AvatarFallback className="text-indigo-700 dark:text-indigo-200">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black dark:text-white">
            <div className="px-2 py-1.5 text-sm font-medium">
              Signed in as <span className="text-indigo-400">{user.username}</span>
            </div>
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer focus:bg-red-950/50 focus:text-red-300">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
