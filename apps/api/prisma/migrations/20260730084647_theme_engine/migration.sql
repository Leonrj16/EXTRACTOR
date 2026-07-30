-- AlterTable
ALTER TABLE "appearances" ADD COLUMN     "themeOverrides" JSONB;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "favoriteThemeKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "themes" ADD COLUMN     "profileId" TEXT;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
