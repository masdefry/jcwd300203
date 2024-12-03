-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'customer';

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'tenant';

-- AlterTable
ALTER TABLE "_PropFacilityToProperty" ADD CONSTRAINT "_PropFacilityToProperty_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PropFacilityToProperty_AB_unique";

-- AlterTable
ALTER TABLE "_RoomToRoomFacility" ADD CONSTRAINT "_RoomToRoomFacility_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoomToRoomFacility_AB_unique";
