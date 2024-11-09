/*
  Warnings:

  - You are about to drop the column `movieID` on the `cinema` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cinema` DROP FOREIGN KEY `cinema_movieID_fkey`;

-- AlterTable
ALTER TABLE `cinema` DROP COLUMN `movieID`;

-- CreateTable
CREATE TABLE `cinemaMovie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cenimaID` INTEGER NOT NULL,
    `movieID` INTEGER NOT NULL,

    UNIQUE INDEX `cinemaMovie_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cinemaMovie` ADD CONSTRAINT `cinemaMovie_cenimaID_fkey` FOREIGN KEY (`cenimaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cinemaMovie` ADD CONSTRAINT `cinemaMovie_movieID_fkey` FOREIGN KEY (`movieID`) REFERENCES `Movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
