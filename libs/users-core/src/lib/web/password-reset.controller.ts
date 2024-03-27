import { Body, Controller, Param, Post } from '@nestjs/common';
import { PasswordResetService } from '../services/password-reset.service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(public passwordResetService: PasswordResetService) {}

  @Post()
  initPwReset(@Body() { username }: { username: string }) {
    this.passwordResetService.insertNewRequest(username);
  }

  @Post(':id')
  pwResetResolve(
    @Param() { id }: { id: any },
    @Body() { newPassword }: { newPassword: string }
  ) {
    this.passwordResetService.approve(id, newPassword);
  }
}
