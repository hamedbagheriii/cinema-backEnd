/*
  Warnings:

  - You are about to drop the column `Time` on the `hall` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `hall` DROP FOREIGN KEY `Hall_Time_fkey`;

-- AlterTable
ALTER TABLE `hall` DROP COLUMN `Time`;
