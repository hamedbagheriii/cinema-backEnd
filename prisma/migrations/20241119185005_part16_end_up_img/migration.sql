/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Images_id_key` ON `images`;

-- CreateIndex
CREATE UNIQUE INDEX `Images_name_key` ON `Images`(`name`);
