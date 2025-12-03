'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Globe, Mail, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function SiteSettingsClient() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'HomeConnect',
    siteDescription: 'Your trusted property rental platform',
    siteUrl: 'https://homeconnect.com',
    contactEmail: 'support@homeconnect.com',
    contactPhone: '+880-1234-567890',
    
    // Feature Toggles
    enableRegistration: true,
    enableEmailVerification: true,
    enableTwoFactorAuth: false,
    enableMaintenanceMode: false,
    
    // Payment Settings
    currency: 'BDT',
    paymentGateway: 'stripe',
    escrowEnabled: true,
    escrowDuration: 48, // hours
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    minPasswordLength: 8,
    requireStrongPassword: true,
    sessionTimeout: 30, // minutes
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Settings className="mr-2 h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic site information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={settings.enableEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableEmailVerification: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for enhanced security
                  </p>
                </div>
                <Switch
                  checked={settings.enableTwoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableTwoFactorAuth: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable site access for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.enableMaintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableMaintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment gateway and escrow settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentGateway">Payment Gateway</Label>
                  <Input
                    id="paymentGateway"
                    value={settings.paymentGateway}
                    onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Escrow Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Hold payments in escrow before releasing to landlords
                  </p>
                </div>
                <Switch
                  checked={settings.escrowEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, escrowEnabled: checked })
                  }
                />
              </div>
              {settings.escrowEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="escrowDuration">Escrow Duration (hours)</Label>
                  <Input
                    id="escrowDuration"
                    type="number"
                    value={settings.escrowDuration}
                    onChange={(e) =>
                      setSettings({ ...settings, escrowDuration: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                  <Input
                    id="minPasswordLength"
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) =>
                      setSettings({ ...settings, minPasswordLength: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Strong Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce complex password requirements
                  </p>
                </div>
                <Switch
                  checked={settings.requireStrongPassword}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireStrongPassword: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

