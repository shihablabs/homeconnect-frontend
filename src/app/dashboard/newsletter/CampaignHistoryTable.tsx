"use client";

import { Badge } from "@/components/ui/badge";
import { useGetMailLogsQuery } from "@/redux/features/newsletter/newsletterApiSlice";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function CampaignHistoryTable() {
  const { data, isLoading } = useGetMailLogsQuery({});
  const logs = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No campaign history found.</div>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Recipients</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Sent Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any) => (
            <tr key={log._id} className="border-b transition-colors hover:bg-muted/50">
              <td className="p-4 align-middle font-medium">{log.subject}</td>
              <td className="p-4 align-middle">{log.recipientCount}</td>
              <td className="p-4 align-middle">
                <Badge variant={log.status === "sent" ? "default" : "secondary"} className={log.status === "sent" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                  {log.status}
                </Badge>
              </td>
              <td className="p-4 align-middle text-right">
                {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
