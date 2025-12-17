'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OrdersManagementClient() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Order Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Order management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
