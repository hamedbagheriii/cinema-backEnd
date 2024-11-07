/*
  Warnings:

  - The primary key for the `row` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rowID` on the `row` table. All the data in the column will be lost.
  - You are about to drop the column `rowID` on the `sessionticket` table. All the data in the column will be lost.
  - Added the required column `row` to the `row` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticket` to the `row` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_rowID_fkey`;

-- AlterTable
ALTER TABLE `row` DROP PRIMARY KEY,
    DROP COLUMN `rowID`,
    ADD COLUMN `row` INTEGER NOT NULL,
    ADD COLUMN `ticket` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sessionticket` DROP COLUMN `rowID`;

-- AddForeignKey
ALTER TABLE `row` ADD CONSTRAINT `row_ticket_fkey` FOREIGN KEY (`ticket`) REFERENCES `sessionTicket`(`ticket`) ON DELETE RESTRICT ON UPDATE CASCADE;
