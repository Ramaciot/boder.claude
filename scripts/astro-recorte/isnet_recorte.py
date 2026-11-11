"""Recorte final do astronauta (quadros retrato V4, 1..N) com ISNet + caixa.

- ISNet (rembg, isnet-general-use) dá a máscara suave do objeto saliente.
- A caixa marcada à mão (quadros-chave interpolados) limita a busca: o glifo
  do meteoro e o feixe, também salientes, ficam fora. Nos close-ups
  (n > MANUAL_ATE) vale o quadro todo e fica só o corpo principal.
- Núcleo opaco dentro da silhueta (evita tronco semitransparente); a borda
  suave do ISNet fica do lado de fora.
- Faixa escura da base: corta e esmaece o corpo ali.
Saída: PNG RGBA recortado justo + manifesto (posição no quadro 810x1440).
"""
import json
import subprocess
import sys

import cv2
import numpy as np
from rembg import new_session, remove

orig, saida, ultimo = sys.argv[1], sys.argv[2], int(sys.argv[3])
W, H = 810, 1440
CHAVES = {1: (390, 925, 423, 1018), 6: (390, 925, 423, 1018), 11: (381, 853, 429, 968),
          16: (373, 728, 429, 872), 21: (349, 680, 445, 904), 26: (317, 632, 485, 984),
          28: (292, 620, 495, 1040), 30: (285, 600, 510, 1094), 32: (259, 510, 569, 1203),
          34: (248, 500, 525, 1212), 36: (204, 470, 590, 1218), 38: (179, 415, 565, 1222),
          40: (153, 398, 720, 1222), 42: (15, 390, 800, 1222), 44: (0, 340, 810, 1222)}
MANUAL_ATE = 44


def caixa_manual(n):
    ks = sorted(CHAVES)
    for a, b in zip(ks, ks[1:]):
        if a <= n <= b:
            t = (n - a) / (b - a)
            return tuple(int(round(CHAVES[a][i] + (CHAVES[b][i] - CHAVES[a][i]) * t)) for i in range(4))
    return CHAVES[ks[-1]]


def ler(n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{orig}/f_{n:04d}.webp", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy()


def faixa_inferior(rgb):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    y = H
    while y > H * 0.6 and g[y - 1].std() < 3.0 and g[y - 1].mean() < 40:
        y -= 1
    return y


ses = new_session("isnet-general-use")
manifesto = []
for n in range(1, ultimo + 1):
    rgb = ler(n)
    base = faixa_inferior(rgb)
    m = np.array(remove(rgb, session=ses, only_mask=True)).astype(np.float32) / 255.0

    regiao = np.zeros((H, W), np.float32)
    if n <= MANUAL_ATE:
        x0, y0, x1, y1 = caixa_manual(n)
        px, py = int((x1 - x0) * 0.14) + 4, int((y1 - y0) * 0.07) + 4
        regiao[max(0, y0 - py):min(H, y1 + py), max(0, x0 - px):min(W, x1 + px)] = 1
    else:
        regiao[:] = 1
    m *= regiao
    m[base:] = 0

    # só o corpo principal (e pedaços grandes colados a ele)
    b = (m > 0.4).astype(np.uint8)
    q, r, e, _ = cv2.connectedComponentsWithStats(b, 8)
    if q <= 1:
        print("sem astronauta no quadro", n)
        continue
    maior = 1 + int(np.argmax(e[1:, 4]))
    mx, my, mw, mh = e[maior, :4]
    ids = [maior] + [i for i in range(1, q) if i != maior and e[i, 4] > e[maior, 4] * 0.03
                     and e[i, 0] < mx + mw * 1.1 and e[i, 0] + e[i, 2] > mx - mw * 0.1
                     and e[i, 1] < my + mh * 1.1 and e[i, 1] + e[i, 3] > my - mh * 0.1]
    corpo = np.isin(r, ids).astype(np.uint8)
    perto = cv2.dilate(corpo, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    m *= perto

    # núcleo opaco + borda suave do ISNet
    alt = mh
    er = max(1, int(alt / 200))
    nucleo = cv2.erode(corpo, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * er + 1, 2 * er + 1))).astype(np.float32)
    nucleo = cv2.GaussianBlur(nucleo, (0, 0), max(0.6, er * 0.8))
    borda = np.clip((m - 0.12) / 0.5, 0, 1)
    alfa = np.maximum(borda, nucleo)

    if base < H and corpo[base - 1].any():
        rampa = max(8, int(alt * 0.07))
        for i in range(rampa):
            alfa[base - 1 - i] *= i / rampa
    alfa[base:] = 0

    ys, xs = np.where(alfa > 0.02)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    rgba = np.dstack([bgr, (alfa * 255).astype(np.uint8)])[y0:y1, x0:x1]
    cv2.imwrite(f"{saida}/a_{n:04d}.png", rgba)
    manifesto.append({"n": n, "x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0, "base": int(base)})
    print(f"f{n:02d}: caixa {x0},{y0} {x1 - x0}x{y1 - y0}", flush=True)

json.dump(manifesto, open(f"{saida}/manifesto.json", "w"))
