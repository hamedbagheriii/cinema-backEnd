-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_movieId_fkey`;

-- AlterTable
ALTER TABLE `images` MODIFY `cinemaID` INTEGER NULL,
    MODIFY `movieId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
