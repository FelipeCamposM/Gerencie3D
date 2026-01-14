-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "user_level" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "filial" TEXT NOT NULL,
    "numero_nf" TEXT NOT NULL,
    "carga" TEXT NOT NULL,
    "nome_cobranca" TEXT,
    "cod_cobranca" TEXT NOT NULL,
    "rca" INTEGER NOT NULL,
    "cgent" TEXT,
    "motivo_devolucao" TEXT NOT NULL,
    "motivo_recusa" TEXT,
    "tipo_devolucao" TEXT NOT NULL,
    "arquivo_nf" BYTEA,
    "arquivo_recibo" BYTEA,
    "arquivo_nf_devolucao" BYTEA,
    "cod_cliente" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "vale" TEXT,
    "pendente_at" TIMESTAMP(3),
    "aprovada_at" TIMESTAMP(3),
    "recusada_at" TIMESTAMP(3),
    "desdobrada_at" TIMESTAMP(3),
    "reenviada_at" TIMESTAMP(3),
    "abatida_at" TIMESTAMP(3),
    "finalizada_at" TIMESTAMP(3),
    "pendente_by" TEXT,
    "aprovada_by" TEXT,
    "recusada_by" TEXT,
    "desdobrada_by" TEXT,
    "reenviada_by" TEXT,
    "abatida_by" TEXT,
    "finalizada_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "numeronf" TEXT NOT NULL,
    "cod_prod" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "punit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returned_products" (
    "id" SERIAL NOT NULL,
    "numeronf" TEXT NOT NULL,
    "cod_prod" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "punit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "returned_products_pkey" PRIMARY KEY ("id")
);

