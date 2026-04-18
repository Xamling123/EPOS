#!/usr/bin/env node

/**
 * EPOS System - Connection Checker
 * Checks if backend and frontend are running properly
 */

const http = require('http');

console.log('\x1b[36m╔════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║   EPOS System - Connection Checker         ║\x1b[0m');
console.log('\x1b[36m╚════════════════════════════════════════════╝\x1b[0m\n');

const checks = [
    { name: 'Backend Server', url: 'http://localhost:8000/api/auth/profile/', timeout: 3000 },
    { name: 'Frontend Server', url: 'http://localhost:5173/', timeout: 3000 },
];

let completed = 0;

checks.forEach((check) => {
    console.log(`\x1b[33mChecking ${check.name}...\x1b[0m`);
    
    const startTime = Date.now();
    const req = http.get(check.url, { timeout: check.timeout }, (res) => {
        const time = Date.now() - startTime;
        const status = res.statusCode === 200 || res.statusCode === 401 ? '✓' : '⚠';
        const statusColor = res.statusCode === 200 || res.statusCode === 401 ? '\x1b[32m' : '\x1b[33m';
        
        console.log(`${statusColor}${status} ${check.name}: ${res.statusCode} (${time}ms)\x1b[0m\n`);
        completed++;
        
        if (completed === checks.length) {
            summary();
        }
    });

    req.on('timeout', () => {
        req.destroy();
        console.log('\x1b[31m✗ Timeout - is the server running?\x1b[0m\n');
        completed++;
        
        if (completed === checks.length) {
            summary();
        }
    });

    req.on('error', (err) => {
        const errMsg = err.code === 'ECONNREFUSED' ? 'Connection refused - server not running' : err.message;
        console.log(`\x1b[31m✗ ${check.name}: ${errMsg}\x1b[0m\n`);
        completed++;
        
        if (completed === checks.length) {
            summary();
        }
    });
});

function summary() {
    console.log('\x1b[36m─────────────────────────────────────────────\x1b[0m');
    console.log('\x1b[33mIf both servers show errors:\x1b[0m');
    console.log('  1. Open PowerShell in the project root');
    console.log('  2. Run: .\run_project.ps1');
    console.log('');
    console.log('\x1b[33mIf backend shows error:\x1b[0m');
    console.log('  cd backend');
    console.log('  python manage.py runserver');
    console.log('');
    console.log('\x1b[33mIf frontend shows error:\x1b[0m');
    console.log('  cd frontend');
    console.log('  npm run dev');
    console.log('\x1b[36m─────────────────────────────────────────────\x1b[0m\n');
}
