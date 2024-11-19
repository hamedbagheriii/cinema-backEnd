/*
  Warnings:

  - You are about to drop the column `imgURL` on the `cinema` table. All the data in the column will be lost.
  - You are about to drop the column `imgURL` on the `movies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cinema` DROP COLUMN `imgURL`;

-- AlterTable
ALTER TABLE `movies` DROP COLUMN `imgURL`;

-- CreateTable
CREATE TABLE `Images` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `movieId` INTEGER NULL,
    `cinemaID` INTEGER NULL,

    UNIQUE INDEX `Images_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
