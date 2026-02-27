import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
  className?: string;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ className }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    soundEffects: true,
    autoDownload: false,
    language: 'en',
    offlineMode: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings(p => ({ ...p, [key]: !p[key] }));

  const sections = [
    {
      title: 'Notifications', icon: Bell, items: [
        { key: 'notifications' as const, label: 'Push Notifications', desc: 'Get notified about achievements, streaks and updates' },
        { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive weekly progress reports via email' },
      ]
    },
    {
      title: 'Preferences', icon: Moon, items: [
        { key: 'soundEffects' as const, label: 'Sound Effects', desc: 'Play sounds for XP gain, level up, etc.' },
        { key: 'autoDownload' as const, label: 'Auto-Download', desc: 'Automatically download enrolled course content' },
        { key: 'offlineMode' as const, label: 'Offline Mode', desc: 'Enable offline access to downloaded content' },
      ]
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {sections.map(section => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{section.title}</h3>
          </div>
          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <Switch checked={settings[item.key] as boolean} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-primary" /><h3 className="font-semibold">Account</h3></div>
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">Change Password</Button>
          <Button variant="outline" size="sm" className="w-full text-accent border-accent/30 hover:bg-accent/5" leftIcon={<Trash2 className="h-4 w-4" />}>Delete Account</Button>
        </div>
      </div>
    </div>
  );
};

export { SettingsForm };
