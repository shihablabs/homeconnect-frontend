import { api } from "./api";

export const subscribeToNewsletter = async (email: string) => {
  try {
    const response = await api.post(`/newsletter/subscribe`, {
      email,
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw apiError.response?.data || new Error("Failed to subscribe");
  }
};

export const getSubscribersList = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/newsletter/subscribers`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw apiError.response?.data || new Error("Failed to fetch subscribers");
  }
};
