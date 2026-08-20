import { UsersService } from './users.service';

describe('UsersService', () => {
  const prismaMock = {
    user: { findUnique: jest.fn() },
  };

  let usersService: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    usersService = new UsersService(prismaMock as any);
  });

  it('finds a user by email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
    });

    const result = await usersService.findByEmail('a@test.com');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@test.com' },
    });
    expect(result).toEqual({ id: 'user-1', email: 'a@test.com' });
  });

  it('finds a user by id', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

    const result = await usersService.findById('user-1');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(result).toEqual({ id: 'user-1' });
  });
});
