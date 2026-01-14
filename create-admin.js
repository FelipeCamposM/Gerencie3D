const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createUser() {
  try {
    const senhaHash = await bcrypt.hash("admin123", 10);

    const usuario = await prisma.usuario.create({
      data: {
        primeiroNome: "Felipe",
        ultimoNome: "Campos",
        email: "felipe@printmanager.com",
        senhaHash: senhaHash,
        role: "admin",
      },
    });

    console.log("✅ Usuário criado com sucesso!");
    console.log("📧 Email:", usuario.email);
    console.log("🔑 Senha: admin123");
    console.log("👤 Nome:", usuario.primeiroNome, usuario.ultimoNome);
    console.log("🎭 Role:", usuario.role);
    console.log("🆔 ID:", usuario.id);
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
