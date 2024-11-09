/*
  Warnings:

  - You are about to drop the column `hallID` on the `date` table. All the data in the column will be lost.
  - Added the required column `cinemaID` to the `date` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Time` to the `Hall` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Time` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `date` DROP FOREIGN KEY `date_hallID_fkey`;

-- AlterTable
ALTER TABLE `date` DROP COLUMN `hallID`,
    ADD COLUMN `cinemaID` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `hall` ADD COLUMN `Time` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessionticket` ADD COLUMN `Time` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `dateTime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Time` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dateTime_Time_key`(`Time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_Time_fkey` FOREIGN KEY (`Time`) REFERENCES `dateTime`(`Time`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hall` ADD CONSTRAINT `Hall_Time_fkey` FOREIGN KEY (`Time`) REFERENCES `dateTime`(`Time`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `date` ADD CONSTRAINT `date_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dateTime` ADD CONSTRAINT `dateTime_date_fkey` FOREIGN KEY (`date`) REFERENCES `date`(`date`) ON DELETE RESTRICT ON UPDATE CASCADE;
