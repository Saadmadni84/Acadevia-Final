import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  MapPin,
  Users,
} from 'lucide-react';

const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional(),
  principalName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

type SchoolForm = z.infer<typeof schoolSchema>;

interface School {
  id: string;
  name: string;
  state: string;
  city: string;
  students: number;
  teachers: number;
  status: 'active' | 'inactive';
  address?: string;
  principalName?: string;
  contactEmail?: string;
}

const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Kerala'];

const mockSchools: School[] = Array.from({ length: 42 }, (_, i) => ({
  id: `school-${i + 1}`,
  name: `School ${i + 1}`,
  state: states[i % states.length],
  city: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Delhi', 'Ahmedabad', 'Jaipur', 'Kochi'][i % 8],
  students: Math.floor(Math.random() * 500) + 100,
  teachers: Math.floor(Math.random() * 40) + 10,
  status: Math.random() > 0.15 ? 'active' : 'inactive',
}));

const PAGE_SIZE = 10;

const SchoolManagement: React.FC = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolForm>({
    resolver: zodResolver(schoolSchema),
  });

  const cities = useMemo(() => [...new Set(schools.map((s) => s.city))].sort(), [schools]);

  const filtered = useMemo(() => {
    let result = schools.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filterState) result = result.filter((s) => s.state === filterState);
    if (filterCity) result = result.filter((s) => s.city === filterCity);
    return result;
  }, [schools, search, filterState, filterCity]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditingSchool(null);
    reset({ name: '', state: '', city: '', address: '', principalName: '', contactEmail: '' });
    setModalOpen(true);
  };

  const openEdit = (school: School) => {
    setEditingSchool(school);
    reset({
      name: school.name,
      state: school.state,
      city: school.city,
      address: school.address ?? '',
      principalName: school.principalName ?? '',
      contactEmail: school.contactEmail ?? '',
    });
    setModalOpen(true);
  };

  const onSubmit = (data: SchoolForm) => {
    if (editingSchool) {
      setSchools((prev) =>
        prev.map((s) => (s.id === editingSchool.id ? { ...s, ...data } : s))
      );
    } else {
      setSchools((prev) => [
        {
          id: crypto.randomUUID(),
          ...data,
          students: 0,
          teachers: 0,
          status: 'active',
        },
        ...prev,
      ]);
    }
    setModalOpen(false);
    reset();
  };

  const deleteSchool = (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.schools.title', 'School Management')}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {t('admin.schools.importCSV', 'Import CSV')}
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t('admin.schools.addSchool', 'Add School')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('admin.schools.search', 'Search schools...')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            aria-label={t('admin.schools.search', 'Search schools')}
          />
        </div>
        <select
          value={filterState}
          onChange={(e) => { setFilterState(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          aria-label={t('admin.schools.filterState', 'Filter by state')}
        >
          <option value="">{t('admin.schools.allStates', 'All States')}</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterCity}
          onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          aria-label={t('admin.schools.filterCity', 'Filter by city')}
        >
          <option value="">{t('admin.schools.allCities', 'All Cities')}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full min-w-[700px] text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.name', 'School Name')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.state', 'State')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.city', 'City')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.students', 'Students')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.teachers', 'Teachers')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{t('admin.schools.status', 'Status')}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((school) => (
              <tr
                key={school.id}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white">{school.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{school.state}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> {school.city}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{school.students}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{school.teachers}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    school.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {school.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(school)}
                      className="rounded p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      aria-label={t('common.edit', 'Edit')}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteConfirm === school.id
                          ? deleteSchool(school.id)
                          : setDeleteConfirm(school.id)
                      }
                      className={`rounded p-1.5 transition-colors ${
                        deleteConfirm === school.id
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      aria-label={
                        deleteConfirm === school.id
                          ? t('common.confirmDelete', 'Confirm delete')
                          : t('common.delete', 'Delete')
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {t('admin.schools.noResults', 'No schools found')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.showing', 'Showing')} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} {t('common.of', 'of')} {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={t('common.previous', 'Previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={t('common.next', 'Next')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl"
              role="dialog"
              aria-label={editingSchool ? t('admin.schools.editSchool', 'Edit School') : t('admin.schools.addSchool', 'Add School')}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingSchool
                    ? t('admin.schools.editSchool', 'Edit School')
                    : t('admin.schools.addSchool', 'Add School')}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.schools.name', 'School Name')} *
                  </label>
                  <input
                    id="schoolName"
                    {...register('name')}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="schoolState" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.schools.state', 'State')} *
                    </label>
                    <select
                      id="schoolState"
                      {...register('state')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="">Select...</option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="schoolCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.schools.city', 'City')} *
                    </label>
                    <input
                      id="schoolCity"
                      {...register('city')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.schools.address', 'Address')}
                  </label>
                  <input
                    id="schoolAddress"
                    {...register('address')}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.schools.principal', 'Principal Name')}
                    </label>
                    <input
                      id="principalName"
                      {...register('principalName')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.schools.email', 'Contact Email')}
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      {...register('contactEmail')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    {editingSchool ? t('common.update', 'Update') : t('common.add', 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export { SchoolManagement };
export default SchoolManagement;
export { SchoolManagement };
