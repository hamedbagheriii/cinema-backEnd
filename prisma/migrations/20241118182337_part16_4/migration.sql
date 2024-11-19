/*
  Warnings:

  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `imgURL` to the `cinema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imgURL` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_movieId_fkey`;

-- AlterTable
ALTER TABLE `cinema` ADD COLUMN `imgURL` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `movies` ADD COLUMN `imgURL` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `images`;
