-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiryDate" SET DEFAULT (now() + interval '1 hour');

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "description" SET DEFAULT 'No description provided';
