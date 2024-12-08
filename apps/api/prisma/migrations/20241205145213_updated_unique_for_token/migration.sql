/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordToken]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_resetPasswordToken_key" ON "Customer"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_resetPasswordToken_key" ON "Tenant"("resetPasswordToken");
