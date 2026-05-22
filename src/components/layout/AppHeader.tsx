import { motion } from 'framer-motion';
import { Activity, Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { NavigationMenu } from './NavigationMenu';

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profileName?: string;
}

export function AppHeader({ activeTab, onTabChange, profileName }: AppHeaderProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">SeizureTrack</h1>
            <p className="text-xs text-muted-foreground">
              {profileName ? `Welcome, ${profileName}` : 'Health Companion'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {['dashboard', 'seizures', 'medications', 'journal', 'appointments', 'emergency', 'reports', 'profile'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </Button>

          {/* Mobile/Tablet Navigation */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <NavigationMenu activeTab={activeTab} onTabChange={onTabChange} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
