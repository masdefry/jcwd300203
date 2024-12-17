-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '1 hour'),
ADD COLUMN     "price" DECIMAL(65,30);
