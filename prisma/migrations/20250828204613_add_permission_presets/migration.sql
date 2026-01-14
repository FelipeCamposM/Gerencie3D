-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "permission_preset_id" INTEGER;

-- CreateTable
CREATE TABLE "permission_presets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_preset_permissions" (
    "id" SERIAL NOT NULL,
    "preset_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_preset_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_presets_name_key" ON "permission_presets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_preset_permissions_preset_id_permission_id_key" ON "permission_preset_permissions"("preset_id", "permission_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_permission_preset_id_fkey" FOREIGN KEY ("permission_preset_id") REFERENCES "permission_presets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_preset_permissions" ADD CONSTRAINT "permission_preset_permissions_preset_id_fkey" FOREIGN KEY ("preset_id") REFERENCES "permission_presets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_preset_permissions" ADD CONSTRAINT "permission_preset_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
