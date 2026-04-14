// setup.js
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');

// Setup interactive terminal prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Helper to run shell commands synchronously with terminal output
function run(command) {
    console.log(`\x1b[36m> ${command}\x1b[0m`);
    execSync(command, { stdio: 'inherit', shell: true });
}

async function main() {
    console.log('\x1b[36m\nStarting unified setup for Heroes of Unemployment...\n\x1b[0m');

    // 1. Navigate to directory
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

    // 2. Install Dependencies
    console.log('\x1b[33m[1/5] Installing npm dependencies...\x1b[0m');
    run('npm install');

    // 3. Environment Variables & Secret Generation
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

    // Safely parse .env and inject AUTH_SECRET if missing
    let envContent = fs.readFileSync('.env', 'utf-8');
    if (!envContent.includes('AUTH_SECRET=""')) {
        console.log('Generating and injecting AUTH_SECRET...');
        const secret = crypto.randomBytes(32).toString('base64');
        fs.appendFileSync('.env', `\nAUTH_SECRET="${secret}"\n`);
        console.log('\x1b[32m✓ AUTH_SECRET securely generated and added to .env\x1b[0m');
    } else {
        console.log('\x1b[32m✓ AUTH_SECRET already detected in .env\x1b[0m');
    }

    // 4. Database Schema
    console.log('\n\x1b[33m[3/5] Syncing database schema...\x1b[0m');
    run('npm run db:generate');
    run('npm run db:push');
    run('npm run db:migrate');
    
    await question('Press Enter to open Prisma Studio and start the Dev Server...');
    rl.close();

    // 5. Boot Applications
    console.log('\n\x1b[33m[5/5] Booting up...\x1b[0m');
    
    // Start Prisma Studio in a detached background process
    console.log('Starting Prisma Studio on port 5555...');
    const prisma = spawn('npm', ['run', 'db:studio'], {
        stdio: 'ignore', 
        detached: true,
        shell: true
    });
    prisma.unref(); 

    // Start Next.js Dev Server
    console.log('\x1b[32mStarting Next.js development server on port 3001...\x1b[0m\n');
    run('npm run dev');
}

main().catch((error) => {
    console.error('\x1b[31mAn error occurred during setup:\x1b[0m', error);
    process.exit(1);
});