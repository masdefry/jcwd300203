'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCustomerProfile } from '@/features/profile/hooks/customer/useCustomerProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/ChangePasswordForm';
import { EmailChangeForm } from '@/components/profile/ChangeEmailForm';
import { AvatarWithFallback } from '@/components/profile/AvatarWithFallback';
import authStore from '@/zustand/authStore';

export default function CustomerProfilePage() {
  const {
    profile,
    isLoading,
    editProfile,
    isEditingProfile,
    changePassword,
    isChangingPassword,
    changeEmail,
    isChangingEmail,
    requestVerification,
    isRequestingVerification,
  } = useCustomerProfile();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              <TabsTrigger value="verification" className="flex-1">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="mb-6 flex items-center space-x-4">
            <AvatarWithFallback src={`http://localhost:4700/images/${profile.profileImage}`} name={profile?.name} />
            <div>
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <p className="text-gray-600">@{profile?.username}</p>
            </div>
            </div>
              <ProfileForm
                initialValues={{
                  name: profile.name,
                  username: profile.username,
                }}
                onSubmit={editProfile}
                isSubmitting={isEditingProfile}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-4">
              <PasswordChangeForm
                onSubmit={changePassword}
                isSubmitting={isChangingPassword}
              />
              <EmailChangeForm
                currentEmail={profile.email}
                onSubmit={changeEmail}
                isSubmitting={isChangingEmail}
              />
            </TabsContent>

            <TabsContent value="verification" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.verified ? (
                    <Alert className="bg-green-50">
                      <AlertDescription className="text-green-700">
                        Your account is verified!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          Your account is not verified. Please verify your account to access all features.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => requestVerification()}
                        disabled={isRequestingVerification}
                      >
                        {isRequestingVerification && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Request Verification Email
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}