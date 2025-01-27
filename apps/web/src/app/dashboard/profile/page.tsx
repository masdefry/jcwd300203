'use client';
import { useTenantProfile } from '@/features/profile/hooks/tenant/useTenantProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/ChangePasswordForm';
import { EmailChangeForm } from '@/components/profile/ChangeEmailForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FileUploadButton } from '@/components/profile/SharedComponents';
import { useState } from 'react';
import { AvatarWithFallback } from '@/components/profile/AvatarWithFallback';
import authStore from '@/zustand/authStore';
import Image from 'next/image';

export default function TenantProfilePage() {
  const {
    profile,
    isLoading,
    editProfile,
    isEditingProfile,
    changePassword,
    isChangingPassword,
    changeEmail,
    isChangingEmail,
    updateIdCard,
    isUpdatingIdCard,
  } = useTenantProfile();
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const profilePicture = authStore((state) => state.profileImage)
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
          <CardTitle>Tenant Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              <TabsTrigger value="id-card" className="flex-1">ID Card</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="mb-6 flex items-center space-x-4">
                <AvatarWithFallback src={`http://localhost:4700/images/${profile.profileImage}`||`http://localhost:4700/images/${profilePicture}`} name={profile?.name} />
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

            <TabsContent value="id-card" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>ID Card</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.idCardImage && (
                    <div className="mb-4">
                      <Image
                        src={`http://localhost:4700/images/${profile.idCardImage}`}
                        alt="ID Card"
                        width={400} 
                        height={300}
                        className="max-w-md rounded-lg shadow-md"
                        layout="intrinsic"
                      />
                    </div>
                  )}
                  <FileUploadButton
                    onFileSelect={(file) => updateIdCard({ idCardImage: file })}
                    accept="image/*"
                    label="Upload New ID Card"
                    disabled={!isEditing || isEditingProfile} 
                  />
                  {isUpdatingIdCard && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
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