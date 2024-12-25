import { queryCustomerProfile } from './queries/queryCustomerProfile';
import { mutateEditProfile } from './mutations/mutateEditProfile';
import { mutateChangePassword } from './mutations/mutateChangePassword';
import { mutateChangeEmail } from './mutations/mutateChangeEmail';
import { mutateRequestVerification } from './mutations/mutateRequestVerification';

export const useCustomerProfile = () => {
  const { data: profile, isLoading } = queryCustomerProfile();
  const editProfileMutation = mutateEditProfile();
  const changePasswordMutation = mutateChangePassword();
  const changeEmailMutation = mutateChangeEmail();
  const requestVerificationMutation = mutateRequestVerification();

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