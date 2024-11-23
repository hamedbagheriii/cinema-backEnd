/*
  Warnings:

  - You are about to drop the `datetime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `datetime` DROP FOREIGN KEY `dateTime_date_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_Time_fkey`;

-- DropTable
DROP TABLE `datetime`;
