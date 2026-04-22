// Easy localhost setup script for Heroes of Unemployment
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');
// Terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Helper to run shell commands along with terminal output
function run(command) {
    console.log(`\x1b[36m> ${command}\x1b[0m`);
    execSync(command, { stdio: 'inherit', shell: true });
}

async function main() {
    console.log('\x1b[36m\nStarting unified setup for Heroes of Unemployment...\n\x1b[0m');
    const targetDir = 'heroes_of_unemployment';
    if (fs.existsSync(targetDir)) {
        process.chdir(targetDir);
        console.log(`\x1b[32m✓ Changed directory to ${targetDir}\x1b[0m\n`);
    } else if (path.basename(process.cwd()) === targetDir) {
        console.log(`\x1b[32m✓ Already in ${targetDir} directory\x1b[0m\n`);
    } else {
        console.error(`\x1b[31mError: Could not find '${targetDir}'. Please run this script from the parent folder.\x1b[0m`);
        process.exit(1);
    }
    console.log('\x1b[33m[1/5] Installing npm dependencies...\x1b[0m');
    run('npm install');
    console.log('\n\x1b[33m[2/5] Setting up environment variables...\x1b[0m');
    if (fs.existsSync('.env')) {
        const overwrite = await question('An .env file already exists. Overwrite it with a fresh copy from .env.example? (y/N): ');
        if (overwrite.toLowerCase() === 'y' || overwrite.toLowerCase() === 'yes') {
            if (fs.existsSync('.env.example')) {
                fs.copyFileSync('.env.example', '.env');
                console.log('\x1b[32m✓ Overwrote .env with a fresh copy of .env.example\x1b[0m');
            } else {
                console.log('\x1b[31mNo .env.example found. Wiping existing .env...\x1b[0m');
                fs.writeFileSync('.env', '');
            }
        } else {
            console.log('\x1b[32m✓ Keeping existing .env\x1b[0m');
        }
    } else {
        if (fs.existsSync('.env.example')) {
            fs.copyFileSync('.env.example', '.env');
            console.log('\x1b[32m✓ Created new .env from .env.example\x1b[0m');
        } else {
            console.log('\x1b[31mNo .env.example found. Creating a fresh .env file...\x1b[0m');
            fs.writeFileSync('.env', '');
        }
    }

    // Safely parse .env and inject or update AUTH_SECRET
    let envContent = fs.readFileSync('.env', 'utf-8');
    
    // Find the AUTH_SECRET line, no matter how it's formatted
    const emptySecretRegex = /^AUTH_SECRET=(["']{0,2})\s*$/m; 
    const hasSecretRegex = /^AUTH_SECRET=.*$/m;               

    if (emptySecretRegex.test(envContent)) {
        console.log('Empty AUTH_SECRET found. Generating and updating...');
        const secret = crypto.randomBytes(32).toString('base64');
        envContent = envContent.replace(hasSecretRegex, `AUTH_SECRET="${secret}"`);
        fs.writeFileSync('.env', envContent);
        console.log('\x1b[32m✓ AUTH_SECRET securely generated and updated in .env\x1b[0m');
        
    } else if (!hasSecretRegex.test(envContent)) {
        console.log('Generating and injecting AUTH_SECRET...');
        const secret = crypto.randomBytes(32).toString('base64');
        fs.appendFileSync('.env', `\nAUTH_SECRET="${secret}"\n`);
        console.log('\x1b[32m✓ AUTH_SECRET securely generated and added to .env\x1b[0m');
        
    } else {
        console.log('\x1b[32m✓ Valid AUTH_SECRET already detected in .env\x1b[0m');
    }

    // 4. Database Schema
    console.log('\n\x1b[33m[3/5] Syncing database schema and seeding...\x1b[0m');
    run('npm run db:generate');
    run('npm run db:push');
	run('npm run db:seed');

    //5. Boot Applications
    console.log('\n\x1b[33m[5/5] Booting up...\x1b[0m');
    
    // Start Prisma Studio (Tied to this terminal so it dies on Ctrl+C)
    console.log('Starting Prisma Studio on port 5555...');
    spawn('npm', ['run', 'db:studio'], {
        stdio: 'ignore', 
        shell: true
    });

    //Open browser for webpage, Prisma studio already opens itself.
    setTimeout(() => {
        const url = 'http://localhost:3001';
        console.log(`\n\x1b[36m> Opening ${url} in your browser...\x1b[0m\n`);

        // Cross-platform command to open default browser
        const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        spawn(startCmd, [url], { shell: true });
    }, 4000);

    // Start Next.js asynchronously so the timer above can actually run
    const devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });

    // Ensure the Node script cleanly exits when you stop Next.js
    devServer.on('close', (code) => {
        process.exit(code);
    });
}

main().catch((error) => {
    console.error('\x1b[31mAn error occurred during setup:\x1b[0m', error);
    process.exit(1);
});