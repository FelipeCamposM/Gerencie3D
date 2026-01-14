import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para upload de arquivos
  experimental: {
    // Optimize package imports to shrink client bundles
    optimizePackageImports: ["lucide-react", "react-icons"],
  },

  // Configuração correta para Next.js 15
  serverExternalPackages: ["@prisma/client"],

  // Configurações de tamanho de request
  serverRuntimeConfig: {
    // Configurações do servidor
    maxFileSize: '10mb',
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Evita incluir esses módulos no bundle do servidor
      config.externals = config.externals || [];
      config.externals.push(
        "@azure/keyvault-secrets",
        "@azure/app-configuration",
        "@azure/identity",
        "oci-common",
        "oci-objectstorage",
        "oci-secrets"
      );

      // Configurações específicas para Oracle em produção
      if (process.env.NODE_ENV === "production") {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          os: false,
        };
      }
    }
    return config;
  },

  // Headers para CORS se necessário
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
