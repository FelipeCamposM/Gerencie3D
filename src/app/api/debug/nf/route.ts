import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("=== DEBUG NF ENDPOINT ===");
    
    const { searchParams } = new URL(req.url);
    const numnota = searchParams.get('numnota');
    
    if (!numnota) {
      return NextResponse.json({
        error: "Parâmetro 'numnota' é obrigatório",
        example: "/api/debug/nf?numnota=1234"
      }, { status: 400 });
    }

    console.log(`Testando NF: ${numnota} (${numnota.length} dígitos)`);
    
    // Validações
    const validations = {
      isNumeric: /^\d+$/.test(numnota),
      hasCorrectLength: /^(\d{4}|\d{6})$/.test(numnota),
      length: numnota.length,
      value: numnota
    };
    
    console.log("Validações:", validations);
    
    const externalApiUrl = process.env.API_URL || "http://192.168.7.104:3001/api";
    
    // Testar ambos os endpoints
    const tests = await Promise.allSettled([
      // Teste 1: Endpoint de produtos
      fetch(`${externalApiUrl}/produtos/${numnota}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      }).then(async (res) => ({
        endpoint: 'produtos',
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        data: res.ok ? await res.json().catch(() => null) : await res.text().catch(() => 'Erro ao ler resposta')
      })),
      
      // Teste 2: Endpoint de informações
      fetch(`${externalApiUrl}/devolucoes/${numnota}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      }).then(async (res) => ({
        endpoint: 'devolucoes',
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        data: res.ok ? await res.json().catch(() => null) : await res.text().catch(() => 'Erro ao ler resposta')
      }))
    ]);

    const results = tests.map(test => 
      test.status === 'fulfilled' ? test.value : { 
        error: test.reason?.message || 'Erro desconhecido' 
      }
    );

    return NextResponse.json({
      nf: numnota,
      validations,
      externalApiUrl,
      tests: results,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        apiUrl: process.env.API_URL || 'Não configurada'
      }
    });

  } catch (error) {
    console.error("Erro no debug NF:", error);
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
