import { Controller, Post, Body, Get, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUserDecorator } from './decorators/getUser.decorator';
import { User } from './entities/user.entity';
import { RawHeadersDecorator } from './decorators/rawHeaders.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  /**
    * @author R.M
    * @version 1.0
    *
    * @description
    * Este controlador maneja una ruta privada protegida por autenticación. 
    * Utiliza un guardia (`AuthGuard`) para validar que el usuario esté autenticado antes de acceder a la ruta.
    *
    * 
    * 1. **Validación de Acceso**:
    *    - El guardia `AuthGuard` asegura que solo usuarios autenticados puedan acceder a la ruta.
    *
    * 2. **Inyección de Parámetros**:
    *    - **Headers**: Los encabezados HTTP completos de la solicitud se obtienen utilizando el decorador `@Headers()`.
    *    - **User**: El usuario autenticado se inyecta mediante el decorador personalizado `@GetUserDecorator`.
    *    - **User Email**: El correo electrónico del usuario autenticado se extrae usando `@GetUserDecorator('email')`.
    *    - **Raw Headers**: Los encabezados sin procesar se inyectan con el decorador personalizado `@RawHeadersDecorator`.
    *
    * 3. **Respuesta**:
    *    - Devuelve un objeto que incluye:
    *      - `ok`: Indica que la operación fue exitosa.
    *      - `message`: Mensaje de confirmación.
    *      - `user`: Detalles del usuario autenticado.
    *      - `userEmail`: Correo electrónico del usuario autenticado.
    *      - `rawHeaders`: Encabezados sin procesar de la solicitud.
    *      - `headers`: Encabezados HTTP completos de la solicitud.
    *
    * 
    * @param {IncomingHttpHeaders} headers - Encabezados HTTP completos de la solicitud.
    * @param {User} user - Detalles del usuario autenticado.
    * @param {string} userEmail - Correo electrónico del usuario autenticado.
    * @param {string[]} rawHeaders - Encabezados sin procesar de la solicitud.
    *
    * @returns {Object} - Un objeto que contiene detalles del usuario y los encabezados de la solicitud.
    *
    * @throws {UnauthorizedException} Si el usuario no está autenticado (gestionado por `AuthGuard`).
    *
    * @example
    * ```typescript
    * @Get('private')
    * @UseGuards(AuthGuard())
    * testingPrivateRoute(
    *   @Headers() headers: IncomingHttpHeaders,
    *   @GetUserDecorator() user: User,
    *   @GetUserDecorator('email') userEmail: string,
    *   @RawHeadersDecorator() rawHeaders: string[]
    * ) {
    *   return {
    *     ok: true,
    *     message: 'This is a private route',
    *     user,
    *     userEmail,
    *     rawHeaders,
    *     headers
    *   };
    * }
    * ```
    */

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() req: Express.Request,
    @Headers() headers: IncomingHttpHeaders,

    @GetUserDecorator() user: User,
    @GetUserDecorator('email') userEmail: string,
    @RawHeadersDecorator() rawHeaders: string[]
  ){
    
    return {
      ok: true,
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @description
    * Este controlador maneja una ruta privada que está protegida por roles específicos. 
    * Utiliza decoradores y guardias personalizados para validar la autenticación del usuario 
    * y verificar que posea los roles requeridos.
    *
    * 
    * 1. **Protección por Roles**:
    *    - Utiliza el decorador `@RoleProtected` para especificar los roles permitidos para acceder a esta ruta (`admin` y `superUser`).
    *
    * 2. **Validación de Acceso**:
    *    - El guardia `AuthGuard` verifica que el usuario esté autenticado.
    *    - El guardia `UserRoleGuard` valida que el usuario posea uno de los roles requeridos.
    *
    * 3. **Inyección de Parámetros**:
    *    - **User**: El usuario autenticado se inyecta mediante el decorador personalizado `@GetUserDecorator`.
    *
    * 4. **Respuesta**:
    *    - Devuelve un objeto con los siguientes detalles:
    *      - `ok`: Indica que la operación fue exitosa.
    *      - `message`: Mensaje de confirmación.
    *      - `user`: Detalles del usuario autenticado.
    *
    * 
    * @param {User} user - Detalles del usuario autenticado, inyectado automáticamente.
    *
    * @returns {Object} - Un objeto que contiene detalles del usuario autenticado y un mensaje de confirmación.
    *
    * @throws {UnauthorizedException} Si el usuario no está autenticado (gestionado por `AuthGuard`).
    * @throws {ForbiddenException} Si el usuario no posee los roles requeridos (gestionado por `UserRoleGuard`).
    *
    * @example
    * ```typescript
    * @Get('private2')
    * @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    * @UseGuards(AuthGuard(), UserRoleGuard)
    * privateRoute2(
    *   @GetUserDecorator() user: User
    * ) {
    *   return {
    *     ok: true,
    *     message: 'This is a private route',
    *     user
    *   };
    * }
    * ```
    */
   
  @Get('private2')
  @RoleProtected( ValidRoles.admin, ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUserDecorator() user: User
  ){
    return {
      ok: true,
      message: 'This is a private route',
      user
    }
  }



  /**
    * @author R.M
    * @version 1.0
    *
    * @description
    * Este controlador maneja una ruta privada protegida utilizando el decorador `@Auth` para validar 
    * la autenticación del usuario y restringir el acceso a usuarios con el rol `admin`.
    *
    * 1. **Protección de la Ruta**:
    *    - Utiliza el decorador `@Auth` para combinar la funcionalidad del decorador `@RoleProtected` 
    *      y los guardias `AuthGuard` y `UserRoleGuard`.
    *    - Restringe el acceso únicamente a usuarios autenticados con el rol `admin`.
    *
    * 2. **Inyección de Parámetros**:
    *    - **User**: Detalles del usuario autenticado, obtenidos mediante el decorador personalizado `@GetUserDecorator`.
    *
    * 3. **Respuesta**:
    *    - Devuelve un objeto con los siguientes detalles:
    *      - `ok`: Indica que la operación fue exitosa.
    *      - `message`: Mensaje de confirmación.
    *      - `user`: Detalles del usuario autenticado.
    *
    *
    * @param {User} user - Detalles del usuario autenticado, inyectado automáticamente.
    *
    * @returns {Object} - Un objeto que contiene detalles del usuario autenticado y un mensaje de confirmación.
    *
    * @throws {UnauthorizedException} Si el usuario no está autenticado (gestionado por `AuthGuard`).
    * @throws {ForbiddenException} Si el usuario no posee el rol `admin` (gestionado por `UserRoleGuard`).
    *
    * @example
    * ```typescript
    * @Get('private3')
    * @Auth(ValidRoles.admin)
    * privateRoute3(
    *   @GetUserDecorator() user: User
    * ) {
    *   return {
    *     ok: true,
    *     message: 'This is a private route',
    *     user
    *   };
    * }
    * ```
    */
   
  @Get('private3')
  @Auth( ValidRoles.admin )
  privateRoute3(
    @GetUserDecorator() user: User
  ){
    return {
      ok: true,
      message: 'This is a private route',
      user
    }
  }



  /**
    * @author R.M
    * @version 1.0
    *
    * @description
    * Este controlador maneja la verificación del estado de autenticación del usuario. Utiliza el decorador `@Auth` 
    * para asegurar que el usuario esté autenticado antes de realizar la operación.
    *
    * 
    * 1. **Protección de la Ruta**:
    *    - Utiliza el decorador `@Auth` para aplicar los guardias necesarios (`AuthGuard`) y verificar la autenticación del usuario.
    *
    * 2. **Inyección de Parámetros**:
    *    - **User**: Detalles del usuario autenticado, obtenidos mediante el decorador personalizado `@GetUserDecorator`.
    *
    * 3. **Delegación al Servicio**:
    *    - Llama al método `checkAuthStatus` del servicio `authService`, pasándole los detalles del usuario autenticado.
    *
    * 4. **Respuesta**:
    *    - Devuelve el resultado de `authService.checkAuthStatus`, que contiene el estado de autenticación del usuario.
    *
    * 
    * @param {User} user - Detalles del usuario autenticado, inyectado automáticamente.
    *
    * @returns {Promise<Object>} - El estado de autenticación del usuario, procesado por `authService`.
    *
    * @throws {UnauthorizedException} Si el usuario no está autenticado (gestionado por `AuthGuard`).
    *
    * @example
    * ```typescript
    * @Get('check-auth-status')
    * @Auth()
    * checkAuthStatus(
    *   @GetUserDecorator() user: User
    * ) {
    *   return this.authService.checkAuthStatus(user);
    * }
    * ```
    */
   
  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUserDecorator() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

 
}


