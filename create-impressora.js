const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createImpressora() {
  try {
    const impressora = await prisma.impressora.create({
      data: {
        nome: "Sininho",
        modelo: "A1",
        marca: "Bambu",
        localizacao: "Casa Castilho",
        gastoEnergiaKwh: 1,
        precoEnergiaKwh: 0.89,
        status: "disponivel",
      },
    });

    console.log("✅ Impressora criada com sucesso!");
    console.log("🖨️ Nome:", impressora.nome);
    console.log("📦 Modelo:", impressora.modelo);
    console.log("🏷️ Marca:", impressora.marca);
    console.log("📍 Localização:", impressora.localizacao);
    console.log("⚡ Gasto de Energia:", impressora.gastoEnergiaKwh, "kWh");
    console.log("💰 Preço da Energia: R$", impressora.precoEnergiaKwh, "/kWh");
    console.log("📊 Status:", impressora.status);
    console.log("🆔 ID:", impressora.id);
  } catch (error) {
    console.error("❌ Erro ao criar impressora:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createImpressora();
