import {startDeleteIncompleteRegistration, startExpiredResetPasswordToken } from './scheduler.setup';

export const startScheduler = () => {
  console.log('Starting scheduler...');
  startDeleteIncompleteRegistration();
  startExpiredResetPasswordToken();
  console.log('Scheduler is Running');
};
