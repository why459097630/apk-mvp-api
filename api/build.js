import { withCORS } from './_cors';

export default withCORS(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const template = body.template || 'core-template';
  const buildType = body.buildType || 'debug';

  // 生成一个查询用的 id（时间戳 + 模板 + 构建类型）
  const id = `${Date.now()}_${template}_${buildType}`;

  const r = await fetch(
    `https://api.github.com/repos/${process.env.OWNER}/${process.env.REPO}/actions/workflows/${process.env.WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: process.env.REF, inputs: { template, build_type: buildType } }),
    }
  );

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    return res.status(500).json({ error: 'dispatch_failed', detail: t });
  }
  return res.json({ id, template, buildType, status: 'queued' });
});
