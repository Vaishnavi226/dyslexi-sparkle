import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  TrendingUp, 
  Settings, 
  Sun, 
  Moon,
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 20,
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border glass z-50"
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-xl font-bold text-primary">Dyslexia Support</h1>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <motion.ul variants={itemVariants} className="space-y-2">
            {menuItems.map((item) => (
              <motion.li key={item.to} variants={itemVariants}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        {/* Bottom Controls */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="ml-2">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </Button>
          
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut size={16} />
              <span className="ml-2">Logout</span>
            </Button>
          ) : (
            <NavLink to="/login">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LogIn size={16} />
                <span className="ml-2">Login</span>
              </Button>
            </NavLink>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;