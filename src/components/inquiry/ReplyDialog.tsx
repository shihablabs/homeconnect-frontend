import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useReplyToInquiryMutation } from "@/redux/features/inquiry/inquiryApiSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryId: string;
  inquirerName: string;
}

export function ReplyDialog({
  isOpen,
  onClose,
  inquiryId,
  inquirerName,
}: ReplyDialogProps) {
  const [message, setMessage] = useState("");
  const [replyToInquiry, { isLoading, isSuccess }] = useReplyToInquiryMutation();

  const handleSubmit = async () => {
    if (!message.trim() || message === "<p></p>") {
      toast.error("Please enter a message");
      return;
    }

    try {
      await replyToInquiry({ id: inquiryId, message }).unwrap();
      toast.success("Reply sent successfully");
      setMessage("");
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to send reply");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to {inquirerName}</DialogTitle>
          <DialogDescription>
            Send a message to respond to this inquiry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RichTextEditor
            value={message}
            onChange={setMessage}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
