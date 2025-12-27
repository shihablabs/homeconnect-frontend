export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  url: string;
  file?: File;
  uploading?: boolean;
}

export interface BookingFormData {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  specialRequests: string;
  leaseDurationInMonths: string;
}
