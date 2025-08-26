// auth/bearer.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly validTokens: string[];

  constructor(private readonly config: ConfigService) {
    this.validTokens = this.config.get<string>('BEARER_TOKENS')?.split(',') ?? [];
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.split(' ')[1];
    if (!this.validTokens.includes(token)) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    return true;
  }
}
