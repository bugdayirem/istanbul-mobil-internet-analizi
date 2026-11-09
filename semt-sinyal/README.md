# Semt Sinyal

A Turkish-language web prototype comparing mobile internet results and population across İstanbul’s 39 districts. Built with HTML, CSS, JavaScript and Python data preparation scripts.

## Features

- Select two different districts and one of seven quarters (2025 Q1–2026 Q3).
- Compare download/upload speed, latency, test counts and 2025 population.
- Read metric explanations and a transparent comparison summary.
- A district is highlighted overall only when it leads in all three internet metrics; otherwise the summary lists the trade-offs. Population is not used to rank network quality.

## Run locally

Open this folder in VS Code and launch `index.html` with Live Server. Alternatively, run `python3 -m http.server 5500` in this folder, then open http://localhost:5500/. Opening HTML directly as a file may prevent JSON loading.

The prepared `data.json` is included. Python dependencies are not needed to run the web app.

## Refresh the data

1. Export the six columns in `internet.csv` from Power BI, preserving one row per district and quarter.
2. Run `python3 donustur.py` to recreate `data.json` (this resets population fields).
3. Download the 2025 population workbook from İTO Veri İstanbul, save it as `nufus.xlsx` beside the scripts.
4. Install `python3 -m pip install -r requirements.txt` and run `python3 nufus_ekle.py`.

The population script handles the extra `Ay` header in the supplied annual export, checks the 39 districts and verifies their sum against the İstanbul total before writing. If the provider changes its workbook structure, inspect it before rerunning.

## Sources and limitations

- Mobile metrics: the accompanying Power BI project’s district–quarter export, derived from [Speedtest by Ookla Open Data](https://github.com/teamookla/ookla-open-data). See the parent project’s methodology. Derived mobile data remains subject to [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- Population: TÜİK 2025 via [İTO Veri İstanbul](https://veriistanbul.ito.org.tr/view/kategori/veri.php?Guid=89c6a94b-181a-46ea-a62a-c404ebfe8272). Population reference year remains 2025 for all selected internet quarters. The source workbook is obtained separately for refreshes.
- The 273 records cover 39 districts and seven quarters. Data is static, not a live API.
- No operator-specific, building-level, cell-site or direct signal-strength data is available.
- Test counts are not subscriber or population counts. District aggregates do not guarantee performance at a specific home.
- Latency labels (<50, 50–99.9, ≥100 ms) are simplified project guidance, not an official mobile quality standard. Packet loss and jitter are not evaluated.

This is an educational data analysis prototype, not an operator recommendation service. No blanket software licence is granted over third-party data.

## API and PWA

The hosted version now serves the existing dataset through a read-only API:

- `GET /api/meta`: districts, periods and dataset metadata.
- `GET /api/records`: records, optionally filtered by `district` and `period`.
- `GET /api/compare?districtA=Ataşehir&districtB=Kadıköy&period=2026-Q3`: validated two-district comparison.

This API does not connect to BTK or collect live measurements. The front end uses the API online and the prepared local dataset when offline. The service worker caches the application shell and dataset after installation; API query responses are not cached separately. The manifest and PNG icons support browser installation where available.

Build: `python3 scripts/build-worker.py` then `bash scripts/build.sh`. The generated Worker embeds the data and all required assets. Local Live Server remains supported using the JSON fallback; API requests need the hosted Worker runtime.
