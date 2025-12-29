
import { apiSlice } from "@/redux/api/apiSlice";

export const newsletterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribe: builder.mutation({
      query: (email) => ({
        url: "/newsletter/subscribe",
        method: "POST",
        body: { email },
      }),
    }),
    getAllSubscribers: builder.query({
      query: (params) => ({
        url: "/newsletter",
        method: "GET",
        params,
      }),
      providesTags: ["Newsletter"],
    }),
    updateSubscriberStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/newsletter/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Newsletter"],
    }),
    deleteSubscriber: builder.mutation({
      query: (id) => ({
        url: `/newsletter/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Newsletter"],
    }),
    sendBulkEmail: builder.mutation({
      query: (data) => ({
        url: "/newsletter/send",
        method: "POST",
        body: data,
      }),
    }),
    getMailLogs: builder.query({
      query: (params) => ({
        url: "/newsletter/logs",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useSubscribeMutation,
  useGetAllSubscribersQuery,
  useUpdateSubscriberStatusMutation,
  useDeleteSubscriberMutation,
  useSendBulkEmailMutation,
  useGetMailLogsQuery,
} = newsletterApiSlice;
