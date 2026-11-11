"""Gera public/cine-gl/astro/: WebP com alfa + astro.json (coordenadas do filme 810x1440).
Quadros cujo recorte encosta na lateral do filme ganham um esmaecimento ali
(o quadro 9:16 fica mais estreito que a tela no desktop: sem corte reto)."""
import json, subprocess, sys
import cv2, numpy as np
orig, destino, ultimo, qualidade = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
man = {m["n"]: m for m in json.load(open(f"{orig}/manifesto.json"))}
LADO = 90
quadros = []
for n in range(1, ultimo + 1):
    m = man[n]
    a = cv2.imread(f"{orig}/a_{n:04d}.png", cv2.IMREAD_UNCHANGED)
    al = a[..., 3].astype(np.float32)
    if m["x"] == 0:
        for i in range(min(LADO, al.shape[1])): al[:, i] *= (i / LADO) ** 1.5
    if m["x"] + m["w"] >= 810:
        for i in range(min(LADO, al.shape[1])): al[:, -1 - i] *= (i / LADO) ** 1.5
    a[..., 3] = al.astype(np.uint8)
    # close-ups grandes: 80% (o manifesto segue em coordenadas do filme; a GPU estica)
    if a.shape[0] * a.shape[1] > 200_000:
        a = cv2.resize(a, None, fx=0.8, fy=0.8, interpolation=cv2.INTER_AREA)
    tmp = sys.argv[5]
    cv2.imwrite(tmp, a)
    arq = f"a_{n:04d}.webp"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "libwebp", "-pix_fmt", "yuva420p",
                    "-quality", qualidade if a.shape[0] * a.shape[1] <= 200_000 * 0.64 else str(int(qualidade) - 8), "-compression_level", "6", f"{destino}/{arq}"], check=True)
    quadros.append({"f": n, "arq": arq, "x": m["x"], "y": m["y"], "w": m["w"], "h": m["h"]})
import os; os.remove(tmp)
json.dump({"largura": 810, "altura": 1440, "fim": 0.86, "quadros": quadros}, open(f"{destino}/astro.json", "w"), separators=(",", ":"))
print(len(quadros), "quadros")
