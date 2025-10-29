import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'

export namespace CreateAuthorUsecase {
  export type Input = {
    name: string;
    email: string;
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

      const { email, name } = input
      if (!email || !name) throw new BadRequestError('Please enter a valid email and name.')

      const emailExists = await this.authorsRepository.findByEmail(email)
      if (emailExists) throw new ConflictError('Email already exists')

      return await this.authorsRepository.create(input)
    }
  }

}
