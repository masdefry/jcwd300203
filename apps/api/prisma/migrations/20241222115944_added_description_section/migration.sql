/*
  Warnings:

  - Added the required column `description` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `RoomType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiryDate" SET DEFAULT (now() + interval '1 hour');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "description" TEXT NOT NULL;
