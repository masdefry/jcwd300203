-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "tokenExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
