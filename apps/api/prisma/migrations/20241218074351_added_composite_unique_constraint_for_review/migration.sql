/*
  Warnings:

  - A unique constraint covering the columns `[customerId,propertyId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiryDate" SET DEFAULT (now() + interval '1 hour');

-- CreateIndex
CREATE UNIQUE INDEX "Review_customerId_propertyId_key" ON "Review"("customerId", "propertyId");
