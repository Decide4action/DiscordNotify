const https = require('https');

function getInput(name, fallback = '') {
  const key = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
  return (process.env[key] || fallback).trim();
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload), 'utf8');
    const request = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(body);
          return;
        }
        reject(new Error(`Discord webhook failed: ${response.statusCode} ${body}`));
      });
    });

    request.on('error', reject);
    request.write(data);
    request.end();
  });
}

async function main() {
  const webhookUrl = getInput('webhook_url');
  const status = getInput('status').toLowerCase();
  const title = getInput('title') || (process.env.GITHUB_WORKFLOW || '').trim();
  const message = getInput('message');
  const username = getInput('username', 'GitHub Actions');
  const repository = (process.env.GITHUB_REPOSITORY || '').trim();
  const branch = ((process.env.GITHUB_REF_NAME || '').trim()) || 'main';
  const actor = (process.env.GITHUB_ACTOR || '').trim();
  const eventName = (process.env.GITHUB_EVENT_NAME || '').trim();
  const runId = (process.env.GITHUB_RUN_ID || '').trim();
  const serverUrl = (process.env.GITHUB_SERVER_URL || 'https://github.com').trim();

  if (!webhookUrl) {
    throw new Error('Missing required input: webhook_url');
  }
  if (!status) {
    throw new Error('Missing required input: status');
  }

  const colors = {
    success: 3066993,
    failure: 15158332,
    cancelled: 9807270,
  };

  const runUrl = repository && runId ? `${serverUrl}/${repository}/actions/runs/${runId}` : serverUrl;
  const lines = [
    `Status: ${status}`,
    `Repository: ${repository}`,
    `Branch: ${branch}`,
    `Actor: ${actor}`,
    `Event: ${eventName}`,
  ];

  if (message) {
    lines.push('', message);
  }

  const payload = {
    username,
    embeds: [
      {
        title,
        description: lines.join('\n'),
        color: colors[status] || 3447003,
        url: runUrl,
      },
    ],
  };

  await postJson(webhookUrl, payload);
  process.stdout.write('Discord notification sent.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
