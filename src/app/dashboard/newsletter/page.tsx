
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteSubscriberMutation,
  useGetAllSubscribersQuery,
  useSendBulkEmailMutation,
  useUpdateSubscriberStatusMutation
} from "@/redux/features/newsletter/newsletterApiSlice";
import { format } from "date-fns";
import { Loader2, Mail, Search, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Swal from "sweetalert2";
import CampaignHistoryTable from "./CampaignHistoryTable";

function NewsletterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  const activeTab = searchParams.get("tab") || "subscribers";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };


  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, refetch } = useGetAllSubscribersQuery({
    searchTerm,
    status: statusFilter,
    sort: "-createdAt",
  });
  const [deleteSubscriber] = useDeleteSubscriberMutation();
  const [updateStatus] = useUpdateSubscriberStatusMutation();


  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendEmail, { isLoading: isSending }] = useSendBulkEmailMutation();

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "unsubscribed" : "active";
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Status Updated",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSubscriber(id).unwrap();
          Swal.fire("Deleted!", "Subscriber has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete subscriber.", "error");
        }
      }
    });
  };

  const handleSend = async (isTest: boolean) => {
    if (!subject || !content) {
      Swal.fire("Error", "Please provide subject and content.", "warning");
      return;
    }
    if (isTest && !testEmail) {
      Swal.fire("Error", "Please provide a test email address.", "warning");
      return;
    }

    const payload = {
      subject,
      content,
      testEmail: isTest ? testEmail : undefined,
    };

    if (!isTest) {
      const confirm = await Swal.fire({
        title: "Send to ALL Subscribers?",
        text: "This will send emails to all active subscribers. Are you sure?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Send Bulk Email",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      const res = await sendEmail(payload).unwrap();
      Swal.fire("Success", res.message || "Email process started.", "success");
      if (!isTest) {

        setSubject("");
        setContent("");
      }
    } catch (err: any) {
      Swal.fire("Error", err?.data?.message || "Failed to send email.", "error");
    }
  };

  const subscribers = data?.data?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Newsletter Manager</h1>
        <p className="text-muted-foreground">Manage subscribers and send simplified newsletters.</p>
      </div>

      <Tabs defaultValue="subscribers" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
          <TabsTrigger value="compose">Compose & Send</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>Manage your email audience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No subscribers found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub: any) => (
                        <tr key={sub._id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{sub.email}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={sub.status === "active" ? "default" : "secondary"} className={sub.status === 'active' ? "bg-emerald-500" : ""}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {format(new Date(sub.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(sub._id, sub.status)}
                            >
                              {sub.status === "active" ? "Unsubscribe" : "Activate"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(sub._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>View past newsletter campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignHistoryTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
              <CardDescription>Send an email to all active subscribers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  placeholder="e.g. Weekly Real Estate Insights"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Content</Label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Draft your email..."
                  className="min-h-[400px]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t items-end">
                <div className="flex-1 space-y-2 w-full">
                  <Label>Test Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="admin@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button variant="outline" onClick={() => handleSend(true)} disabled={isSending}>
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Test"}
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <Button onClick={() => handleSend(false)} disabled={isSending} className="w-full" size="lg">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send to All Subscribers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewsletterContent />
    </Suspense>
  );
}
