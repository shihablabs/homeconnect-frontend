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
import { propertiesApi } from "@/lib/api/properties-api";
import { TourRequest, toursApi } from "@/lib/api/tours-api";
import { format } from "date-fns";
import { Calendar, Clock, Edit2, Info, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuthState } from "@/hooks/useAuthState";
import { useQueryClient } from "@tanstack/react-query";

interface ScheduleVisitModalProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleVisitModal({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
}: ScheduleVisitModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  
  const [existingTour, setExistingTour] = useState<TourRequest | null>(null);
  const [checkingTour, setCheckingTour] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  
  useEffect(() => {
    if (isOpen && propertyId) {
      checkExistingTour();
    } else {
      
      setExistingTour(null);
      setIsEditing(false);
      setDate("");
      setTime("");
      setNotes("");
    }
  }, [isOpen, propertyId]);

  const checkExistingTour = async () => {
    try {
      setCheckingTour(true);
      const myTours = await toursApi.getMyTours();
      
      const tour = myTours.find(t =>
        t.property.id === propertyId &&
        (t.status === 'pending' || t.status === 'approved')
      );

      if (tour) {
        setExistingTour(tour);
        
        const tourDate = new Date(tour.preferredDate);
        setDate(tourDate.toISOString().split('T')[0]);
        setTime(tourDate.toTimeString().split(' ')[0].substring(0, 5));
        setNotes(tour.notes || "");
      }
    } catch (error) {
      console.error("Failed to check existing tours:", error);
    } finally {
      setCheckingTour(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const preferredDate = new Date(`${date}T${time}`);
    if (preferredDate < new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && existingTour) {
        
        await toursApi.updateTour(existingTour.id, {
          preferredDate: preferredDate.toISOString(),
          notes
        });
        toast.success("Visit request updated successfully!");
        setIsEditing(false);
        checkExistingTour(); 
        await queryClient.invalidateQueries({ queryKey: ["myTours", user?.id] });
      } else {
        
        await propertiesApi.scheduleTour(propertyId, preferredDate.toISOString(), notes);
        await queryClient.invalidateQueries({ queryKey: ["myTours", user?.id] });
        toast.success("Visit scheduled successfully! The landlord will confirm shortly.");
        onClose();
      }
    } catch (error: any) {
      console.error("Failed to submit visit request:", error);
      toast.error(error?.response?.data?.message || "Failed to schedule visit");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTour = async () => {
    if (!existingTour) return;
    if (!confirm("Are you sure you want to cancel this visit request?")) return;

    try {
      setLoading(true);
      await toursApi.cancelTour(existingTour.id);
      await queryClient.invalidateQueries({ queryKey: ["myTours", user?.id] });
      toast.success("Visit request cancelled successfully.");
      onClose();
    } catch (error: any) {
      console.error("Failed to cancel visit:", error);
      toast.error("Failed to cancel visit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Scheduled Visit" : existingTour ? "Scheduled Visit Details" : "Schedule a Visit"}
          </DialogTitle>
          <DialogDescription>
            {existingTour && !isEditing
              ? `You have a visit scheduled for ${propertyTitle}.`
              : `Choose a preferred date and time to visit ${propertyTitle}.`
            }
          </DialogDescription>
        </DialogHeader>

        {checkingTour ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : existingTour && !isEditing ? (
          <div className="py-2 space-y-4">
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(existingTour.preferredDate), "EEEE, MMM dd, yyyy")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Time</p>
                  <p className="font-semibold text-gray-900">{format(new Date(existingTour.preferredDate), "hh:mm a")}</p>
                </div>
              </div>

              {existingTour.notes && (
                <div className="pt-4 mt-2 border-t border-primary/10">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Notes</p>
                  <div className="bg-white p-3 rounded-lg text-sm text-gray-600 italic border border-primary/5 shadow-sm">
                    "{existingTour.notes}"
                  </div>
                </div>
              )}

              <div className="pt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${existingTour.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  existingTour.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${existingTour.status === 'approved' ? 'bg-green-500' :
                    existingTour.status === 'rejected' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`} />
                  {existingTour.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
                disabled={existingTour.status !== 'pending'}
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-100 shadow-none border"
                onClick={handleCancelTour}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
            {existingTour.status !== 'pending' && (
              <p className="text-xs text-center text-gray-400">
                Only pending requests can be edited or cancelled.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="bg-gray-50/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or questions for the owner?"
                className="resize-none bg-gray-50/50 min-h-[100px]"
              />
            </div>

            {}
            {!isEditing && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Just a reminder:</strong> Scheduling a visit does not book the house. Someone else might rent it before you see it. So, don't be late!
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              {isEditing ? (
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel Edit
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Close
                </Button>
              )}

              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Scheduling..."}
                  </>
                ) : (
                  isEditing ? "Update Visit" : "Confirm Schedule"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
