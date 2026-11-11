"""Close-ups (n >= desde): ISNet guarda o capacete mas perde o tronco.
GrabCut (meia resolução) semeado pelo ISNet (frente certa) + traje claro e
pouco saturado (frente provável) recupera o corpo; o verde saturado do glifo
nunca entra como frente. Atualiza PNGs e manifesto em `pasta`."""
import json
import subprocess
import sys

import cv2
import numpy as np
from rembg import new_session, remove

orig, pasta, desde, ate = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
W, H = 810, 1440
ses = new_session("isnet-general-use")
man = {m["n"]: m for m in json.load(open(f"{pasta}/manifesto.json"))}


def ler(n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{orig}/f_{n:04d}.webp", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy()


for n in range(desde, ate + 1):
    rgb = ler(n)
    base = man[n]["base"] if n in man else H
    iso = np.array(remove(rgb, session=ses, only_mask=True)).astype(np.float32) / 255.0
    iso[base:] = 0
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    v, s = hsv[..., 2].astype(np.int32), hsv[..., 1].astype(np.int32)

    # meia resolução para o GrabCut
    f = 0.5
    pequeno = cv2.resize(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    mk = np.full(pequeno.shape[:2], cv2.GC_PR_BGD, np.uint8)
    traje = cv2.resize(((v >= 110) & (s <= 55)).astype(np.uint8), (pequeno.shape[1], pequeno.shape[0]), interpolation=cv2.INTER_NEAREST)
    certo = cv2.resize((iso > 0.85).astype(np.uint8), (pequeno.shape[1], pequeno.shape[0]), interpolation=cv2.INTER_NEAREST)
    verde = cv2.resize(((s > 80) & (v > 90)).astype(np.uint8), (pequeno.shape[1], pequeno.shape[0]), interpolation=cv2.INTER_NEAREST)
    mk[traje == 1] = cv2.GC_PR_FGD
    mk[cv2.erode(certo, np.ones((3, 3), np.uint8)) == 1] = cv2.GC_FGD
    mk[(verde == 1) & (certo == 0)] = cv2.GC_BGD
    mk[int(base * f):] = cv2.GC_BGD
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(pequeno, mk, None, bg, fg, 5, cv2.GC_INIT_WITH_MASK)
    gc = ((mk == cv2.GC_FGD) | (mk == cv2.GC_PR_FGD)).astype(np.uint8)
    gc = cv2.resize(gc, (W, H), interpolation=cv2.INTER_LINEAR)

    # fica o componente que contém o capacete (máscara do ISNet)
    uniao = ((gc > 0) | (iso > 0.5)).astype(np.uint8)
    uniao = cv2.morphologyEx(uniao, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    q, r, e, _ = cv2.connectedComponentsWithStats(uniao, 8)
    ids = [i for i in range(1, q) if (iso[r == i] > 0.5).mean() > 0.2 or e[i, 4] > 20000 and (iso[r == i] > 0.5).any()]
    corpo = np.isin(r, ids).astype(np.uint8) if ids else uniao
    # fecha buracos pequenos dentro do corpo
    inv = (1 - corpo).astype(np.uint8)
    q3, r3, e3, _ = cv2.connectedComponentsWithStats(inv, 4)
    area = corpo.sum()
    fechar = [i for i in range(1, q3) if e3[i, 4] < area * 0.01 and not (e3[i, 0] == 0 or e3[i, 1] == 0 or e3[i, 0] + e3[i, 2] >= W or e3[i, 1] + e3[i, 3] >= H)]
    if fechar:
        corpo[np.isin(r3, fechar)] = 1

    nucleo = cv2.GaussianBlur(cv2.erode(corpo, np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 2.0)
    alfa = np.maximum(np.clip((iso * cv2.dilate(corpo, np.ones((9, 9), np.uint8)) - 0.12) / 0.5, 0, 1), nucleo)
    alt = int(np.ptp(np.where(corpo.any(1))[0])) if corpo.any() else 100
    if base < H and corpo[base - 1].any():
        rampa = max(8, int(alt * 0.07))
        for i in range(rampa):
            alfa[base - 1 - i] *= i / rampa
    alfa[base:] = 0

    ys, xs = np.where(alfa > 0.02)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    rgba = np.dstack([cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), (alfa * 255).astype(np.uint8)])[y0:y1, x0:x1]
    cv2.imwrite(f"{pasta}/a_{n:04d}.png", rgba)
    man[n] = {"n": n, "x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0, "base": int(base)}
    print(f"f{n:02d}: caixa {x0},{y0} {x1 - x0}x{y1 - y0}", flush=True)

json.dump([man[k] for k in sorted(man)], open(f"{pasta}/manifesto.json", "w"))
