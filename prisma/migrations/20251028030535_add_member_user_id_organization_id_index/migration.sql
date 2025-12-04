-- CreateIndex
CREATE INDEX "member_userId_organizationId_idx" ON "public"."member"("userId", "organizationId");
