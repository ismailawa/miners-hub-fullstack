import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyPasswordResetOtpDto,
} from './auth.dto';
import { UserRole } from '../entities/user.entity';
import { RevokedRefreshToken } from '../entities/revoked-refresh-token.entity';
import { PasswordResetOtp } from '../entities/password-reset-otp.entity';

const PASSWORD_RESET_OTP_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RevokedRefreshToken)
    private revokedRefreshTokensRepository: Repository<RevokedRefreshToken>,
    @InjectRepository(PasswordResetOtp)
    private passwordResetOtpsRepository: Repository<PasswordResetOtp>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const role = (registerDto.role as UserRole) || UserRole.MINER;
    if (![UserRole.MINER, UserRole.INVESTOR].includes(role)) {
      throw new BadRequestException(
        'Only miner and investor accounts can be created through public registration.',
      );
    }

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role,
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const genericResponse = {
      message: 'If an account exists for this email, a password reset OTP has been sent.',
    };

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      return genericResponse;
    }

    const otp = this.generateOtp();
    const otpRecord = this.passwordResetOtpsRepository.create({
      email: normalizedEmail,
      otpHash: this.hashOtp(normalizedEmail, otp),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
      consumedAt: null,
    });

    await this.passwordResetOtpsRepository.update(
      { email: normalizedEmail, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
    await this.passwordResetOtpsRepository.save(otpRecord);
    this.deliverPasswordResetOtp(normalizedEmail, otp);

    return genericResponse;
  }

  async verifyPasswordResetOtp(dto: VerifyPasswordResetOtpDto) {
    await this.assertValidPasswordResetOtp(
      this.normalizeEmail(dto.email),
      dto.otp,
    );

    return { message: 'OTP verified successfully.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const otpRecord = await this.assertValidPasswordResetOtp(
      normalizedEmail,
      dto.otp,
    );

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, await bcrypt.genSalt());
    await this.usersService.updatePasswordHash(user.id, passwordHash);
    otpRecord.consumedAt = new Date();
    await this.passwordResetOtpsRepository.save(otpRecord);

    return { message: 'Password reset successfully.' };
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

  private async assertValidPasswordResetOtp(
    email: string,
    otp: string,
  ): Promise<PasswordResetOtp> {
    const otpRecord = await this.passwordResetOtpsRepository.findOne({
      where: { email, consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    if (otpRecord.attempts >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
      otpRecord.consumedAt = new Date();
      await this.passwordResetOtpsRepository.save(otpRecord);
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const matches = otpRecord.otpHash === this.hashOtp(email, otp);
    if (!matches) {
      otpRecord.attempts += 1;
      await this.passwordResetOtpsRepository.save(otpRecord);
      throw new BadRequestException('Invalid or expired OTP.');
    }

    return otpRecord;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateOtp(): string {
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      return '123456';
    }

    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private hashOtp(email: string, otp: string): string {
    const secret = this.configService.get<string>('PASSWORD_RESET_OTP_SECRET')
      || this.configService.get<string>('JWT_SECRET')
      || 'miners-hub-password-reset-secret';
    return createHash('sha256')
      .update(`${email}:${otp}:${secret}`)
      .digest('hex');
  }

  private deliverPasswordResetOtp(email: string, otp: string): void {
    const appName = this.configService.get<string>('APP_NAME') || 'Miners Hub';
    const ttl = `${PASSWORD_RESET_OTP_EXPIRY_MINUTES} minutes`;
    console.log(
      `[${appName}] Password reset OTP for ${email}: ${otp}. It expires in ${ttl}.`,
    );
  }
}
