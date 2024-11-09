/*
  Warnings:

  - Added the required column `cinemaID` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hallID` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sessionticket` ADD COLUMN `cinemaID` INTEGER NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `hallID` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_hallID_fkey` FOREIGN KEY (`hallID`) REFERENCES `Hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_date_fkey` FOREIGN KEY (`date`) REFERENCES `date`(`date`) ON DELETE RESTRICT ON UPDATE CASCADE;
