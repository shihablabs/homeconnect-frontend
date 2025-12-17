import { apiSlice } from "../../api/apiSlice";

export const contentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContent: builder.query({
      query: (slug) => `/content/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Content", id: slug }],
    }),
    updateContent: builder.mutation({
      query: ({ slug, ...data }) => ({
        url: `/content/${slug}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: "Content", id: slug }],
    }),
  }),
});

export const { useGetContentQuery, useUpdateContentMutation } = contentApi;
