
import Swal from 'sweetalert2';

export const confirmDelete = async (
  title: string = 'Are you sure?',
  text: string = "You won't be able to revert this!",
  confirmButtonText: string = 'Yes, delete it!'
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // destructive red
    cancelButtonColor: '#6b7280', // gray
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    customClass: {
      confirmButton: 'rounded-lg px-4 py-2 font-semibold',
      cancelButton: 'rounded-lg px-4 py-2 font-semibold'
    }
  });

  return result.isConfirmed;
};

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#3b82f6', // primary blue
  });
};

export const showLoading = (title: string = 'Please wait...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeSwal = () => {
  Swal.close();
};
