import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const leaderboardData = [
  { rank: 1, name: 'Aarav S.', xp: 48750, avatar: '🏆', badge: 'Diamond', trend: '+12' },
  { rank: 2, name: 'Priya M.', xp: 45200, avatar: '🥈', badge: 'Platinum', trend: '+8' },
  { rank: 3, name: 'Rohit K.', xp: 42800, avatar: '🥉', badge: 'Platinum', trend: '+5' },
  { rank: 4, name: 'Ananya D.', xp: 39600, avatar: '⭐', badge: 'Gold', trend: '+15' },
  { rank: 5, name: 'Vikram R.', xp: 37100, avatar: '⭐', badge: 'Gold', trend: '+3' },
];

const badgeColors: Record<string, string> = {
  Diamond: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  Platinum: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const rankIcons = [Crown, Medal, Medal];

const LeaderboardShowcase: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="leaderboard" className="py-20 bg-white dark:bg-card-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Compete on the <span className="gradient-text">Leaderboard</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Earn XP, climb the ranks, and see how you stack up against students across the country.
          </p>
        </motion.div>

        <div ref={ref} className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Stats Cards */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: Trophy, label: 'Weekly Champion', value: 'Aarav S.', sub: '48,750 XP earned this week' },
              { icon: TrendingUp, label: 'Biggest Climber', value: 'Ananya D.', sub: '+15 positions this week' },
              { icon: Star, label: 'Total Players', value: '50,000+', sub: 'Competing across all grades' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-3 glass-card overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Weekly Top 5
              </h3>
              <span className="text-xs text-gray-500">Updated live</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {leaderboardData.map((player, i) => {
                const RankIcon = rankIcons[i] || Star;
                return (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className={`px-5 py-3.5 flex items-center gap-4 transition-colors hover:bg-primary/5 ${
                      i === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200' :
                      i === 2 ? 'bg-orange-300 text-orange-800 dark:bg-orange-700 dark:text-orange-200' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {i < 3 ? <RankIcon className="h-3.5 w-3.5" /> : player.rank}
                    </span>

                    <span className="text-lg">{player.avatar}</span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{player.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColors[player.badge]}`}>
                        {player.badge}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold tabular-nums">{player.xp.toLocaleString()} XP</p>
                      <p className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-0.5">
                        <TrendingUp className="h-3 w-3" /> {player.trend}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link to={ROUTES.REGISTER}>
            <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Join the Leaderboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export { LeaderboardShowcase };
