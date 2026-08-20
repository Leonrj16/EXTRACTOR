-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LinkType" ADD VALUE 'TEXT';
ALTER TYPE "LinkType" ADD VALUE 'IMAGE';
ALTER TYPE "LinkType" ADD VALUE 'CALENDAR';
ALTER TYPE "LinkType" ADD VALUE 'CUSTOM_HTML';
ALTER TYPE "LinkType" ADD VALUE 'COUNTER';
ALTER TYPE "LinkType" ADD VALUE 'DIVIDER';
