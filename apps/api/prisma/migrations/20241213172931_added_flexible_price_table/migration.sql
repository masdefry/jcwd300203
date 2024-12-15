-- CreateTable
CREATE TABLE "FlexiblePrice" (
    "id" SERIAL NOT NULL,
    "roomTypeId" INTEGER NOT NULL,
    "customDate" TIMESTAMP(3) NOT NULL,
    "customPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlexiblePrice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlexiblePrice" ADD CONSTRAINT "FlexiblePrice_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "PropertyRoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
