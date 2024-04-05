import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { SECRET_JWT } from "./utils/jwt-consts";

// @Module({
//   controllers: [],
//   providers: [],
//   exports: [],
//   imports: [

//   ],
// })
// export class BackendJwtUtilsExportModule {}

export const BackendJwtUtilsExportModule = [
  PassportModule.register({ defaultStrategy: "jwt" }),
  JwtModule.register({
    secret: SECRET_JWT,
    signOptions: { expiresIn: "30d" },
  }),
];
