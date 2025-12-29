'use client';

import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { MaintenanceRequestForm } from '@/components/maintenance/MaintenanceRequestForm';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function MaintenancePage() {
  const user = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('list');

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'tenant'
              ? 'Submit and track maintenance requests for your property'
              : 'Manage maintenance requests for your properties'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">My Requests</TabsTrigger>
            {user?.role === 'tenant' && (
              <TabsTrigger value="create">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {}
            <MaintenanceList userRole={user?.role as any} />
          </TabsContent>

          {user?.role === 'tenant' && (
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Maintenance Request</CardTitle>
                  <CardDescription>
                    Fill out the form below to submit a new maintenance request for your property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaintenanceRequestForm
                    onSuccess={() => setActiveTab('list')}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
