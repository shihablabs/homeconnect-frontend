'use client';

import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuthState } from './useAuthState';

export const useAuthGuard = () => {
  const { isAuthenticated } = useAuthState();
  const router = useRouter();

  const checkAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You need to be logged in to perform this action.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login / Sign Up',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#64748b',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl border border-gray-100 shadow-2xl',
          title: 'text-xl font-bold text-gray-900',
          confirmButton: 'rounded-lg px-6 py-2.5 font-semibold transition-all hover:scale-105 active:scale-95',
          cancelButton: 'rounded-lg px-6 py-2.5 font-semibold transition-all hover:scale-105 active:scale-95',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const returnUrl = encodeURIComponent(window.location.pathname);
          router.push(`/login?from=${returnUrl}`);
        }
      });
    }
  };

  return { checkAuth, isAuthenticated };
};
