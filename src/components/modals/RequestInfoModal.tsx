import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInquiryMutation } from "@/redux/features/inquiry/inquiryApiSlice";
import { Loader2, MailQuestion } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RequestInfoModalProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestInfoModal({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
}: RequestInfoModalProps) {
  const [message, setMessage] = useState("");
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter your question");
      return;
    }

    try {
      await createInquiry({
        property: propertyId,
        message,
        type: 'general',
      }).unwrap();

      toast.success("Inquiry sent successfully! The owner will reply soon.");
      setMessage(""); // Clear message on success
      onClose();
    } catch (error: any) {
      console.error("Failed to send inquiry:", error);
      toast.error(error?.data?.message || "Failed to send inquiry");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Information</DialogTitle>
          <DialogDescription>
            Ask a question about <strong>{propertyTitle}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 items-start">
              <MailQuestion className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Your inquiry will be sent directly to the property representative. They usually respond within 24 hours.
              </p>
            </div>

            <Label htmlFor="message" className="font-semibold">
              Your Question
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, is this property still available? I would like to know about..."
              className="resize-none min-h-[120px] bg-gray-50/50"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
