"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth-api";
import { confirmDelete } from "@/lib/swal";
import { logout } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const result = await confirmDelete(
      "Are you absolutely sure?",
      "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
    );

    if (result) {
      setIsDeleting(true);
      const toastId = toast.loading("Deleting account...");
      try {
        await authApi.deleteAccount();
        toast.success("Account deleted successfully. Redirecting...", {
          id: toastId,
        });

        setTimeout(() => {
          dispatch(logout());
          router.push("/");
        }, 1500);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete account", {
          id: toastId,
        });
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          These actions are irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <p className="font-medium">Delete Your Account</p>
            <p className="text-sm text-gray-600">
              Your account and all data will be permanently deleted.
            </p>
          </div>

          <Button
            variant="destructive"
            disabled={isDeleting}
            className="w-full sm:w-auto"
            onClick={handleDeleteAccount}
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
