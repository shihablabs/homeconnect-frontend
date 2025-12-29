
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllContactsQuery, useUpdateContactStatusMutation } from "@/redux/features/contact/contactApiSlice";
import { format } from "date-fns";
import { CheckCircle, Clock, Loader2, Mail, MessageSquare, Phone, Search } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function ContactsDashboardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("-createdAt");
  const [page, setPage] = useState(1);

  
  

  const { data, isLoading, isFetching } = useGetAllContactsQuery({
    searchTerm: searchTerm, 
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: activeTab !== "all" ? (activeTab === "pending" ? "new" : "replied") : undefined,
    sort: sortOrder,
    page,
    limit: 10,
  });

  const [updateStatus] = useUpdateContactStatusMutation();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Contact marked as ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status'
      });
    }
  };

  const contacts = data?.data?.data || [];
  const meta = data?.meta;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="destructive">Pending</Badge>;
      case 'replied': return <Badge variant="default" className="bg-emerald-500">Solved</Badge>;
      case 'read': return <Badge variant="secondary">Read</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Inquiries</h1>
          <p className="text-muted-foreground">Manage and respond to direct messages.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="solved">Solved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or message..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="landlord">Landlord</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-white">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No inquiries found</h3>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact: any) => (
            <Card key={contact._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {contact.fullName}
                    {getStatusBadge(contact.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {contact.email}</span>
                    {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.phone}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(contact.createdAt), "MMM d, yyyy h:mm a")}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">{contact.type}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">{contact.message}</p>
                {contact.propertyId && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Reference Property: {contact.propertyId}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50/50 flex justify-between items-center py-3">
                <div className="text-xs text-muted-foreground">
                  Expected reply: Within 24 hours
                </div>
                <div className="flex gap-2">
                  {contact.status !== 'replied' && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleStatusUpdate(contact._id, 'replied')}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark Solved
                    </Button>
                  )}
                  {contact.status === 'replied' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      onClick={() => handleStatusUpdate(contact._id, 'new')}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Mark Pending
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {}
      {meta && meta.totalPage > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="flex items-center text-sm">Page {page} of {meta.totalPage}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPage, p + 1))} disabled={page === meta.totalPage}>Next</Button>
        </div>
      )}
    </div>
  );
}
