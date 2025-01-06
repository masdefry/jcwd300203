-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiryDate" SET DEFAULT (now() + interval '1 hour');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RoomImage" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "deletedAt" TIMESTAMP(3);
