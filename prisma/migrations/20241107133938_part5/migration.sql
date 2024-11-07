/*
  Warnings:

  - You are about to drop the column `selectedSeats` on the `sessionticket` table. All the data in the column will be lost.
  - Added the required column `rowID` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sessionticket` DROP COLUMN `selectedSeats`,
    ADD COLUMN `rowID` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `row` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rowID` INTEGER NOT NULL,
    `selectedSeats` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `row_rowID_key`(`rowID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_rowID_fkey` FOREIGN KEY (`rowID`) REFERENCES `row`(`rowID`) ON DELETE RESTRICT ON UPDATE CASCADE;
