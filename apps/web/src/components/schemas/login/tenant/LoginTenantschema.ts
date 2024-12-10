import * as Yup from 'yup';

export const loginTenantSchema = Yup.object({
    email: Yup.string()
      .required('Required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Required'),
  })