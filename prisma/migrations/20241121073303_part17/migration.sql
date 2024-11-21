/*
  Warnings:

  - You are about to drop the column `cinemaID` on the `movies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `movies` DROP FOREIGN KEY `Movies_cinemaID_fkey`;

-- AlterTable
ALTER TABLE `movies` DROP COLUMN `cinemaID`;

-- CreateTable
CREATE TABLE `MovieCinema` (
    `movieId` INTEGER NOT NULL,
    `cinemaID` INTEGER NOT NULL,

    PRIMARY KEY (`movieId`, `cinemaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MovieCinema` ADD CONSTRAINT `MovieCinema_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovieCinema` ADD CONSTRAINT `MovieCinema_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
