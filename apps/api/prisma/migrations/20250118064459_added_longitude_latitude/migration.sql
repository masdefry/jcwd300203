-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiryDate" SET DEFAULT (now() + interval '1 hour');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitude" TEXT;
