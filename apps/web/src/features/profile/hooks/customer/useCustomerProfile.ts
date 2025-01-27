import { useQueryCustomerProfile } from './queries/queryCustomerProfile';
import { useEditProfile } from './mutations/mutateEditProfile';
import { useChangePassword } from './mutations/mutateChangePassword';
import { useChangeEmail } from './mutations/mutateChangeEmail';
import { useRequestVerification } from './mutations/mutateRequestVerification';

export const useCustomerProfile = () => {
  const { data: profile, isLoading } = useQueryCustomerProfile();
  const editProfileMutation = useEditProfile();
  const changePasswordMutation = useChangePassword();
  const changeEmailMutation = useChangeEmail();
  const requestVerificationMutation = useRequestVerification();

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
    
    requestVerification: requestVerificationMutation.mutate,
    isRequestingVerification: requestVerificationMutation.isPending,
    requestVerificationError: requestVerificationMutation.error,
  };
};