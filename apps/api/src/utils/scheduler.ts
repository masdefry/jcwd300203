import {startDeleteIncompleteRegistration, startExpiredResetPasswordToken } from './scheduler.setup';

export const startScheduler = () => {
  console.log('  ➜ [ ϟϟ Scheduler ϟϟ ] : Starting . . .');
  startDeleteIncompleteRegistration();
  startExpiredResetPasswordToken();
  console.log('  ➜ [ ϟϟ Scheduler ϟϟ ] : Currently Running ');
};
