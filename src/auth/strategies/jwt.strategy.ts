import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {



   /**
     * @author R.M
     * @version 1.0
     * 
     * @constructor
     * 
     * @param {Repository<User>} userRepository - Repositorio de TypeORM para la entidad `User`.
     * 
     * @description
     * Este constructor inicializa un guardián JWT en NestJS, configurando la estrategia de autenticación para extraer el token JWT desde el encabezado de autorización de las solicitudes HTTP.
     * 
     * ### Configuración
     * - **`jwtFromRequest`**: Utiliza el método `ExtractJwt.fromAuthHeaderAsBearerToken()` para obtener el token JWT del encabezado de autorización.
     * - **`secretOrKey`**: Configura la clave secreta para verificar la firma del JWT, obtenida de las variables de entorno (`JWT_SECRET`).
     * 
     * ### Dependencias
     * - La clase depende del repositorio de usuarios (`userRepository`) para realizar operaciones de base de datos relacionadas con la entidad `User`.
     * 
     * @throws {Error} Si no se puede inyectar el repositorio o configurar la estrategia JWT correctamente.
     */

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        });
    }




 /**
   * @author R.M
   * @version 1.0
   * 
   * @param {JwtPayload} payload - Carga útil del token JWT, que incluye información como el `id` del usuario.
   * 
   * @description
   * Este método valida el token JWT verificando la existencia y el estado del usuario asociado en la base de datos.
   * 
   * ### Pasos de Validación
   * 
   * 1. **Extraer el ID del Usuario**:
   *    - Obtiene el `id` del usuario desde la carga útil (`payload`) del JWT.
   * 
   * 2. **Buscar Usuario en la Base de Datos**:
   *    - Utiliza el repositorio de usuarios (`userRepository`) para buscar al usuario asociado al `id`.
   *    - Si no se encuentra al usuario, lanza una excepción `UnauthorizedException` con un mensaje específico.
   * 
   * 3. **Verificar Estado del Usuario**:
   *    - Comprueba si el usuario está activo (`isActive`).
   *    - Si no está activo, lanza una excepción `UnauthorizedException` con un mensaje específico.
   * 
   * 4. **Retornar el Usuario**:
   *    - Si todas las validaciones son exitosas, retorna la entidad del usuario.
   * 
   * @returns {Promise<User>} - El usuario validado.
   * 
   * @throws {UnauthorizedException} Si no se encuentra al usuario o si el usuario no está activo.
   * 
   * @example
   * ```typescript
   * const user = await validate(payload);
   * console.log(user); // Retorna la entidad del usuario validado
   * ```
   */
  
 async validate(payload: JwtPayload): Promise<User> {

    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    
    if(!user) 
        throw new UnauthorizedException(`User with id ${id} not found`);
    
    if(!user.isActive) 
        throw new UnauthorizedException(`User with id ${id} is not active`);
    
    return user;

 }

}