// frontend/src/services/syncService.ts
import { apiHelpers } from './api';

export interface SyncStatus {
  isActive: boolean;
  queueLength: number;
  lastSync: Date | null;
  nextSync: Date | null;
  progress: number;
  syncStats: Record<string, any>;
}

export interface SyncResponse {
  message: string;
  timestamp: Date;
}

export const syncService = {
  /**
   * Get current sync status
   */
  getStatus: async (): Promise<SyncStatus> => {
    return apiHelpers.get<SyncStatus>('/sync/status');
  },

  /**
   * Force sync all sources
   */
  syncAll: async (): Promise<SyncResponse> => {
    return apiHelpers.post<SyncResponse>('/sync/force');
  },

  /**
   * Force sync a specific source
   */
  syncSource: async (sourceId: number): Promise<any> => {
    return apiHelpers.post<any>(`/sync/source/${sourceId}`);
  },

  /**
   * Force sync sources by category
   */
  syncByCategory: async (categoryId: number): Promise<SyncResponse> => {
    // For now, we'll sync all and let the backend filter
    // In the future, we could add a specific endpoint for category sync
    return apiHelpers.post<SyncResponse>('/sync/force');
  }
};

export default syncService;
