/*
  Warnings:

  - Added the required column `cinemaID` to the `Images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `Images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `images` ADD COLUMN `cinemaID` INTEGER NOT NULL,
    ADD COLUMN `movieId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
