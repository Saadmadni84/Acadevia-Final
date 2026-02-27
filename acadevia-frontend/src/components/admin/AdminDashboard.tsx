import React from 'react';
import { motion } from 'framer-motion';
import { Users, School, BookOpen, Activity, Settings, Shield, AlertTriangle } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const userGrowth = [
  { month: 'Jan', users: 2400 }, { month: 'Feb', users: 3600 }, { month: 'Mar', users: 5200 },
  { month: 'Apr', users: 7800 }, { month: 'May', users: 9400 }, { month: 'Jun', users: 12000 },
];

const AdminDashboard: React.FC = () => (
  <div className="space-y-6 p-1">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
      </div>
      <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />}>Settings</Button>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard label="Total Users" value={124500} icon={<Users className="h-5 w-5" />} trend={15} />
      <StatsCard label="Schools" value={342} icon={<School className="h-5 w-5" />} trend={8} />
      <StatsCard label="Courses" value={156} icon={<BookOpen className="h-5 w-5" />} />
      <StatsCard label="DAU" value={51200} icon={<Activity className="h-5 w-5" />} trend={22} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">User Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={userGrowth}><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="users" stroke="#5B2C6F" strokeWidth={2} dot={{ fill: '#5B2C6F' }} /></LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">System Health</h3>
        <div className="space-y-3">
          {[
            { label: 'API Gateway', status: 'healthy', uptime: '99.9%' },
            { label: 'Auth Service', status: 'healthy', uptime: '99.8%' },
            { label: 'Content Service', status: 'warning', uptime: '98.5%' },
            { label: 'Game Service', status: 'healthy', uptime: '99.7%' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', s.status === 'healthy' ? 'bg-secondary' : 'bg-warning')} />
                <span className="text-sm">{s.label}</span>
              </div>
              <span className="text-xs text-gray-500">{s.uptime}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'User Management', icon: Users, desc: 'Manage users and roles' },
        { label: 'School Management', icon: School, desc: 'Configure schools' },
        { label: 'Content Moderation', icon: Shield, desc: 'Review flagged content' },
        { label: 'System Alerts', icon: AlertTriangle, desc: '3 new alerts' },
      ].map((a, i) => (
        <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-left hover:border-primary/30 transition-colors">
          <a.icon className="h-8 w-8 text-primary mb-3" />
          <h4 className="font-semibold text-sm">{a.label}</h4>
          <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
        </motion.button>
      ))}
    </div>
  </div>
);

export default AdminDashboard;
