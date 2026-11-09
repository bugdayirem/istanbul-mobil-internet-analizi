const records = __RECORDS__;
const assets = __ASSETS__;
const periods = [...new Set(records.map(r => r.period))].sort();
const districts = [...new Set(records.map(r => r.district))].sort((a,b) => a.localeCompare(b, 'tr'));
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    let response;
    if (url.pathname === '/api/meta') {
      response = json({name:'Semt Sinyal API',version:1,live:false,records:records.length,districts,periods,populationYear:2025,endpoints:['/api/meta','/api/records','/api/compare?districtA=Ataşehir&districtB=Kadıköy&period=2026-Q3'],note:'Static project dataset. No operator-specific or live BTK data.'});
    } else if (url.pathname === '/api/records') {
      const district=url.searchParams.get('district');
      const period=url.searchParams.get('period');
      if ((district && !districts.includes(district)) || (period && !periods.includes(period))) return json({error:'Geçersiz ilçe veya dönem'},400);
      response=json(records.filter(r => (!district || r.district===district) && (!period || r.period===period)));
    } else if (url.pathname === '/api/compare') {
      const a=url.searchParams.get('districtA'), b=url.searchParams.get('districtB'), period=url.searchParams.get('period');
      if (!districts.includes(a) || !districts.includes(b) || a===b || !periods.includes(period)) return json({error:'İki farklı geçerli ilçe ve bir dönem seçin.'},400);
      const first=records.find(r=>r.district===a && r.period===period);
      const second=records.find(r=>r.district===b && r.period===period);
      if(!first || !second) return json({error:'Bu döneme ait kayıt bulunamadı.'},404);
      response=json({first,second,period,live:false});
    } else if (assets[url.pathname]) {
      const asset=assets[url.pathname];
      const bytes=Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0));
      response=new Response(bytes,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff',...(url.pathname==='/sw.js'?{'Service-Worker-Allowed':'/'}:{})}});
    } else {
      response=json({error:'Not found'},404);
    }
    return request.method==='HEAD' ? new Response(null,{status:response.status,headers:response.headers}) : response;
  }
};
