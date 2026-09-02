import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  RefreshCw,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wifi,
  Database,
  ToggleLeft,
  ToggleRight,
  Layers,
} from 'lucide-react';

type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface MicroService {
  name: string;
  status: ServiceStatus;
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface KafkaTopic {
  name: string;
  queueSize: number;
  consumers: number;
}

const generateErrorRateData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    rate: +(Math.random() * 2).toFixed(2),
  }));

const generateResponseTimeData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    ms: Math.floor(Math.random() * 150) + 50,
  }));

const initialServices: MicroService[] = [
  { name: 'API Gateway', status: 'healthy', uptime: 99.98, responseTime: 45, lastChecked: 'Just now' },
  { name: 'Auth Service', status: 'healthy', uptime: 99.95, responseTime: 62, lastChecked: 'Just now' },
  { name: 'User Service', status: 'healthy', uptime: 99.92, responseTime: 78, lastChecked: 'Just now' },
  { name: 'Course Service', status: 'healthy', uptime: 99.88, responseTime: 55, lastChecked: 'Just now' },
  { name: 'Content Service', status: 'degraded', uptime: 98.5, responseTime: 320, lastChecked: 'Just now' },
  { name: 'Quiz Service', status: 'healthy', uptime: 99.9, responseTime: 48, lastChecked: 'Just now' },
  { name: 'Notification Service', status: 'healthy', uptime: 99.85, responseTime: 92, lastChecked: 'Just now' },
  { name: 'Gamification Service', status: 'healthy', uptime: 99.93, responseTime: 67, lastChecked: 'Just now' },
  { name: 'Locale Service', status: 'healthy', uptime: 99.97, responseTime: 35, lastChecked: 'Just now' },
  { name: 'Leaderboard Service', status: 'down', uptime: 95.2, responseTime: 0, lastChecked: 'Just now' },
  { name: 'Config Server', status: 'healthy', uptime: 99.99, responseTime: 22, lastChecked: 'Just now' },
  { name: 'Service Registry', status: 'healthy', uptime: 99.99, responseTime: 18, lastChecked: 'Just now' },
];

const kafkaTopics: KafkaTopic[] = [
  { name: 'notifications', queueSize: 142, consumers: 3 },
  { name: 'user-events', queueSize: 58, consumers: 2 },
  { name: 'quiz-submissions', queueSize: 23, consumers: 4 },
  { name: 'gamification-events', queueSize: 89, consumers: 2 },
  { name: 'content-processing', queueSize: 312, consumers: 1 },
  { name: 'sync-events', queueSize: 5, consumers: 2 },
];

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; color: string; bg: string; dot: string }> = {
  healthy: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30',
    dot: 'bg-green-500',
  },
  degraded: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30',
    dot: 'bg-yellow-500',
  },
  down: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30',
    dot: 'bg-red-500',
  },
};

const SystemHealth: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<MicroService[]>(initialServices);
  const [errorRateData, setErrorRateData] = useState(generateErrorRateData);
  const [responseTimeData, setResponseTimeData] = useState(generateResponseTimeData);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        responseTime: s.status === 'down' ? 0 : Math.floor(Math.random() * 100) + 20,
        lastChecked: 'Just now',
      }))
    );
    setErrorRateData(generateErrorRateData());
    setResponseTimeData(generateResponseTimeData());
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const downCount = services.filter((s) => s.status === 'down').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.health.title', 'System Health')}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('admin.health.lastRefresh', 'Last refresh')}: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh (30s)'}
          >
            {autoRefresh ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {t('admin.health.autoRefresh', 'Auto-refresh')}
          </button>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t('admin.health.refresh', 'Refresh')}
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('admin.health.healthy', 'Healthy'), count: healthyCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: t('admin.health.degraded', 'Degraded'), count: degradedCount, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
          { label: t('admin.health.down', 'Down'), count: downCount, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} p-4 text-center border border-gray-200 dark:border-gray-700`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const cfg = statusConfig[service.status];
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border p-4 ${cfg.bg} transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${cfg.dot} ${service.status === 'down' ? 'animate-pulse' : ''}`} />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                </div>
                <span className={cfg.color}>{cfg.icon}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('admin.health.uptime', 'Uptime')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{service.uptime}%</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('admin.health.responseTime', 'Response')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {service.status === 'down' ? '—' : `${service.responseTime}ms`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kafka Topics */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-purple-500" />
            {t('admin.health.kafkaQueues', 'Kafka Queue Sizes')}
          </h3>
          <div className="space-y-3">
            {kafkaTopics.map((topic) => (
              <div key={topic.name} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <Database className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{topic.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{topic.consumers} consumers</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    topic.queueSize > 200
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : topic.queueSize > 50
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {topic.queueSize}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Deployment */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Server className="h-5 w-5 text-blue-500" />
            {t('admin.health.deployment', 'Last Deployment')}
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Version', value: 'v2.4.1' },
              { label: 'Deployed', value: '2026-02-14 18:30 IST' },
              { label: 'Deployed By', value: 'CI/CD Pipeline' },
              { label: 'Commit', value: 'a3f8c2d' },
              { label: 'Environment', value: 'Production' },
              { label: 'Duration', value: '4m 32s' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('admin.health.errorRate', 'Error Rate (24h)')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" interval={3} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
              <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Chart */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 text-blue-500" />
            {t('admin.health.responseTimeChart', 'Avg Response Time (24h)')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" interval={3} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" unit="ms" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
              <Line type="monotone" dataKey="ms" stroke="#5B2C6F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export { SystemHealth };
export default SystemHealth;
