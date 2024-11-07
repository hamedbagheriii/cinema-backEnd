/*
  Warnings:

  - You are about to drop the column `userId` on the `sessionticket` table. All the data in the column will be lost.
  - Added the required column `email` to the `sessionTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_userId_fkey`;

-- AlterTable
ALTER TABLE `movies` MODIFY `reservedSeats` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessionticket` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
