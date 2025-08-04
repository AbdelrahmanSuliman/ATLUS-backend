/*
  Warnings:

  - The values [HOMEWEAR] on the enum `Collection` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `collection` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Collection_new" AS ENUM ('SUMMER', 'WINTER', 'KIDS', 'COMFORT');
ALTER TABLE "Product" ALTER COLUMN "collection" TYPE "Collection_new" USING ("collection"::text::"Collection_new");
ALTER TYPE "Collection" RENAME TO "Collection_old";
ALTER TYPE "Collection_new" RENAME TO "Collection";
DROP TYPE "Collection_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "collection" SET NOT NULL;
