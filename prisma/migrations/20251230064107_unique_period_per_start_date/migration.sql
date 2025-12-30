/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `CycleInsight` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DailyFlow` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DailyFlow` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Period` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Period` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,startDate]` on the table `Period` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CycleInsight" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "DailyFlow" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Period" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "Period_userId_startDate_key" ON "Period"("userId", "startDate");
