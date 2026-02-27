import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Globe } from 'lucide-react';
import AvatarSelector from './AvatarSelector';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  bio: z.string().max(250, 'Bio must be under 250 characters').optional().default(''),
  language: z.string().min(1, 'Please select a language'),
  avatarUrl: z.string().optional().default(''),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileProps {
  initialData: {
    name: string;
    bio?: string;
    school: string;
    className: string;
    section: string;
    language: string;
    avatarUrl?: string;
  };
  availableLanguages?: { code: string; label: string }[];
  presetAvatars?: string[];
  onSave: (data: EditProfileFormData) => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const defaultLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ur', label: 'اردو' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

export default function EditProfile({
  initialData,
  availableLanguages = defaultLanguages,
  presetAvatars = [],
  onSave,
  onCancel,
  isSaving = false,
}: EditProfileProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: initialData.name,
      bio: initialData.bio ?? '',
      language: initialData.language,
      avatarUrl: initialData.avatarUrl ?? '',
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl p-4 md:p-6"
    >
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        {t('profile.editProfile', 'Edit Profile')}
      </h1>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6" noValidate>
        {/* Avatar Selector */}
        <section
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('profile.avatar', 'Avatar')}
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            {t('profile.avatar', 'Avatar')}
          </h2>
          <Controller
            name="avatarUrl"
            control={control}
            render={({ field }) => (
              <AvatarSelector
                presetAvatars={presetAvatars}
                selectedAvatar={field.value ?? ''}
                onSelect={field.onChange}
              />
            )}
          />
        </section>

        {/* Name & Bio */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('profile.name', 'Name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-500" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-bio" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('profile.bio', 'Bio')}
            </label>
            <textarea
              id="edit-bio"
              rows={3}
              {...register('bio')}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-invalid={!!errors.bio}
              aria-describedby={errors.bio ? 'bio-error' : undefined}
            />
            {errors.bio && (
              <p id="bio-error" className="mt-1 text-xs text-red-500" role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>
        </section>

        {/* School Info (read-only) */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            {t('profile.schoolInfo', 'School Information')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.school', 'School')}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{initialData.school}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.class', 'Class')}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{initialData.className}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.section', 'Section')}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{initialData.section}</p>
            </div>
          </div>
        </section>

        {/* Language Preference */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label
            htmlFor="edit-language"
            className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <Globe className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            {t('profile.language', 'Language Preference')}
          </label>
          <select
            id="edit-language"
            {...register('language')}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            aria-invalid={!!errors.language}
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          {errors.language && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.language.message}
            </p>
          )}
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
