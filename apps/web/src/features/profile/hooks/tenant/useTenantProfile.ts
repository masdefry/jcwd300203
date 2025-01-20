import { queryTenantProfile } from './queries/queryTenantProfile';
import { mutateEditProfile } from './mutations/mutateEditProfile';
import { mutateChangePassword } from './mutations/mutateChangePassword';
import { mutateChangeEmail } from './mutations/mutateChangeEmail';
import { mutateUpdateIdCard } from './mutations/mutateUpdateIdCard';

export const useTenantProfile = () => {
  const { data: profile, isLoading } = queryTenantProfile();
  const editProfileMutation = mutateEditProfile();
  const changePasswordMutation = mutateChangePassword();
  const changeEmailMutation = mutateChangeEmail();
  const updateIdCardMutation = mutateUpdateIdCard();

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