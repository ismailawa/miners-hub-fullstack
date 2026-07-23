import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  function createService() {
    const usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
    const jwtService = {
      sign: jest.fn(() => 'signed-token'),
      verify: jest.fn(() => ({ sub: 'user-1' })),
      decode: jest.fn(() => ({ sub: 'user-1', exp: 4102444800 })),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
        return undefined;
      }),
    };
    const revokedTokens = new Map<string, any>();
    const revokedRefreshTokensRepository = {
      findOne: jest.fn(({ where }: any) =>
        Promise.resolve(revokedTokens.get(where.tokenHash) || null),
      ),
      create: jest.fn((data: any) => data),
      save: jest.fn((data: any) => {
        revokedTokens.set(data.tokenHash, data);
        return Promise.resolve(data);
      }),
    };

    return {
      service: new AuthService(
        usersService as any,
        jwtService as any,
        configService as any,
        revokedRefreshTokensRepository as any,
      ),
      usersService,
      jwtService,
      revokedRefreshTokensRepository,
    };
  }

  it('revokes a refresh token on logout', async () => {
    const { service, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'u@test.com',
    });

    await service.logout('refresh-token-1');

    await expect(
      service.refreshToken('refresh-token-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows non-revoked refresh tokens', async () => {
    const { service, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'u@test.com',
      role: 'investor',
    });

    await expect(service.refreshToken('refresh-token-2')).resolves.toEqual({
      accessToken: 'signed-token',
    });
  });
});
