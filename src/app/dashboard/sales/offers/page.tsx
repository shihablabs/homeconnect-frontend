"use client";

import { ReplyDialog } from "@/components/inquiry/ReplyDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyInquiriesQuery, usePayInquiryMutation, useUpdateInquiryStatusMutation } from "@/redux/features/inquiry/inquiryApiSlice";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import { Check, CreditCard, ExternalLink, Loader2, Mail, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function OffersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: inquiries, isLoading } = useGetMyInquiriesQuery();
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<{ id: string; inquirerName: string } | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateInquiryStatusMutation();
  const [payInquiry, { isLoading: isPaying }] = usePayInquiryMutation();

  const isLandlord = user?.role === 'landlord';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredInquiries = inquiries?.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  }) || [];

  const handleReply = (inquiry: any) => {
    setSelectedInquiry({
      id: inquiry.id,
      inquirerName: inquiry.buyer.name,
    });
    setIsReplyDialogOpen(true);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Offer ${status} successfully`);
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update status");
    }
  };

  const handlePayInquiry = async (inquiryId: string) => {
    try {
      const { sessionUrl } = await payInquiry({
        id: inquiryId,
        returnUrl: `${window.location.origin}/dashboard/sales/offers`
      }).unwrap();

      window.location.href = sessionUrl;
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="space-y-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Offers & Inquiries</h2>
          <p className="text-muted-foreground">
            Manage inquiries and offers received for your properties.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === 'responded' ? 'default' : 'outline'}
          onClick={() => setFilter('responded')}
          size="sm"
        >
          Responded
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-gray-900">No inquiries found</h3>
              <p>You haven't received any inquiries matching your filter yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>{isLandlord ? 'Inquirer' : 'Seller'}</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/properties/${inquiry.property.slug || inquiry.property._id}`}
                          className="hover:underline text-blue-600 flex items-center gap-1"
                        >
                          {inquiry.property.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLandlord ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={inquiry.buyer?.avatar} />
                            <AvatarFallback>{inquiry.buyer?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{inquiry.buyer?.name}</span>
                            <span className="text-xs text-muted-foreground">{inquiry.buyer?.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={inquiry.seller?.avatar} />
                            <AvatarFallback>{inquiry.seller?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{inquiry.seller?.name}</span>
                            <span className="text-xs text-muted-foreground">{inquiry.seller?.email}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate text-sm text-muted-foreground" title={inquiry.message}>
                        {inquiry.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {inquiry.offeredPrice ? 'Offer' : 'General Inquiry'}
                      </Badge>
                      {inquiry.offeredPrice && (
                        <div className="text-sm font-semibold mt-1">
                          {inquiry.offeredPrice.toLocaleString()} {inquiry.property.currency || 'BDT'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inquiry.status === 'pending' ? 'secondary' : 'default'}
                        className="capitalize"
                      >
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isLandlord && inquiry.offeredPrice && inquiry.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-emerald-600 hover:bg-emerald-700 h-8 font-semibold"
                              onClick={() => handleStatusUpdate(inquiry.id, 'accepted')}
                              disabled={isUpdating}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 font-semibold"
                              onClick={() => handleStatusUpdate(inquiry.id, 'rejected')}
                              disabled={isUpdating}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {/* Pay Now Button for Buyers */}
                        {!isLandlord && inquiry.status === 'accepted' && inquiry.type === 'offer' && (
                          <Button
                            size="sm"
                            className="h-8 font-semibold bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handlePayInquiry(inquiry.id)}
                            disabled={isPaying}
                          >
                            {isPaying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CreditCard className="h-4 w-4 mr-1" />}
                            Pay Now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReply(inquiry)}
                          className="h-8"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card >

      {selectedInquiry && (
        <ReplyDialog
          isOpen={isReplyDialogOpen}
          onClose={() => setIsReplyDialogOpen(false)}
          inquiryId={selectedInquiry.id}
          inquirerName={selectedInquiry.inquirerName}
        />
      )
      }
    </div >
  );
}
