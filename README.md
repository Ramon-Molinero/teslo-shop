<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo Shop API 🚀

API RESTful diseñada para manejar productos, usuarios y pedidos en la plataforma Teslo. Construida con **NestJS**, **PostgreSQL** y **TypeORM**, ofrece endpoints seguros para operaciones CRUD, autenticación y comunicación en tiempo real.

---

## **Características principales** 🌟

- 🔐 **Autenticación y autorización**: Uso de **JWT** para asegurar endpoints, roles específicos para diferentes niveles de acceso y encriptación de contraseñas mediante **bcrypt**.
- 📦 **Gestión de productos**: Crear, listar, actualizar y eliminar productos con control de inventario.
- 👥 **Gestión de usuarios**: Registro, login y protección de rutas privadas mediante decoradores personalizados.
- 🌱 **Inicialización de datos (Seed)**: Generación automática de datos iniciales para pruebas y desarrollo.
- 📡 **WebSockets**: Comunicación en tiempo real mediante **Socket.IO** para notificaciones y chat.
- 📁 **Carga de archivos**: Subida y gestión de archivos de producto.
- 🛠️ **Despliegue y documentación automática**: Desplegada en **Render** con documentación Swagger disponible en:
  ```
  https://teslo-shop-nest-iv2l.onrender.com/api
  ```

---

## **Requisitos previos** 📋

- **Node.js** y **npm** instalados.
- **Nest CLI** instalado:
  ```bash
  npm i -g @nestjs/cli
  ```
- **Docker** para manejar la base de datos PostgreSQL.

---

## **Pasos de instalación** ⚙️

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ramon-molinero/teslo-shop.git
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Clonar el archivo de ejemplo `.env.template` y renombrarlo a `.env`, ajustando los valores necesarios:
   ```bash
   cp .env.template .env
   ```

4. Levantar la base de datos con Docker:
   ```bash
   docker-compose up -d
   ```
   Esto creará un contenedor PostgreSQL accesible en `localhost:5432`.

5. Ejecutar en desarrollo:
   ```bash
   npm run start:dev
   ```

6. Reconstruir la base de datos (opcional):
   Visita la siguiente URL para ejecutar las semillas de datos:
   ```
   http://localhost:3000/api/seed
   ```

---

## **Comandos útiles** 💻

- **Levantar el servidor en producción:**
  - Crear el archivo `.env.prod` con las variables de entorno de producción.
  - Construir la imagen Docker:
    ```bash
    docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
    ```
  - Para levantar el contenedor sin construir nuevamente:
    ```bash
    docker-compose -f docker-compose.prod.yaml --env-file .env.prod up -d
    ```

---

## **Stack de tecnologías** 🛠️

- **NestJS**: Framework backend modular y robusto.
- **PostgreSQL**: Base de datos relacional.
- **TypeORM**: ORM para modelar y gestionar datos.
- **Docker**: Contenedorización de servicios.
- **Socket.IO**: Comunicación en tiempo real.
- **JWT y bcrypt**: Seguridad y gestión de contraseñas.
- **Swagger**: Documentación de API.

---

## **Endpoints principales** 🔍

- **Auth**:
  - `POST /auth/register`: Registro de usuarios.
  - `POST /auth/login`: Inicio de sesión.
  - `GET /auth/private`: Rutas protegidas.

- **Productos**:
  - `GET /products`: Listar productos.
  - `POST /products`: Crear nuevo producto.
  - `PATCH /products/:id`: Actualizar producto.
  - `DELETE /products/:id`: Eliminar producto.

- **Archivos**:
  - `POST /files/product`: Subir archivos.
  - `GET /files/product/:imageName`: Obtener archivos subidos.

---

## **Notas** 📚

El proyecto está desplegado en **Render** y puede ser accesible en:
```bash
https://teslo-shop-nest-iv2l.onrender.com/api
```
