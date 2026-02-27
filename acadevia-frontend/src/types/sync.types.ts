export interface SyncBatchRequest { deviceId: string; items: SyncItem[]; lastSyncTimestamp: string; }
export interface SyncItem { entityType: string; entityId: string; action: 'CREATE' | 'UPDATE' | 'DELETE'; data: Record<string, unknown>; clientTimestamp: string; version: number; }
export interface SyncBatchResponse { syncedCount: number; conflictCount: number; serverUpdates: SyncItem[]; conflicts: SyncConflict[]; serverTimestamp: string; }
export interface SyncConflict { entityType: string; entityId: string; clientData: Record<string, unknown>; serverData: Record<string, unknown>; resolution?: string; }
