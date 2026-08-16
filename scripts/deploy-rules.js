/**
 * Despliega las reglas de Firestore usando la Firebase Rules API
 * con el service account. Sin necesidad de firebase login.
 */
const fs    = require('fs');
const path  = require('path');
const https = require('https');
const admin = require('firebase-admin');

const envText = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const sdkJson = envText.match(/FIREBASE_ADMIN_SDK_JSON=(.+)/m)[1].trim();
const sa      = JSON.parse(sdkJson);
const PROJECT = sa.project_id;

const RULES_SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'firestore.rules'),
  'utf8'
);

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

async function getToken() {
  const cred = admin.app().options.credential;
  const token = await cred.getAccessToken();
  return token.access_token;
}

function apiCall(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data   = body ? JSON.stringify(body) : null;
    const host   = 'firebaserules.googleapis.com';
    const options = {
      hostname: host,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Desplegando reglas de Firestore para proyecto:', PROJECT);
  const token = await getToken();

  // 1. Crear un nuevo ruleset
  const rulesetPath = `/v1/projects/${PROJECT}/rulesets`;
  const createRes = await apiCall('POST', rulesetPath, {
    source: {
      files: [{ name: 'firestore.rules', content: RULES_SOURCE }],
    },
  }, token);

  if (createRes.status !== 200) {
    console.error('Error creando ruleset:', JSON.stringify(createRes.body, null, 2));
    process.exit(1);
  }

  const rulesetName = createRes.body.name;
  console.log('  → Ruleset creado:', rulesetName);

  // 2. Actualizar el release '(default)' para apuntar al nuevo ruleset
  const releasePath = `/v1/projects/${PROJECT}/releases/cloud.firestore`;
  const releaseRes  = await apiCall('PATCH', releasePath, {
    release: { name: `projects/${PROJECT}/releases/cloud.firestore`, rulesetName },
  }, token);

  if (releaseRes.status === 404) {
    // Si no existe el release, lo creamos
    const createReleaseRes = await apiCall('POST', `/v1/projects/${PROJECT}/releases`, {
      release: { name: `projects/${PROJECT}/releases/cloud.firestore`, rulesetName },
    }, token);
    if (createReleaseRes.status !== 200) {
      console.error('Error creando release:', JSON.stringify(createReleaseRes.body, null, 2));
      process.exit(1);
    }
    console.log('  → Release creado.');
  } else if (releaseRes.status !== 200) {
    console.error('Error actualizando release:', JSON.stringify(releaseRes.body, null, 2));
    process.exit(1);
  } else {
    console.log('  → Release actualizado.');
  }

  console.log('\n✅ Reglas de Firestore desplegadas correctamente.');
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
