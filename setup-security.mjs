import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, 'apps', 'api');
const envPath = path.join(apiPath, '.env');

console.log('--- Phase 1: Security Setup ---');

// 1. Generate/Update ENCRYPTION_KEY
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

if (!envContent.includes('ENCRYPTION_KEY')) {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('Generated new ENCRYPTION_KEY');
    envContent += `\nENCRYPTION_KEY="${key}"\n`;
    fs.writeFileSync(envPath, envContent);
} else {
    console.log('ENCRYPTION_KEY already exists in .env');
}

// 2. Load Env for Process
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const runEnv = { ...process.env, ...envVars };

// 3. Run Migration
try {
    console.log('Running Prisma Migration...');
    execSync('npx prisma migrate dev --name init_security_v3', {
        cwd: apiPath,
        env: runEnv,
        stdio: 'inherit'
    });
    console.log('Migration SUCCESS');
} catch (error) {
    console.error('Migration FAILED:', error.message);
    process.exit(1);
}

// 4. Generate Client
try {
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', {
        cwd: apiPath,
        env: runEnv,
        stdio: 'inherit'
    });
    console.log('Prisma Generation SUCCESS');
} catch (error) {
    console.error('Prisma Generation FAILED:', error.message);
    process.exit(1);
}

console.log('--- Setup Complete ---');
