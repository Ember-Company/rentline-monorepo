-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "cnae" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "dataAbertura" TIMESTAMP(3),
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "inscricaoMunicipal" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "porte" TEXT,
ADD COLUMN     "razaoSocial" TEXT;

-- CreateIndex
CREATE INDEX "organization_cnpj_idx" ON "organization"("cnpj");
