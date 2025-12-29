import { apiSlice } from '@/redux/api/apiSlice';

export interface CreateInquiryData {
  property: string; 
  offeredPrice?: number;
  message: string;
  type?: 'general' | 'offer';
}

export interface InquiryResponse {
  id: string;
  property: any; 
  buyer: any;    
  seller: any;   
  offeredPrice: number;
  message: string;
  status: 'pending' | 'responded' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
}

export const inquiryApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createInquiry: builder.mutation<InquiryResponse, CreateInquiryData>({
      query: (data) => ({
        url: '/inquiries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inquiry' as any],
    }),
    getMyInquiries: builder.query<InquiryResponse[], void>({
      query: () => '/inquiries/my-inquiries',
      providesTags: ['Inquiry' as any],
    }),
  }),
});

export const {
  useCreateInquiryMutation,
  useGetMyInquiriesQuery,
} = inquiryApiSlice;
