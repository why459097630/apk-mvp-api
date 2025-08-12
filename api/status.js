import { withCORS } from './_cors';

export default withCORS(async function handler(req, res) {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'missing_id' });

  const parts = String(id).split('_');
  if (parts.length < 3) return res.status(400).json({ error: 'bad_id' });
  const ts = Number(parts[0]);
  const template = parts.slice(1, parts.length - 1).join('_');
  const buildType = parts[parts.length - 1];

  const wantName = `app-${buildType}-${template}.apk`;

  // 查最新 Release
  const r = await fetch(
    `https://api.github.com/repos/${process.env.OWNER}/${process.env.REPO}/releases/latest`,
    { headers: { 'Authorization': `Bearer ${process.env.GH_TOKEN}`, 'Accept': 'application/vnd.github+json' } }
  );

  if (!r.ok) return res.json({ id, status: 'building' });

  const rel = await r.json();
  const relTime = new Date(rel.created_at).getTime();
  if (relTime < ts) return res.json({ id, status: 'building' });

  const asset = (rel.assets || []).find(a => a.name === wantName);
  if (!asset) return res.json({ id, status: 'building' });

  return res.json({
    id, status: 'succeeded',
    name: asset.name,
    url: asset.browser_download_url,
    release: { tag: rel.tag_name, html_url: rel.html_url }
  });
});
