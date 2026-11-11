# Recorte do astronauta (abertura WebGL)

Gera `public/cine-gl/astro/` (52 recortes WebP com alfa + `astro.json`) a partir
dos quadros retrato V4 (`public/cine/assets/frames/mobile-retrato/`, 1–52).

Ambiente: Python 3 com `numpy`, `opencv-python-headless` e `rembg[cpu]`
(modelo `isnet-general-use`, baixado do GitHub na primeira execução).

```sh
python isnet_recorte.py <quadros-retrato> <saida> 52   # ISNet + caixa por quadro-chave
python closeups.py <quadros-retrato> <saida> 42 52     # recupera o tronco nos close-ups
python empacota.py <saida> public/cine-gl/astro 52 70 <tmp.png>
```

- A chave é pelo fundo (objeto saliente), nunca por verde: viseira e reflexos ficam.
- Coordenadas no `astro.json` são do quadro do filme (810×1440): a cena encaixa
  esse quadro 9:16 na tela, então o astronauta não treme entre quadros.
