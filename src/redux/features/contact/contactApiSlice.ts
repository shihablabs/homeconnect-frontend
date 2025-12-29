
import { apiSlice } from "@/redux/api/apiSlice";

export const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContact: builder.mutation({
      query: (data) => ({
        url: "/contact",
        method: "POST",
        body: data,
      }),
    }),
    getAllContacts: builder.query({
      query: (params) => ({
        url: "/contact",
        method: "GET",
        params,
      }),
      providesTags: ["Contact"],
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Contact"],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useCreateContactMutation,
  useGetAllContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApiSlice;
