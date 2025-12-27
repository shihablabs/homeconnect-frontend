
// Plan:
// 1. in ScheduleVisitModal.tsx:
//    - import { useQueryClient } from "@tanstack/react-query";
//    - import { useAuthState } from "@/hooks/useAuthState";
//    - const queryClient = useQueryClient();
//    - const { user } = useAuthState();
//    - In handleSubmit success:
//      await queryClient.invalidateQueries({ queryKey: ["myTours", user?.id] });
//      onClose();

// 2. in PropertySidebar.tsx:
//    - Update button style for "Visit Requested" state to be Green/Active looking instead of just disabled gray.
