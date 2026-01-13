import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProfileProgressProps {
  user: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    avatar?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  } | null;
}

export const ProfileProgress = ({ user }: ProfileProgressProps) => {
  if (!user) return null;

  const steps = [
    {
      label: 'Verify Email',
      isValid: user.isEmailVerified,
      weight: 25,
      actionUrl: '/dashboard/settings',
      actionLabel: 'Verify',
    },
    {
      label: 'Verify Phone',
      isValid: user.isPhoneVerified,
      weight: 25,
      actionUrl: '/dashboard/settings',
      actionLabel: 'Verify',
    },
    {
      label: 'Upload Profile Picture',
      isValid: !!user.avatar,
      weight: 25,
      actionUrl: '/dashboard/profile',
      actionLabel: 'Upload',
    },
    {
      label: 'Verify Identity',
      isValid: user.verificationStatus === 'verified',
      weight: 25,
      actionUrl: '/dashboard/settings/verification',
      actionLabel: 'Submit ID',
    },
  ];

  const progress = steps.reduce((acc, step) => (step.isValid ? acc + step.weight : acc), 0);
  const isComplete = progress >= 70;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-600">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to unlock all features (Posting Properties requires 70%+)
            </CardDescription>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
              {progress}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg border ${step.isValid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex items-center gap-2">
                {step.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${step.isValid ? 'text-green-700' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
              {!step.isValid && (
                <Link href={step.actionUrl}>
                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                    {step.actionLabel}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {!user.isEmailVerified && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>
              <strong>Action Required:</strong> Your email is not verified. You may miss important notifications.
            </span>
            <Link href="/dashboard/settings" className="ml-auto">
              <span className="font-semibold underline cursor-pointer">Verify Now</span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
