import json
from pathlib import Path
from openpyxl import load_workbook

klasor = Path(__file__).parent

# Excel dosyasını okuyoruz.
kitap = load_workbook(klasor / "nufus.xlsx", data_only=True)
sayfa = kitap.active

basliklar = [hucre.value for hucre in sayfa[1]]
degerler = [hucre.value for hucre in sayfa[2]]

# Kaynak dosyada fazladan bulunan "Ay" başlığını çıkarıyoruz.
# Değerler zaten yıllık olduğundan yalnızca başlığı düzeltiyoruz.
if basliklar[1] == "Ay":
    basliklar.pop(1)

nufuslar = dict(zip(basliklar, degerler))
yil = int(nufuslar["Yıl"])

# İlçe başlıklarını alıyoruz; İstanbul toplamını dışarıda bırakıyoruz.
ilce_nufuslari = {
    ilce: int(nufus)
    for ilce, nufus in nufuslar.items()
    if ilce not in ("Yıl", "İstanbul", None)
    and nufus is not None
}

# Eşleştirmeden önce kaynak veriyi kontrol ediyoruz.
if len(ilce_nufuslari) != 39:
    raise ValueError("Nüfus dosyasında 39 ilçe bulunamadı.")

if sum(ilce_nufuslari.values()) != int(nufuslar["İstanbul"]):
    raise ValueError("İlçe nüfusları İstanbul toplamıyla eşleşmiyor.")

with open(klasor / "data.json", encoding="utf-8") as dosya:
    kayitlar = json.load(dosya)

eksikler = {
    kayit["district"]
    for kayit in kayitlar
    if kayit["district"] not in ilce_nufuslari
}

if eksikler:
    raise ValueError(f"Nüfusu eşleşmeyen ilçeler: {eksikler}")

# Her internet kaydına ilçenin nüfusunu ve nüfus yılını ekliyoruz.
for kayit in kayitlar:
    kayit["population"] = ilce_nufuslari[kayit["district"]]
    kayit["populationYear"] = yil
    kayit["populationSource"] = "TÜİK / İTO Veri İstanbul"

with open(klasor / "data.json", "w", encoding="utf-8") as dosya:
    json.dump(kayitlar, dosya, ensure_ascii=False, indent=2)

print(f"Tamamlandı! {yil} nüfusları {len(kayitlar)} kayda eklendi.")