import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { UserRole } from '../entities/user.entity';
import { RevokedRefreshToken } from '../entities/revoked-refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RevokedRefreshToken)
    private revokedRefreshTokensRepository: Repository<RevokedRefreshToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: (registerDto.role as UserRole) || UserRole.MINER,
    });

    const tokens = this.generateTokens(user);

    const { passwordHash: _, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    const { passwordHash: _, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refresh-secret',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
        '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    if (await this.isRefreshTokenRevoked(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh-secret',
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      return { accessToken: tokens.accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  private async isRefreshTokenRevoked(refreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(refreshToken);
    const existing = await this.revokedRefreshTokensRepository.findOne({
      where: { tokenHash },
    });
    return Boolean(existing);
  }

  private async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const existing = await this.revokedRefreshTokensRepository.findOne({
      where: { tokenHash },
    });
    if (existing) return;

    const decoded = this.jwtService.decode(refreshToken) as
      | { sub?: string; exp?: number }
      | null;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

    const revokedToken = this.revokedRefreshTokensRepository.create({
      tokenHash,
      userId: decoded?.sub || null,
      expiresAt,
    });
    await this.revokedRefreshTokensRepository.save(revokedToken);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
