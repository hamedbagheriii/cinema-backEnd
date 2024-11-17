/*
  Warnings:

  - You are about to alter the column `price` on the `movies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `price` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `movies` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sessionticket` ADD COLUMN `price` INTEGER NOT NULL;
