import { beforeEach, describe } from 'node:test'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'
import { Prisma, PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { AuthorDataBuilder } from '@/authors/helpers/author-data-builder'
import { Author } from '@/authors/graphql/models/author'

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

  test('should create an author', async () => {
    const data = AuthorDataBuilder({});

    const author = await repository.create(data);

    const res = await repository.findById(author.id);
    expect(author).toMatchObject(res);

    await prisma.author.deleteMany();
  })


})

describe('search method', () => {
  const prisma = new PrismaClient();
  const repository = new AuthorsPrismaRepository(prisma as any);

  beforeEach(async () => {
    await prisma.author.deleteMany();
  })

  test('Should only apply pagination when the parameters are null', async () => {
    const createdAt = new Date();
    const data: Prisma.AuthorCreateManyInput[] = [];

    Array.from({ length: 16 }).forEach((_, index) => {
      const timeStamp = createdAt.getTime() + index;

      // chama o builder dentro do loop para gerar dados únicos
      const author = AuthorDataBuilder({});

      data.push({
        ...author,
        email: `author${index}@a.com`, // garante unicidade
        createdAt: new Date(timeStamp),
      });
    });

    // const data : Prisma.AuthorCreateManyInput[] = [];
    // for (let i = 0; i < 16; i++) {
    //   data.push({
    //     name: `test${i}`,
    //     email: `test${i}@gtest.com`,
    //     createdAt: new Date(),
    //   })
    // }

    await prisma.author.createMany({ data });

    // const allAuthors = await prisma.author.findMany();
    // console.log('todos os autores no banco:', allAuthors);

    const result = await repository.search({});

    expect(result.total).toBe(16);
    expect(result.items.length).toBe(15);
    result.items.forEach((item) => {
      expect(item.id).toBeDefined();
    })

    result.items.reverse().forEach((item, index) => {
      expect(`${item.email}${index + 1}@.a.com)`)
    })
  });

})
