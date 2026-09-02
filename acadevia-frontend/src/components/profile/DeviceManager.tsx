import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  LogOut,
  Shield,
  AlertTriangle,
  Check,
} from 'lucide-react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  lastActive: string;
  isCurrent: boolean;
  browser?: string;
  os?: string;
}

interface DeviceManagerProps {
  devices: Device[];
  onRemoveDevice: (deviceId: string) => void | Promise<void>;
  onLogoutAllDevices: () => void | Promise<void>;
}

const deviceIcons: Record<DeviceType, React.ElementType> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export default function DeviceManager({
  devices,
  onRemoveDevice,
  onLogoutAllDevices,
}: DeviceManagerProps) {
  const { t } = useTranslation();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('devices.title', 'Device Management')}
        </h1>
      </div>

      {/* Device List */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('devices.registeredDevices', 'Registered Devices')}
      >
        {devices.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700" role="list">
            {devices.map((device, idx) => {
              const Icon = deviceIcons[device.type];
              const isConfirming = confirmRemoveId === device.id;
              return (
                <motion.li
                  key={device.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                        {device.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            {t('devices.thisDev', 'This Device')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {device.browser && `${device.browser} · `}
                        {device.os && `${device.os} · `}
                        {t('devices.lastActive', 'Last active')}: {device.lastActive}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  {!device.isCurrent && (
                    <AnimatePresence mode="wait">
                      {isConfirming ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex gap-1"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onRemoveDevice(device.id);
                              setConfirmRemoveId(null);
                            }}
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                            aria-label={t('devices.confirmRemove', 'Confirm remove device')}
                          >
                            {t('common.confirm', 'Confirm')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            {t('common.cancel', 'Cancel')}
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="remove"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="button"
                          onClick={() => setConfirmRemoveId(device.id)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          aria-label={t('devices.remove', 'Remove device {{name}}', { name: device.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <p className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('devices.noDevices', 'No registered devices')}
          </p>
        )}
      </motion.section>

      {/* Log Out All Devices */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900 dark:bg-gray-800"
      >
        <AnimatePresence mode="wait">
          {confirmLogoutAll ? (
            <motion.div
              key="confirm-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {t('devices.logoutAllConfirm', 'This will log you out of all devices.')}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogoutAllDevices();
                    setConfirmLogoutAll(false);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t('devices.logoutAll', 'Log Out All')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLogoutAll(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="action-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setConfirmLogoutAll(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('devices.logoutAll', 'Log Out All Devices')}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
