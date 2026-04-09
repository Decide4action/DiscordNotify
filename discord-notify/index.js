const https = require('https');

function getInput(name, fallback = '') {
  const key = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
  return (process.env[key] || fallback).trim();
}

function isTrue(value) {
  return /^(1|true|yes|on)$/i.test((value || '').trim());
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = (value || '').trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

function extractUrl(...values) {
  for (const value of values) {
    const match = (value || '').match(/https?:\/\/\S+/i);
    if (match) {
      return match[0].replace(/[)\].,!?]+$/, '');
    }
  }
  return '';
}

function extractVersion(...values) {
  for (const value of values) {
    const text = (value || '').trim();
    if (!text) {
      continue;
    }

    const labeledMatch = text.match(/\bversion\b[:\s#-]*([0-9]+(?:\.[0-9A-Za-z-]+)+)\b/i);
    if (labeledMatch) {
      return labeledMatch[1];
    }

    const semverMatch = text.match(/\b([0-9]+(?:\.[0-9A-Za-z-]+){1,})\b/);
    if (semverMatch) {
      return semverMatch[1];
    }
  }
  return '';
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
  const version = getInput('version');
  const sharepointLink = getInput('sharepoint_link');
  const username = getInput('username', 'GitHub Actions');

  if (!webhookUrl) {
    throw new Error('Missing required input: webhook_url');
  }
  if (!status) {
    throw new Error('Missing required input: status');
  }

  const resolvedVersion = firstNonEmpty(
    version,
    extractVersion(message, title)
  );
  const resolvedSharePointLink = firstNonEmpty(
    sharepointLink,
    extractUrl(message, title)
  );

  if (!resolvedVersion) {
    throw new Error('Missing version. Provide input: version, or include a parseable version in title/message.');
  }
  if (!resolvedSharePointLink) {
    throw new Error('Missing SharePoint link. Provide input: sharepoint_link, or include a URL in title/message.');
  }

  const payload = {
    username,
    content: `new version ${resolvedVersion} out: ${resolvedSharePointLink}`,
  };

  await postJson(webhookUrl, payload);
  process.stdout.write('Discord notification sent.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
