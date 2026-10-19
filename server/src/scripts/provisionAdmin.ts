import readline from 'readline/promises';
import { prisma } from '../lib/prisma.js';
import { PasswordService } from '../services/password.service.js';
import { AdminRole } from '@prisma/client';

function parseArgs(): {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
} {
  const args = process.argv.slice(2);
  const result: { name?: string; email?: string; password?: string; role?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--name=') || arg.startsWith('name=')) {
      result.name = arg.split('=')[1];
    } else if (arg === '--name' || arg === 'name') {
      result.name = args[++i];
    } else if (arg.startsWith('--email=') || arg.startsWith('email=')) {
      result.email = arg.split('=')[1];
    } else if (arg === '--email' || arg === 'email') {
      result.email = args[++i];
    } else if (arg.startsWith('--password=') || arg.startsWith('password=')) {
      result.password = arg.split('=')[1];
    } else if (arg === '--password' || arg === 'password') {
      result.password = args[++i];
    } else if (arg.startsWith('--role=') || arg.startsWith('role=')) {
      result.role = arg.split('=')[1];
    } else if (arg === '--role' || arg === 'role') {
      result.role = args[++i];
    }
  }

  // Also support positional: [name, email, password, role]
  if (!result.email && args.length >= 3 && args[1].includes('@')) {
    result.name = args[0];
    result.email = args[1];
    result.password = args[2];
    result.role = args[3] || 'ADMIN';
  }

  return result;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function provisionAdmin(): Promise<void> {
  const flags = parseArgs();

  let name = flags.name || process.env.ADMIN_NAME;
  let email = flags.email || process.env.ADMIN_EMAIL;
  let password = flags.password || process.env.ADMIN_PASSWORD;
  let roleInput = (flags.role || process.env.ADMIN_ROLE || 'ADMIN').toUpperCase();

  // If missing fields and running in an interactive terminal, prompt safely
  if (!name || !email || !password) {
    if (process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      try {
        console.log('\n--- Divine Favour: Administrator Provisioning ---');
        if (!name) {
          name = await rl.question('Enter administrator full name: ');
        }
        if (!email) {
          email = await rl.question('Enter administrator email: ');
        }
        if (!password) {
          password = await rl.question('Enter administrator password (min 8 chars): ');
        }
        if (!flags.role && !process.env.ADMIN_ROLE) {
          const roleAns = await rl.question('Role (ADMIN / STAFF / SUPERADMIN) [default: ADMIN]: ');
          if (roleAns.trim()) {
            roleInput = roleAns.trim().toUpperCase();
          }
        }
      } finally {
        rl.close();
      }
    } else {
      console.error('[Error] Missing required arguments: name, email, and password.');
      console.error('Usage: npm run admin:provision -- --name="Admin Name" --email="admin@example.com" --password="SecretPassword!"');
      process.exit(1);
    }
  }

  // 1. Validation
  name = name?.trim();
  email = email?.trim().toLowerCase();

  if (!name || name.length < 2) {
    console.error('[Error] Name is required and must be at least 2 characters.');
    process.exit(1);
  }

  if (!email || !isValidEmail(email)) {
    console.error('[Error] A valid email address is required.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[Error] Password must be at least 8 characters long.');
    process.exit(1);
  }

  const allowedRoles: Record<string, AdminRole> = {
    ADMIN: AdminRole.ADMIN,
    STAFF: AdminRole.STAFF,
    SUPERADMIN: AdminRole.SUPERADMIN,
  };

  const role = allowedRoles[roleInput] || AdminRole.ADMIN;

  try {
    // 2. Check if user already exists
    const existing = await prisma.adminUser.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      console.warn(`[Warning] An administrator with email "${email}" already exists (ID: ${existing.id}).`);
      console.warn('Refusing to overwrite existing account. No changes were made.');
      process.exit(0);
    }

    // 3. Hash password using Argon2id
    console.log('[Info] Hashing administrator password with Argon2id...');
    const passwordHash = await PasswordService.hashPassword(password);

    // 4. Create account in database
    const createdUser = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });

    console.log('\n✔ Administrator created successfully!');
    console.log(`- ID: ${createdUser.id}`);
    console.log(`- Name: ${createdUser.name}`);
    console.log(`- Email: ${createdUser.email}`);
    console.log(`- Role: ${createdUser.role}`);
    console.log(`- Status: Active`);
    console.log('Credentials are ready for use. Store your password in a safe password manager.\n');
  } catch (error) {
    console.error('[Error] Failed to provision administrator:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].includes('provisionAdmin')) {
  provisionAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
