import React from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useSyncData } from '../hooks/useSyncData';
import { useI18n } from '../i18n/I18nContext';

const SyncIndicator: React.FC = () => {
  const { syncStatus, syncData } = useSyncData();
  const { t } = useI18n();

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex items-center space-x-2">
      {syncStatus.isSyncing ? (
        <div className="flex items-center text-blue-600">
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          <span className="text-xs">{t('sync.syncing')}</span>
        </div>
      ) : syncStatus.error ? (
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">{t('sync.error')}</span>
        </div>
      ) : syncStatus.lastSuccessfulSync ? (
        <div className="flex items-center text-green-600">
          <Check className="w-4 h-4 mr-1" />
          <span className="text-xs">
            {t('sync.lastSync')}: {formatDate(syncStatus.lastSuccessfulSync)}
          </span>
        </div>
      ) : null}

      {syncStatus.pendingChanges > 0 && (
        <button
          onClick={() => syncData()}
          disabled={syncStatus.isSyncing}
          className="flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          {t('sync.pendingChanges', { count: syncStatus.pendingChanges })}
        </button>
      )}
    </div>
  );
};

export default SyncIndicator;