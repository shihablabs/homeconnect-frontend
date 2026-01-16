


import { apiSlice } from '@/redux/api/apiSlice';
import { AuthUser, logout, setCredentials, updateUserProfile } from './authSlice';


interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiSingleResponse<T> {
  statusCode: number;
  success: boolean;
  message: string | null;
  data: T;
  meta?: ApiPagination;
}

interface ApiMessageResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

type LoginResponsePayload = {
  user: AuthUser;
  token: string;
};

type ProfileResponsePayload = AuthUser;

export const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string; email: string }, any>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse(response: ApiSingleResponse<{ message: string; email: string }>) {
        return response.data;
      },
      // Removed onQueryStarted as we don't auto-login anymore
    }),

    login: builder.mutation<LoginResponsePayload, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse(response: ApiSingleResponse<LoginResponsePayload>) {
        return response.data;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {

        }
      },
    }),

    logout: builder.mutation<ApiMessageResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          dispatch(logout());
        } finally {
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),

    refreshToken: builder.mutation<LoginResponsePayload, { refreshToken?: string }>({
      query: (body) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: body,
      }),
      transformResponse(response: ApiSingleResponse<LoginResponsePayload>) {
        return response.data;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          dispatch(logout());
        }
      },
    }),

    verifyEmail: builder.mutation<ApiMessageResponse, { token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: body,
      }),
    }),

    forgotPassword: builder.mutation<ApiMessageResponse, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: body,
      }),
    }),

    resetPassword: builder.mutation<ApiMessageResponse, any>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: body,
      }),
    }),

    changePassword: builder.mutation<ApiMessageResponse, any>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: body,
      }),
    }),

    getProfile: builder.query<ProfileResponsePayload, void>({
      query: () => '/auth/profile',
      transformResponse(
        response: ApiSingleResponse<ProfileResponsePayload>
      ): ProfileResponsePayload {
        return response.data;
      },
      providesTags: [{ type: 'User', id: 'PROFILE' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUserProfile(data));
        } catch (error) {

        }
      },
    }),

    updateProfile: builder.mutation<ProfileResponsePayload, Partial<AuthUser>>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      transformResponse(
        response: ApiSingleResponse<ProfileResponsePayload>
      ): ProfileResponsePayload {
        return response.data;
      },
      invalidatesTags: [{ type: 'User', id: 'PROFILE' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUserProfile(data));
        } catch (error) {

        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApiSlice;