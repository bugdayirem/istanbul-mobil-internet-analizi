const districtA = document.getElementById("district-a");
const districtB = document.getElementById("district-b");
const periodSelect = document.getElementById("period");
const compareButton = document.getElementById("compare-button");
const result = document.getElementById("comparison-result");

let records = [];

function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || value === "") {
    return "Veri yok";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return "Veri yok";

  return number.toLocaleString("tr-TR", {
    maximumFractionDigits: decimals
  });
}

function addOption(select, value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.appendChild(option);
}

function addText(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.appendChild(element);
}

function checkSelections() {
  compareButton.disabled = !(
    districtA.value &&
    districtB.value &&
    districtA.value !== districtB.value &&
    periodSelect.value
  );
}

function createDistrictCard(record) {
  const card = document.createElement("article");
  card.className = "district-card";

  // Eksik değerleri sıfır olarak değerlendirmiyoruz.
  function validNumber(value) {
    return value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0;
  }

  function addMetric(title, value, unit, explanation) {
    const box = document.createElement("div");
    box.className = "metric";

    addText(box, "strong", title);

    addText(
      box,
      "p",
      validNumber(value)
        ? `${formatNumber(value)} ${unit}`
        : "Veri yok"
    );

    addText(
      box,
      "small",
      validNumber(value) ? explanation : "Bu gösterge için kayıt bulunmuyor."
    );

    card.appendChild(box);
  }

  addText(card, "h3", record.district);

  addText(
    card,
    "p",
    `Nüfus: ${formatNumber(record.population, 0)}`
  );

  if (record.populationYear) {
    addText(
      card,
      "small",
      `Nüfus yılı: ${record.populationYear}`
    );
  }

  // İndirme hızının açıklaması.
  const downloadNote =
  "Video izleme, sayfa açma ve dosya indirme hızı. " +
  "Yüksek olması tercih edilir.";

  addMetric(
    "İndirme hızı",
    record.download,
    "Mbps",
    downloadNote
  );

  addMetric(
    "Yükleme hızı",
    record.upload,
    "Mbps",
    "Dosya gönderme ve görüntünü karşıya iletme hızı. Yüksek olması tercih edilir."
  );

  let latencyNote;

  if (Number(record.latency) < 50) {
    latencyNote = "Düşük gecikme · Daha hızlı tepki.";
  } else if (Number(record.latency) < 100) {
    latencyNote = "Orta gecikme · Tepki süresi daha uzun.";
  } else {
    latencyNote =
      "Yüksek gecikme · Etkileşimli uygulamalarda gecikme hissedilebilir.";
  }

  addMetric(
    "Tepki süresi",
    record.latency,
    "ms",
    latencyNote
  );

  addText(
    card,
    "p",
    `Test sayısı: ${formatNumber(record.tests, 0)}`
  );

  return card;
}

async function compareDistricts() {
  let first = records.find(record =>
    record.district === districtA.value &&
    record.period === periodSelect.value
  );

  let second = records.find(record =>
    record.district === districtB.value &&
    record.period === periodSelect.value
  );

  // Canlı sitede karşılaştırmayı API'den iste; çevrimdışında yerel veriyi kullan.
  let offline = false;
  const selectedA = districtA.value;
  const selectedB = districtB.value;
  const selectedPeriod = periodSelect.value;
  compareButton.disabled = true;
  try {
    const params = new URLSearchParams({districtA: selectedA, districtB: selectedB, period: selectedPeriod});
    const response = await fetch('./api/compare?' + params);
    if (!response.ok) throw new Error('API kullanılamıyor');
    const comparison = await response.json();
    first = comparison.first;
    second = comparison.second;
  } catch {
    offline = true;
  } finally {
    checkSelections();
  }
  if (districtA.value !== selectedA || districtB.value !== selectedB || periodSelect.value !== selectedPeriod) return;
  result.replaceChildren();
  addText(result, 'small', offline ? 'Kaydedilmiş veri ile karşılaştırma' : 'API üzerinden karşılaştırma');

  if (!first || !second) {
    addText(
      result,
      "p",
      "Seçilen dönemde iki ilçe için de kayıt bulunamadı."
    );
    return;
  }

  addText(
    result,
    "p",
    `İnternet verisi dönemi: ${periodSelect.value}`
  );

  result.appendChild(createDistrictCard(first));
  result.appendChild(createDistrictCard(second));
  const recommendation = document.createElement("div");
recommendation.className = "recommendation";

addText(recommendation, "h3", "Önerimiz");

const metrics = [
  { key: "download", title: "İndirme hızında", higher: true },
  { key: "upload", title: "Yükleme hızında", higher: true },
  { key: "latency", title: "Düşük gecikmede", higher: false }
];

const wins = { first: 0, second: 0 };
let compared = 0;

for (const metric of metrics) {
  const a = first[metric.key];
  const b = second[metric.key];

  if (
    a === null || a === undefined || a === "" ||
    b === null || b === undefined || b === "" ||
    !Number.isFinite(Number(a)) ||
    !Number.isFinite(Number(b)) ||
    Number(a) < 0 || Number(b) < 0
  ) {
    continue;
  }

  compared++;

  // Ekranda gösterdiğimiz hassasiyette karşılaştırıyoruz.
  const valueA = Number(Number(a).toFixed(1));
  const valueB = Number(Number(b).toFixed(1));

  if (valueA === valueB) {
    addText(
      recommendation,
      "p",
      `${metric.title} iki ilçe aynı düzeyde.`
    );
    continue;
  }

  const firstWins = metric.higher
    ? valueA > valueB
    : valueA < valueB;

  wins[firstWins ? "first" : "second"]++;

  addText(
    recommendation,
    "p",
    `${metric.title} ${
      firstWins ? first.district : second.district
    } öne çıkıyor.`
  );
}

if (compared === 3) {
  if (wins.first === 3 || wins.second === 3) {
    const winner = wins.first === 3 ? first : second;

    addText(
      recommendation,
      "strong",
      `Bu dönemde üç göstergede de ${winner.district} öne çıkıyor.`
    );
  } else {
    addText(
      recommendation,
      "strong",
      "Seçimini önceliğine göre yap: hız mı, daha düşük gecikme mi?"
    );
  }
} else {
  addText(
    recommendation,
    "strong",
    "Genel öneri için karşılaştırılabilir veri eksik."
  );
}

addText(
  recommendation,
  "small",
  "Yorum yalnızca seçilen dönemin ilçe verilerine dayanır. " +
  "Nüfus, öneri puanına dahil edilmez; adres bazında performans garantisi değildir."
);

result.appendChild(recommendation);

  addText(
    result,
    "small",
    "İlçe sonuçları adres bazında bağlantı garantisi vermez."
  );
}

async function loadData() {
  try {
    let response;
    try {
      response = await fetch('./api/records');
      if (!response.ok) throw new Error('Yerel veri kullanılacak');
    } catch {
      response = await fetch('./data.json');
    }

    if (!response.ok) {
      throw new Error("Veri dosyası okunamadı.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Veri tablosu boş veya uygun biçimde değil.");
    }

    records = data;

    const districts = [
      ...new Set(records.map(record => record.district))
    ].sort((a, b) => a.localeCompare(b, "tr"));

    const periods = [
      ...new Set(records.map(record => record.period))
    ].sort();

    districts.forEach(district => {
      addOption(districtA, district);
      addOption(districtB, district);
    });

    periods.forEach(period => {
      addOption(periodSelect, period);
    });

    checkSelections();
  } catch (error) {
    result.replaceChildren();

    addText(
      result,
      "p",
      "Veri dosyası henüz eklenmedi veya okunamadı."
    );

    console.error(error);
  }
}

districtA.addEventListener("change", checkSelections);
districtB.addEventListener("change", checkSelections);
periodSelect.addEventListener("change", checkSelections);
compareButton.addEventListener("click", compareDistricts);

loadData();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(error => {
        console.error("Çevrimdışı özellik başlatılamadı:", error);
      });
  });
}