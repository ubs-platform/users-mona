import { AuthGuard } from '@nestjs/passport';

export class JwtAuthLocalGuard extends AuthGuard('jwt') {}
