import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, X, User } from 'lucide-react';

interface AvatarSelectorProps {
  presetAvatars?: string[];
  selectedAvatar: string;
  onSelect: (url: string) => void;
  maxFileSize?: number; // bytes, default 2MB
}

export default function AvatarSelector({
  presetAvatars = [],
  selectedAvatar,
  onSelect,
  maxFileSize = 2 * 1024 * 1024,
}: AvatarSelectorProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError(t('avatar.invalidType', 'Please select an image file'));
      return;
    }

    if (file.size > maxFileSize) {
      setError(t('avatar.tooLarge', 'Image must be under 2MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const confirmPreview = () => {
    if (preview) {
      onSelect(preview);
      setPreview(null);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('avatar.preview', 'Preview')}
            </p>
            <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-800">
              <img src={preview} alt={t('avatar.preview', 'Preview')} className="h-full w-full object-cover" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmPreview}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                aria-label={t('avatar.confirm', 'Confirm avatar')}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.confirm', 'Confirm')}
              </button>
              <button
                type="button"
                onClick={cancelPreview}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label={t('avatar.cancel', 'Cancel selection')}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Avatars Grid */}
      {presetAvatars.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('avatar.choosePreset', 'Choose an avatar')}
          </p>
          <div className="grid grid-cols-6 gap-3 sm:grid-cols-8" role="radiogroup" aria-label={t('avatar.presets', 'Preset avatars')}>
            {presetAvatars.map((url) => {
              const isSelected = selectedAvatar === url;
              return (
                <motion.button
                  key={url}
                  type="button"
                  onClick={() => onSelect(url)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={t('avatar.selectPreset', 'Select avatar')}
                  className={`relative h-12 w-12 overflow-hidden rounded-full transition ${
                    isSelected
                      ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'ring-2 ring-gray-200 hover:ring-gray-300 dark:ring-gray-600 dark:hover:ring-gray-500'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Custom */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {t('avatar.uploadCustom', 'Or upload your own')}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          aria-label={t('avatar.uploadPhoto', 'Upload custom photo')}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {t('avatar.uploadPhoto', 'Upload Photo')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Current Selection */}
      {selectedAvatar && !preview && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{t('avatar.current', 'Current')}:</span>
          <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-indigo-500">
            <img src={selectedAvatar} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {!selectedAvatar && !preview && (
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <User className="h-4 w-4" aria-hidden="true" />
          {t('avatar.noSelection', 'No avatar selected')}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
