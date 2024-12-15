/*
  Warnings:

  - You are about to drop the `PropertyRoomType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomToRoomFacility` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "FlexiblePrice" DROP CONSTRAINT "FlexiblePrice_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyRoomType" DROP CONSTRAINT "PropertyRoomType_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_propertyRoomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RoomImage" DROP CONSTRAINT "RoomImage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToRoomFacility" DROP CONSTRAINT "_RoomToRoomFacility_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToRoomFacility" DROP CONSTRAINT "_RoomToRoomFacility_B_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL;

-- DropTable
DROP TABLE "PropertyRoomType";

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "_RoomToRoomFacility";

-- CreateTable
CREATE TABLE "RoomType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "qty" INTEGER NOT NULL,
    "guestCapacity" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomFacilityToRoomType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoomFacilityToRoomType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoomFacilityToRoomType_B_index" ON "_RoomFacilityToRoomType"("B");

-- AddForeignKey
ALTER TABLE "RoomImage" ADD CONSTRAINT "RoomImage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlexiblePrice" ADD CONSTRAINT "FlexiblePrice_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomFacilityToRoomType" ADD CONSTRAINT "_RoomFacilityToRoomType_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomFacilityToRoomType" ADD CONSTRAINT "_RoomFacilityToRoomType_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
