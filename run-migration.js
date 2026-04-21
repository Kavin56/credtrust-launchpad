const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', 'apps', 'api', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

console.log('Loaded DATABASE_URL from .env');

try {
    console.log('Running prisma migrate dev...');
    execSync('npx prisma migrate dev --name init_system_security', {
        cwd: path.join(__dirname, '..', 'apps', 'api'),
        env: { ...process.env, ...envVars },
        stdio: 'inherit'
    });
    console.log('Migration successful!');
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
}
