/*
  Warnings:

  - You are about to drop the `cinemamovie` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cinemaID` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cinemamovie` DROP FOREIGN KEY `cinemaMovie_cenimaID_fkey`;

-- DropForeignKey
ALTER TABLE `cinemamovie` DROP FOREIGN KEY `cinemaMovie_movieID_fkey`;

-- AlterTable
ALTER TABLE `movies` ADD COLUMN `cinemaID` INTEGER NOT NULL;

-- DropTable
DROP TABLE `cinemamovie`;

-- AddForeignKey
ALTER TABLE `Movies` ADD CONSTRAINT `Movies_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
