import { ProtectedRoute } from '@/components/protected-route';

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <p>Order management module is under construction.</p>
      </div>
    </ProtectedRoute>
  );
}

