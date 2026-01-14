# 3D PrintManager

Sistema de Gerenciamento de Impressoras 3D desenvolvido com Next.js, TypeScript e Prisma.

## 📋 Sobre o Projeto

O 3D PrintManager é uma solução completa para gerenciar impressoras 3D, controlar estoque de filamentos, registrar impressões e calcular custos operacionais. O sistema permite:

- **Gerenciamento de Impressoras**: Controle de impressoras 3D com informações sobre status, localização, consumo de energia e histórico de uso
- **Controle de Filamentos**: Gestão de estoque de filamentos (PLA, ABS, PETG, TPU, etc.) com rastreamento de peso, custo e uso
- **Registro de Impressões**: Histórico completo de impressões 3D com cálculo automático de custos (energia + filamento)
- **Cálculo de Lucro**: Registro de preço de venda e cálculo automático de lucro por impressão
- **Gerenciamento de Usuários**: Controle de acesso e rastreamento de atividades por usuário

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e configurado
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/printmanager"
```

4. Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

5. Gere o Prisma Client:

```bash
npx prisma generate
```

### Executando o Projeto

Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Usuários do sistema
- **impressoras**: Cadastro de impressoras 3D com dados de consumo e status
- **filamentos**: Estoque de filamentos com controle de peso e custo
- **impressoes_3d**: Registro de impressões realizadas
- **impressao_filamento**: Relação entre impressões e filamentos utilizados

## 🛠️ Tecnologias Utilizadas

- **[Next.js 15](https://nextjs.org)**: Framework React para produção
- **[TypeScript](https://www.typescriptlang.org)**: Tipagem estática
- **[Prisma](https://www.prisma.io)**: ORM para PostgreSQL
- **[Tailwind CSS](https://tailwindcss.com)**: Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com)**: Componentes acessíveis
- **[React Hook Form](https://react-hook-form.com)**: Gerenciamento de formulários
- **[Zod](https://zod.dev)**: Validação de schemas

## 📚 Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs)

## 🚀 Deploy

A forma mais fácil de fazer deploy da aplicação é usar a [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consulte a [documentação de deployment do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

## 📄 Licença

Este projeto é privado e proprietário.
