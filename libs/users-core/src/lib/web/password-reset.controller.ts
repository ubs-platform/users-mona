import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { PasswordResetService } from '../services/password-reset.service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(public passwordResetService: PasswordResetService) {}

  @Post()
  async initPwReset(
    @Body() { username }: { username: string },
    @Headers() headers: any
  ) {
    await this.passwordResetService.insertNewRequest(
      username,
      headers?.['origin']
    );
  }

  @Post(':id')
  async pwResetResolve(
    @Param() { id }: { id: any },
    @Body() { newPassword }: { newPassword: string }
  ) {
    console.info(id);
    await this.passwordResetService.approve(id, newPassword);
  }

  @Get(':id')
  async hasPasswrodResetRequest(@Param() { id }: { id: any }) {
    return await this.passwordResetService.has(id);
  }
}
