import { api } from './api';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
  enableMaintenanceMode: boolean;
  currency: string;
  paymentGateway: string;
  escrowEnabled: boolean;
  escrowDuration: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  minPasswordLength: number;
  requireStrongPassword: boolean;
  sessionTimeout: number;
}

export const settingsApi = {
  getSettings: async (): Promise<SiteSettings> => {
    const response = await api.get('/settings');
    return response.data.data;
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const response = await api.patch('/settings', settings);
    return response.data.data;
  },
};
