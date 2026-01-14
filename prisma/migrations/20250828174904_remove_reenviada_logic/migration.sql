/*
  Warnings:

  - You are about to drop the column `reenviada` on the `solicitacoes` table. All the data in the column will be lost.
  - You are about to drop the column `reenviada_by` on the `solicitacoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "solicitacoes" DROP COLUMN "reenviada",
DROP COLUMN "reenviada_by";
