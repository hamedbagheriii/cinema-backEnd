/*
  Warnings:

  - The primary key for the `sessiontoken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `sessiontoken` table. All the data in the column will be lost.
  - You are about to drop the column `toekn` on the `sessiontoken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `sessionToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `sessionToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `sessionToken_toekn_key` ON `sessiontoken`;

-- AlterTable
ALTER TABLE `sessiontoken` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `toekn`,
    ADD COLUMN `token` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`token`);

-- CreateIndex
CREATE UNIQUE INDEX `sessionToken_token_key` ON `sessionToken`(`token`);
