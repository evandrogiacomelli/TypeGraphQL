import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'

export namespace Usecase {
  export type Input = {
    id: string;
  }

  export type Output = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }

  export class UseCase {
    constructor(private authorsRepository: AuthorsPrismaRepository) {
    }

    async execute(input: Input): Promise<Output> {
      const { id } = input
      return await this.authorsRepository.findById(id)
    }
  }

}
