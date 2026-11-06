import csv
import json
from pathlib import Path

klasor = Path(__file__).parent
kayitlar = []

with open(klasor / "internet.csv", encoding="utf-8-sig", newline="") as dosya:
    for satir in csv.DictReader(dosya):
        kayitlar.append({
            "district": satir["ilce"],
            "period": satir["donem_kodu"],
            "download": float(satir["Sum of indirme_mbps"]),
            "upload": float(satir["Sum of yukleme_mbps"]),
            "latency": float(satir["Sum of gecikme_ms"]),
            "tests": int(float(satir["Sum of toplam_test_sayisi"])),
            "population": None,
            "populationYear": None
        })

with open(klasor / "data.json", "w", encoding="utf-8") as dosya:
    json.dump(kayitlar, dosya, ensure_ascii=False, indent=2)

print(f"Tamamlandı: {len(kayitlar)} kayıt data.json dosyasına yazıldı.")