import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // Load environment variables globally
        ConfigModule.forRoot({ isGlobal: true }),

        // Users module dependency
        UsersModule,

        // Passport authentication
        PassportModule,

        // JWT configuration asynchronously using ConfigService
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' }, // Token expiry
            }),
        }),
    ],
    // Services and strategies provided by this module
    providers: [AuthService, JwtStrategy],

    // Controller for auth endpoints
    controllers: [AuthController],

    // Export AuthService for use in other modules
    exports: [AuthService],
})
export class AuthModule {}
