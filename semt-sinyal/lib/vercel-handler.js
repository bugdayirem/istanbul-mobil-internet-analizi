import worker from '../worker/index.js';

export default async function handler(req,res) {
  const response = await worker.fetch(new Request(new URL(req.url,'https://semt-sinyal.invalid'),{method:req.method}));
  res.statusCode = response.status;
  for (const [name,value] of response.headers) res.setHeader(name,value);
  res.end(Buffer.from(await response.arrayBuffer()));
}
