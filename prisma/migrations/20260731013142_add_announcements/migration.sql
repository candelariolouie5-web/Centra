-- CreateTable
CREATE TABLE "ClinicalTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anatomy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicalTemplate_userId_anatomy_idx" ON "ClinicalTemplate"("userId", "anatomy");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalTemplate_userId_anatomy_name_key" ON "ClinicalTemplate"("userId", "anatomy", "name");

-- AddForeignKey
ALTER TABLE "ClinicalTemplate" ADD CONSTRAINT "ClinicalTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
