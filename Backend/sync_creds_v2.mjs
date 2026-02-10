import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

try {
    const credsPath = path.join(process.cwd(), 'google-cloud-credentials.json');
    const creds = JSON.parse(readFileSync(credsPath, 'utf8'));
    const minified = JSON.stringify(creds);
    const base64 = Buffer.from(minified).toString('base64');

    console.log('Syncing Base64 encoded GOOGLE_APPLICATION_CREDENTIALS_JSON to Convex...');

    const result = spawnSync('npx.cmd', ['convex', 'env', 'set', 'GOOGLE_APPLICATION_CREDENTIALS_JSON', base64], {
        encoding: 'utf8',
        shell: true
    });

    if (result.status !== 0) {
        throw new Error(result.stderr || 'Unknown error');
    }

    console.log('Successfully synced Base64 credentials!');
} catch (error) {
    console.error('Failed to sync credentials:', error.message);
    process.exit(1);
}
