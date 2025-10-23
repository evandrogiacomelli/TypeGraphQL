import { beforeEach, describe } from 'node:test'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'

describe( 'AuthorsPrismaRepository', () => {
  let module: TestingModule;
  let repository: AuthorsPrismaRepository;
  const prisma = new PrismaClient();

  beforeAll( async () => {
    execSync('npm run prisma:migratetest')
    await prisma.$connect();
    module = await Test.createTestingModule({}).compile();
    repository = new AuthorsPrismaRepository(prisma as any);
  })

  beforeEach(async () => {
    await prisma.author.deleteMany();
  })

  afterAll(async () => {
    await module.close();
  })
})
