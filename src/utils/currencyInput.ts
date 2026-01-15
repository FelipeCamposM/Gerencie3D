import React from "react";

/**
 * Utilitário para entrada de valores monetários
 * Permite digitar valores da esquerda para direita (como uma calculadora)
 */

/**
 * Formata centavos em formato de moeda brasileira
 * @param centavos - Valor em centavos
 * @returns String formatada como R$ 0,00
 */
export const formatarReais = (centavos: number): string => {
  const valor = centavos / 100;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/**
 * Props para o hook useCurrencyInput
 */
interface UseCurrencyInputProps {
  /** Callback chamado quando o valor muda */
  onChange: (valorEmReais: string) => void;
  /** Valor inicial em reais (opcional) */
  initialValue?: number;
}

/**
 * Hook para gerenciar entrada de valores monetários
 * @returns Objeto com funções e estado necessários para o input
 */
export const useCurrencyInput = ({
  onChange,
  initialValue = 0,
}: UseCurrencyInputProps) => {
  const [centavos, setCentavos] = React.useState(
    Math.round(initialValue * 100)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const apenasNumeros = input.replace(/\D/g, "");

    if (apenasNumeros === "") {
      setCentavos(0);
      onChange("0");
      return;
    }

    const novoCentavos = parseInt(apenasNumeros);
    setCentavos(novoCentavos);
    onChange((novoCentavos / 100).toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const novoCentavos = Math.floor(centavos / 10);
      setCentavos(novoCentavos);
      onChange((novoCentavos / 100).toString());
    } else if (e.key === "Delete") {
      e.preventDefault();
      setCentavos(0);
      onChange("0");
    } else if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const digito = parseInt(e.key);
      const novoCentavos = centavos * 10 + digito;
      setCentavos(novoCentavos);
      onChange((novoCentavos / 100).toString());
    }
  };

  const setValue = (valorEmReais: number) => {
    const novoCentavos = Math.round(valorEmReais * 100);
    setCentavos(novoCentavos);
  };

  return {
    centavos,
    valorFormatado: formatarReais(centavos),
    handleChange,
    handleKeyDown,
    setValue,
  };
};
