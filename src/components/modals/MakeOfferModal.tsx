import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInquiryMutation } from "@/redux/features/inquiry/inquiryApiSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MakeOfferModalProps {
  propertyId: string;
  propertyTitle: string;
  price: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MakeOfferModal({
  propertyId,
  propertyTitle,
  price,
  currency,
  isOpen,
  onClose,
}: MakeOfferModalProps) {
  const [offeredPrice, setOfferedPrice] = useState(price);
  const [message, setMessage] = useState("");
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (offeredPrice <= 0) {
      toast.error("Please enter a valid offer price");
      return;
    }

    if (!message.trim()) {
      toast.error("Please add a message for the seller");
      return;
    }

    try {
      await createInquiry({
        property: propertyId,
        offeredPrice,
        message,
      }).unwrap();

      toast.success("Offer sent successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to send offer:", error);
      toast.error(error?.data?.message || "Failed to send offer");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for <strong>{propertyTitle}</strong>. The seller will be notified immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="askingPrice" className="text-right">
              Asking Price
            </Label>
            <div className="col-span-3 font-semibold">
              {/* Assuming helper formatCurrency exists, otherwise simple display */}
              {currency} {price.toLocaleString()}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offerPrice" className="text-right">
              Your Offer
            </Label>
            <Input
              id="offerPrice"
              type="number"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'm interested in this property because..."
              className="col-span-3"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Offer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
