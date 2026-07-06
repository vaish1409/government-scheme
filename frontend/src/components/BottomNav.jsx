import { NavLink } from 'react-router-dom';
import { Home, BookOpen, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const tabs = [
  { to: '/home', icon: Home, key: 'home' },
  { to: '/lessons', icon: BookOpen, key: 'lessons' },
  { to: '/schemes', icon: ShieldCheck, key: 'schemes' },
  { to: '/profile', icon: User, key: 'profile' },
];

export default function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-teal-light shadow-[0_-2px_16px_rgba(0,0,0,0.06)] z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={to}
            className="flex-1 py-2.5 flex flex-col items-center gap-1 tap-target"
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  className={`p-1.5 rounded-full ${isActive ? 'bg-teal-light' : ''}`}
                >
                  <Icon
                    size={24}
                    strokeWidth={2.2}
                    color={isActive ? '#0F6B5C' : '#6B7C79'}
                  />
                </motion.div>
                <span className={`text-xs font-medium ${isActive ? 'text-teal' : 'text-gray-500'}`}>
                  {t(key)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
