/**
 * Véu que apaga o glifo do meteoro desenhado no filme (a única logo da
 * abertura é o reflexo na viseira, no close final).
 *
 * O glifo não fica parado: a posição foi medida quadro a quadro nos quadros
 * V4 (pixels verdes saturados, sem o feixe) e vira uma trilha de quadros-chave.
 * O véu segue essa trilha pelo mesmo progresso que move os quadros e some
 * antes do close da viseira.
 *
 * Coordenadas em frações do quadro: paisagem = área útil (sem as faixas
 * pretas), vale para desktop e mobile deitado (mesmo enquadramento);
 * retrato = quadro 9:16 inteiro.
 */

type Chave = readonly [quadro: number, x: number, y: number];

const TRILHA: Record<"paisagem" | "retrato", { chaves: readonly Chave[]; cheio: number; zero: number; raio: number }> = {
  paisagem: {
    chaves: [
      [1, 0.56, 0.275],
      [9, 0.554, 0.268],
      [17, 0.549, 0.27],
      [25, 0.558, 0.29],
      [33, 0.563, 0.307],
      [41, 0.559, 0.3],
    ],
    // O glifo some no quadro ~42; o close da viseira começa no ~43.
    cheio: 39,
    zero: 43,
    raio: 0.16, // × largura do palco
  },
  retrato: {
    chaves: [
      [1, 0.5, 0.205],
      [9, 0.498, 0.201],
      [17, 0.499, 0.237],
      [25, 0.492, 0.216],
      [33, 0.489, 0.159],
      [41, 0.493, 0.143],
      [49, 0.49, 0.091],
      [53, 0.49, 0.075],
    ],
    // Zera em 85% do progresso (quadro 51 de 60), antes do close da viseira.
    cheio: 47,
    zero: 51,
    // Um pouco maior e deslocado para cima/esquerda: cobre também o foguete
    // do glifo, que fica acima e à esquerda do "B".
    raio: 0.35,
  },
};

/** Posição (frações do quadro), intensidade (0–1) e raio do véu no quadro `q` (1–60, fracionário). */
export const veuNoQuadro = (formato: "paisagem" | "retrato", q: number) => {
  const t = TRILHA[formato];
  const c = t.chaves;
  let x = c[c.length - 1][1];
  let y = c[c.length - 1][2];
  if (q <= c[0][0]) [, x, y] = c[0];
  else
    for (let i = 1; i < c.length; i++)
      if (q <= c[i][0]) {
        const k = (q - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
        x = c[i - 1][1] + (c[i][1] - c[i - 1][1]) * k;
        y = c[i - 1][2] + (c[i][2] - c[i - 1][2]) * k;
        break;
      }
  const a = Math.min(1, Math.max(0, (t.zero - q) / (t.zero - t.cheio)));
  return { x, y, a, raio: t.raio };
};
