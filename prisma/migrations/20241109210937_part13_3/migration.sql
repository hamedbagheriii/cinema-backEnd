-- DropForeignKey
ALTER TABLE `movies` DROP FOREIGN KEY `Movies_cinemaID_fkey`;

-- AlterTable
ALTER TABLE `movies` MODIFY `cinemaID` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Movies` ADD CONSTRAINT `Movies_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
