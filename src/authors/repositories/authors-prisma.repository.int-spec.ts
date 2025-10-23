import { beforeEach, describe } from 'node:test'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { AuthorDataBuilder } from '@/authors/helpers/author-data-builder'

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

  test('should throws an error when id is not found', async () => {
    let id = "37a03e31-1282-4a79-98c6-c08b7b0a88b0";

    await expect(repository.findById(id)).rejects.toThrow(
      new NotFoundError(`Author with id ${id} not found`)
    );
  })

  test('should find an author by id', async () => {
    const data = AuthorDataBuilder({});

    const author = await prisma.author.create({
      data,
    });

    const res = await repository.findById(author.id);
    expect(res).toStrictEqual(author);
  })
})
