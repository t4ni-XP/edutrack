/*
  Warnings:

  - You are about to drop the column `role` on the `WorkLog` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "StaffRole" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "WorkLog" DROP COLUMN "role";
