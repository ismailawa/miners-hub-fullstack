import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, VerificationStatus } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const adminEmail = 'admin@minershub.com';
  
  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
  
  if (existingAdmin) {
    console.log('Admin user already exists!');
    await app.close();
    return;
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash('adminpassword123', salt);

  const admin = userRepository.create({
    name: 'System Admin',
    email: adminEmail,
    passwordHash,
    role: UserRole.ADMIN,
    verificationStatus: VerificationStatus.VERIFIED,
    onboardingComplete: true,
  });

  await userRepository.save(admin);
  console.log('Admin user created successfully!');

  await app.close();
}

bootstrap();
