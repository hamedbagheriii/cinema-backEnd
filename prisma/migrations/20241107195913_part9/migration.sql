/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `row` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_rowID_fkey`;

-- DropIndex
DROP INDEX `row_rowID_key` ON `row`;

-- CreateIndex
CREATE UNIQUE INDEX `row_id_key` ON `row`(`id`);

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_rowID_fkey` FOREIGN KEY (`rowID`) REFERENCES `row`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
