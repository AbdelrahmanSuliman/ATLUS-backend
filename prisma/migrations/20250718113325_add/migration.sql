-- CreateEnum
CREATE TYPE "Collection" AS ENUM ('SUMMER', 'WINTER', 'KIDS', 'HOMEWEAR', 'COMFORT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "collection" "Collection";
