import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const barData = [
  { name: 'Math', value: 92 }, { name: 'Science', value: 88 },
  { name: 'English', value: 95 }, { name: 'Hindi', value: 90 },
  { name: 'Social', value: 85 }, { name: 'Computer', value: 91 },
];
const lineData = [
  { day: 'Mon', value: 40 }, { day: 'Tue', value: 55 }, { day: 'Wed', value: 45 },
  { day: 'Thu', value: 70 }, { day: 'Fri', value: 65 }, { day: 'Sat', value: 80 }, { day: 'Sun', value: 75 },
];
const pieData = [
  { name: 'Math', value: 30 }, { name: 'Science', value: 25 },
  { name: 'English', value: 20 }, { name: 'Others', value: 25 },
];
const COLORS = ['#5B2C6F', '#D4A843', '#E74C3C', '#F39C12'];

const PlatformStats: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Platform <span className="gradient-text">Analytics</span></h2>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isIntersecting ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-500">Course Completion Rate</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#5B2C6F" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isIntersecting ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-500">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="value" stroke="#D4A843" strokeWidth={2} dot={{ fill: '#D4A843' }} /></LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isIntersecting ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-500">Subject Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { PlatformStats };
