import { describe, it, expect } from 'vitest';
import { prisma } from '../src/lib/prisma.js';

describe('Prisma Client & Model Contract Verification', () => {
  it('exposes all planned data models matching frontend specifications', () => {
    // Verify delegate models are present on the client
    expect(prisma.category).toBeDefined();
    expect(prisma.product).toBeDefined();
    expect(prisma.enquiry).toBeDefined();
    expect(prisma.businessSettings).toBeDefined();
    expect(prisma.adminUser).toBeDefined();
  });
});
