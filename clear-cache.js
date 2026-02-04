// Execute este código no console do navegador (F12) para limpar o cache
// Isso vai forçar um novo login com os dados corretos do servidor

console.log("Limpando localStorage...");
localStorage.removeItem("user");
localStorage.removeItem("token");
console.log("Cache limpo! Recarregue a página e faça login novamente.");
window.location.href = "/login";
