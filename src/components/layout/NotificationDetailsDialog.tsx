import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Notification } from "@/lib/api/notifications-api";
import { CheckCheck, Trash2 } from "lucide-react";

interface NotificationDetailsDialogProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationDetailsDialog({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
}: NotificationDetailsDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">
              {notification.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
          <DialogTitle className="text-xl">{notification.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </p>

          {/* Debug Data View if needed, or structured data display */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs font-mono text-gray-600">
              {/* Only show specific relevant data if needed, or hide raw data */}
              {notification.data.entityId && (
                <div>Reference ID: {notification.data.entityId}</div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between items-center sm:gap-2 gap-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(notification.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!notification.isRead && (
              <Button
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onClose();
                }}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
