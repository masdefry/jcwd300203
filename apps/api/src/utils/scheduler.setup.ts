import cron from 'node-cron';
import { prisma } from '@/connection';
import { addHours } from 'date-fns';

let deleteIncompleteRegistrationStarted = false
let expiredResetPasswordTokenStarted = false

export const startDeleteIncompleteRegistration = () => {
  if(deleteIncompleteRegistrationStarted){
    console.log('Scheduler for Handling Incomplete registration is already started');
    return
  }  
  cron.schedule('*/5 * * * *', async () => {
    try {
      const currentTime = new Date();

      const incompleteRegistrations = await prisma.$transaction([
        prisma.customer.findMany({
          where: {
            resetPasswordToken: { not: null },
            tokenExpiry: { lt: addHours(currentTime, -1) },
            OR: [{ name: '' }, { username: '' }, { password: '' }],
          },
        }),

        prisma.tenant.findMany({
          where: {
            resetPasswordToken: { not: null },
            tokenExpiry: { lt: addHours(currentTime, -1) },
            OR: [
              { name: '' },
              { username: '' },
              { password: '' },
              { IdCardImage: '' },
              { profileImage: '' },
            ],
          },
        }),
      ]);

      const [incompleteCustomers, incompleteTenants] = incompleteRegistrations;

      if (incompleteCustomers.length > 0) {
        for (const customer of incompleteCustomers) {
          await prisma.customer.delete({
            where: {
              email: customer.email,
              id: customer.id,
            },
          });
          console.log(
            `Deleted incomplete registration for customer: ${customer.email}`,
          );
        }
      }

      if (incompleteTenants.length > 0) {
        for (const tenant of incompleteTenants) {
          await prisma.tenant.delete({
            where: {
              email: tenant.email,
              id: tenant.id,
            },
          });
          console.log(
            `Deleted incomplete registration for tenant: ${tenant.email}`,
          );
        }
      }
    } catch (error) {
      console.error('error in startDeleteIncompleteRegistration:', error);
    }
  });

  deleteIncompleteRegistrationStarted = true;

};

export const startExpiredResetPasswordToken = () => {
  if(expiredResetPasswordTokenStarted){
    console.log('Scheduler for Handling expired reset password token is already started');
    return
  }  
  cron.schedule('*/5 * * * *', async () => {
    try {
      const currentTime = new Date();

      const expiredCustomerTokens = await prisma.customer.updateMany({
        where: {
          resetPasswordToken: { not: null },
          name: {not: ''},
          tokenExpiry: { lt: currentTime },
          username: {not: ''},
          password: {not: ''}
        },
        data: {
          resetPasswordToken: null,
          tokenExpiry: null,
        },
      });

      const expiredTenantTokens = await prisma.tenant.updateMany({
        where: {
            resetPasswordToken: { not: null },
            name: {not: ''},
            tokenExpiry: { lt: currentTime },
            username: {not: ''},
            password: {not: ''}
        },
        data: {
          resetPasswordToken: null,
          tokenExpiry: null,
        },
      });

      // Log the result
      if (expiredCustomerTokens.count > 0) {
        console.log(
          `Expired reset password tokens cleared for ${expiredCustomerTokens.count} customers.`);
      }
      if (expiredTenantTokens.count > 0) {
        console.log(`Expired reset password tokens cleared for ${expiredTenantTokens.count} tenants.`);
      }
    } catch (error) {
      console.error('error in startExpiredResetPasswordToken:', error);
    }
  });

  expiredResetPasswordTokenStarted = true;
};
