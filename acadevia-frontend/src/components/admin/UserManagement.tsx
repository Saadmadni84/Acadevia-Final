import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  KeyRound,
  ShieldCheck,
  User,
  Mail,
  Building2,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
type UserStatus = 'active' | 'inactive' | 'suspended';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school: string;
  status: UserStatus;
  lastActive: string;
  avatar: string;
  joinedDate: string;
}

const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

const mockUsers: AppUser[] = Array.from({ length: 55 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@acadevia.com`,
  role: roles[i % roles.length],
  school: `School ${(i % 8) + 1}`,
  status: (['active', 'inactive', 'suspended'] as UserStatus[])[Math.floor(Math.random() * 3)],
  lastActive: `${Math.floor(Math.random() * 48) + 1}h ago`,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User${i + 1}`,
  joinedDate: '2025-06-15',
}));

const PAGE_SIZE = 10;

const statusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  student: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  parent: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AppUser[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const schools = useMemo(() => [...new Set(users.map((u) => u.school))].sort(), [users]);

  const filtered = useMemo(() => {
    let result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (filterRole) result = result.filter((u) => u.role === filterRole);
    if (filterSchool) result = result.filter((u) => u.school === filterSchool);
    return result;
  }, [users, search, filterRole, filterSchool]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : prev));
    }
  };

  const toggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : prev
      );
    }
  };

  const resetPassword = (userId: string) => {
    console.log('Reset password for:', userId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.users.title', 'User Management')}
      </h2>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('admin.users.search', 'Search by name or email...')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            aria-label={t('admin.users.search', 'Search users')}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          aria-label={t('admin.users.filterRole', 'Filter by role')}
        >
          <option value="">{t('admin.users.allRoles', 'All Roles')}</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterSchool}
          onChange={(e) => { setFilterSchool(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          aria-label={t('admin.users.filterSchool', 'Filter by school')}
        >
          <option value="">{t('admin.users.allSchools', 'All Schools')}</option>
          {schools.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full min-w-[750px] text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.name', 'Name')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.email', 'Email')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.role', 'Role')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.school', 'School')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.status', 'Status')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.users.lastActive', 'Last Active')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="border-b border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedUser(user); }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="" className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.school}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {t('admin.users.noResults', 'No users found')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" aria-label="Previous">
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" aria-label="Next">
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Side Panel */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/30"
            onClick={() => setSelectedUser(null)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl p-6 overflow-y-auto"
              role="dialog"
              aria-label={t('admin.users.userDetails', 'User details')}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('admin.users.userDetails', 'User Details')}
                </h3>
                <button type="button" onClick={() => setSelectedUser(null)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img src={selectedUser.avatar} alt="" className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.users.role', 'Role')}</p>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => changeRole(selectedUser.id, e.target.value as UserRole)}
                      className="mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      aria-label="Change role"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.users.school', 'School')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.school}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.users.email', 'Email')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.users.lastActive', 'Last Active')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(selectedUser.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      selectedUser.status === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                    }`}
                  >
                    {selectedUser.status === 'active' ? (
                      <><ToggleRight className="h-5 w-5" /> {t('admin.users.deactivate', 'Deactivate User')}</>
                    ) : (
                      <><ToggleLeft className="h-5 w-5" /> {t('admin.users.activate', 'Activate User')}</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetPassword(selectedUser.id)}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <KeyRound className="h-4 w-4" />
                    {t('admin.users.resetPassword', 'Reset Password')}
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagement;
