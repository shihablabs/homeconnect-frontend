import ServiceRequisitionClient from './ServiceRequisitionClient';

export const metadata = {
  title: 'Service Requisition | HomeConnect',
  description: 'Request property finding services',
};

export default function OrderHomePage() {
  return <ServiceRequisitionClient />;
}
