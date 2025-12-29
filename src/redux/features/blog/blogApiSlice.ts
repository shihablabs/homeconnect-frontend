
import { apiSlice } from "@/redux/api/apiSlice";

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBlogs: builder.query({
      query: (params) => ({
        url: "/blogs",
        method: "GET",
        params,
      }),
      providesTags: ["Blog"],
    }),
    getAdminBlogs: builder.query({
      query: (params) => ({
        url: "/blogs/admin/all",
        method: "GET",
        params,
      }),
      providesTags: ["Blog"],
    }),
    getBlogBySlug: builder.query({
      query: (slug) => ({
        url: `/blogs/${slug}`,
        method: "GET",
      }),
    }),
    getBlogById: builder.query({
      query: (id) => ({
        url: `/blogs/admin/${id}`,
        method: "GET",
      }),
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetPublicBlogsQuery,
  useGetAdminBlogsQuery,
  useGetBlogBySlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApiSlice;
