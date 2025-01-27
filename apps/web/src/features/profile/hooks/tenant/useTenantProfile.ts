import { useQueryTenantProfile } from './queries/queryTenantProfile';
import { useEditProfile } from './mutations/mutateEditProfile';
import { useChangePassword } from './mutations/mutateChangePassword';
import { useChangeEmail } from './mutations/mutateChangeEmail';
import { useUpdateIdCard } from './mutations/mutateUpdateIdCard';

export const useTenantProfile = () => {
  const { data: profile, isLoading } = useQueryTenantProfile();
  const editProfileMutation = useEditProfile();
  const changePasswordMutation = useChangePassword();
  const changeEmailMutation = useChangeEmail();
  const updateIdCardMutation = useUpdateIdCard();

  return {
    profile,
    isLoading,
    editProfile: editProfileMutation.mutate,
    isEditingProfile: editProfileMutation.isPending,
    editProfileError: editProfileMutation.error,
    
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
    
    changeEmail: changeEmailMutation.mutate,
    isChangingEmail: changeEmailMutation.isPending,
    changeEmailError: changeEmailMutation.error,
    
    updateIdCard: updateIdCardMutation.mutate,
    isUpdatingIdCard: updateIdCardMutation.isPending,
    updateIdCardError: updateIdCardMutation.error,
  };
};