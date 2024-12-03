/*
  Warnings:

  - The primary key for the `_PropFacilityToProperty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_RoomToRoomFacility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_PropFacilityToProperty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_RoomToRoomFacility` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PropFacility" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "RoomFacility" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "_PropFacilityToProperty" DROP CONSTRAINT "_PropFacilityToProperty_AB_pkey";

-- AlterTable
ALTER TABLE "_RoomToRoomFacility" DROP CONSTRAINT "_RoomToRoomFacility_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_PropFacilityToProperty_AB_unique" ON "_PropFacilityToProperty"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomToRoomFacility_AB_unique" ON "_RoomToRoomFacility"("A", "B");
