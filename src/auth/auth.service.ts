import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces';



@Injectable()
export class AuthService {
  

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}



  /**
    * @author R.M
    * @version 1.0
    *
    * @param {CreateUserDto} createUserDto - DTO que contiene los datos necesarios para crear un nuevo usuario.
    *
    * @description
    * Este método gestiona la creación de un nuevo usuario en la base de datos, incluyendo el cifrado de la contraseña 
    * y la generación de un token JWT al completar el proceso.
    *
    * ### Pasos de Ejecución
    *
    * 1. **Desestructuración de Datos**:
    *    - Extrae la contraseña del DTO para su cifrado, dejando el resto de los datos como `userData`.
    *
    * 2. **Cifrado de Contraseña**:
    *    - Cifra la contraseña utilizando `bcrypt.hashSync` antes de almacenar al usuario en la base de datos.
    *
    * 3. **Crear Usuario**:
    *    - Utiliza el repositorio para crear una instancia del usuario con los datos proporcionados.
    *
    * 4. **Guardar en Base de Datos**:
    *    - Guarda el usuario utilizando el método `save` del repositorio.
    *    - Elimina la contraseña del objeto retornado para evitar exponerla.
    *
    * 5. **Generar Token JWT**:
    *    - Crea un token JWT utilizando el método `_getJwtToken`, basado en el identificador único del usuario (`id`).
    *
    * 6. **Manejo de Errores**:
    *    - Si ocurre un error durante la creación del usuario, este es capturado y gestionado por el método `_handleError`.
    *
    * @returns {Promise<Object>} - Un objeto que contiene los datos del usuario creado, excluyendo la contraseña, y el token JWT.
    *
    * @throws {BadRequestException} Si hay errores de validación o datos duplicados.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante el proceso.
    *
    * @example
    * ```typescript
    * const user = await this.authService.create({
    *   email: 'test@example.com',
    *   password: '123456',
    *   fullName: 'Test User'
    * });
    * ```
    */
   
  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this._getJwtToken({ id: user.id })
      };

    } catch (error) {
      this._handleError(error);
      
    }
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @param {User} user - Usuario autenticado, proporcionado por el guard en la solicitud.
    *
    * @description
    * Este método verifica el estado de autenticación de un usuario y genera un nuevo token JWT para su sesión activa.
    *
    * ### Pasos de Ejecución
    *
    * 1. **Generar Token JWT**:
    *    - Utiliza el método `_getJwtToken` para generar un nuevo token JWT basado en el identificador único del usuario (`id`).
    *
    * 2. **Retornar Datos del Usuario**:
    *    - Devuelve un objeto que incluye toda la información del usuario y el nuevo token JWT.
    *
    * ### Uso
    * Este método se utiliza para validar el estado actual de la autenticación y extender o renovar la sesión activa.
    *
    * @returns {Promise<Object>} - Un objeto que contiene los datos del usuario autenticado y un nuevo token JWT.
    *
    * @example
    * ```typescript
    * const authStatus = await this.authService.checkAuthStatus(authenticatedUser);
    * console.log(authStatus);
    * ```
    */
   
  async checkAuthStatus(user: User) {
    
    return {
      ...user,
      token: this._getJwtToken({ id: user.id })
    }
    
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @param {LoginUserDto} loginUserDto - DTO que contiene las credenciales del usuario (`email` y `password`).
    *
    * @description
    * Este método gestiona el proceso de inicio de sesión de un usuario. Verifica las credenciales proporcionadas y genera un token JWT para la sesión activa.
    *
    * ### Pasos de Ejecución
    *
    * 1. **Buscar Usuario por Email**:
    *    - Busca en la base de datos un usuario cuyo `email` coincida con el proporcionado en `loginUserDto`.
    *    - Selecciona los campos `email`, `password` e `id` para validar las credenciales.
    *    - Si no se encuentra un usuario, lanza una excepción `UnauthorizedException`.
    *
    * 2. **Validar Contraseña**:
    *    - Compara la contraseña proporcionada en `loginUserDto` con la almacenada en la base de datos utilizando `bcrypt.compare`.
    *    - Si la contraseña no es válida, lanza una excepción `BadRequestException`.
    *
    * 3. **Eliminar Contraseña del Usuario**:
    *    - Elimina el campo `password` del objeto del usuario para garantizar que no se incluya en la respuesta.
    *
    * 4. **Generar Token JWT**:
    *    - Utiliza el método `_getJwtToken` para generar un token JWT basado en el identificador único del usuario (`id`).
    *
    * 5. **Retornar Usuario y Token**:
    *    - Devuelve un objeto que incluye los datos del usuario (`email` e `id`) y el token JWT generado.
    *
    * @returns {Promise<Object>} - Un objeto que contiene los datos del usuario autenticado y el token JWT.
    *
    * @throws {UnauthorizedException} Si el `email` no corresponde a ningún usuario.
    * @throws {BadRequestException} Si la contraseña proporcionada no coincide.
    *
    * @example
    * ```typescript
    * const userSession = await this.authService.login({ email: 'user@example.com', password: 'securepassword' });
    * console.log(userSession);
    * ```
    */
   
  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['email', 'password', 'id']
     });
    
     if(!user) throw new UnauthorizedException('Invalid credentials email');
    
     const isPasswordValid = await bcrypt.compare(password, user.password);
    
     if(!isPasswordValid) throw new BadRequestException('Invalid credentials password');
    
     delete user.password;
    
     return {
      ...user,
      token: this._getJwtToken({ id: user.id })
    };
      
  }



  /**
    * @author R.M
    * @version 1.0
    *
    * @private
    * 
    * @param {JwtPayload} payload - Objeto que contiene la información que será incluida en el token JWT. 
    * Normalmente incluye información como el `id` del usuario.
    *
    * @description
    * Este método privado genera un token JWT (JSON Web Token) utilizando la biblioteca de JWT proporcionada por NestJS. 
    * El token incluye el payload proporcionado, que puede ser utilizado para identificar y autenticar al usuario en futuras solicitudes.
    *
    * ### Pasos de Ejecución
    *
    * 1. **Firmar el Token**:
    *    - Utiliza el servicio `JwtService` de NestJS para firmar el payload y generar el token JWT.
    *
    * 2. **Retornar el Token**:
    *    - Devuelve el token firmado como un string, listo para ser utilizado en las respuestas o encabezados de autorización.
    *
    * @returns {string} - El token JWT generado basado en el payload proporcionado.
    *
    * @example
    * ```typescript
    * const token = this._getJwtToken({ id: '12345' });
    * console.log(token); // Token JWT generado
    * ```
    */
   
  private _getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }



  /**
    * @author R.M
    * @version 1.0
    * 
    * @private
    * 
    * @param {any} error - Objeto que representa el error capturado durante una operación en la aplicación.
    * 
    * @description
    * Este método privado maneja los errores capturados en las operaciones del servidor o la base de datos. 
    * Analiza las propiedades del objeto de error y lanza excepciones específicas basadas en su contenido.
    * 
    * ### Pasos de Ejecución
    * 
    * 1. **Registrar el Error**:
    *    - Utiliza `console.log` para registrar el error en los logs de la aplicación.
    * 
    * 2. **Errores de Clave Duplicada (`23505`)**:
    *    - Si el error contiene el código `23505` (indica un intento de insertar datos que violan una restricción de unicidad en la base de datos, como un email duplicado), 
    *      lanza una excepción `BadRequestException` con un mensaje específico.
    * 
    * 3. **Errores de Autenticación y Solicitud Inválida (`401` o `400`)**:
    *    - Si el error tiene un código de estado `401` (no autorizado) o `400` (solicitud inválida), lanza una excepción `UnauthorizedException` con el mensaje del error.
    * 
    * 4. **Errores Inesperados**:
    *    - Si el error no coincide con los casos anteriores, lanza una excepción `InternalServerErrorException` con un mensaje genérico y registra el error en los logs.
    * 
    * @throws {BadRequestException} Si ocurre un error de clave duplicada (código `23505`).
    * @throws {UnauthorizedException} Si el error tiene un código de estado `401` o `400`.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado.
    * 
    * @example
    * ```typescript
    * try {
    *   // Operación que puede fallar
    * } catch (error) {
    *   this._handleError(error);
    * }
    * ```
    */
   
  private _handleError(error: any): never {
    console.log(error);

    if(error.code === '23505') throw new BadRequestException('Email already exists');

    if(error.response.statusCode === 401 || error.response.statusCode === 400) 
      throw new UnauthorizedException(error.response.message);

    throw new InternalServerErrorException('Something went wrong, check logs');
  }
 
}
