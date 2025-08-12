export function withCORS(handler) {
  return async (req, res) => {
    const allow = process.env.ALLOW_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    return handler(req, res);
  };
}
