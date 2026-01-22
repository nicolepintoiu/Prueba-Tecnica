# Prueba-Tecnica

Este repositorio contiene:
- **REST API** (Node/TypeScript + Prisma + PostgreSQL)
- **Aplicación Web** (React + Vite)

Incluye además un **dump** de base de datos para que pueda revisar los datos.

---

## Requisitos

- **Node.js** (recomendado: 18+)
- **PostgreSQL** (recomendado: 16+)
- **npm** 

> Nota: Los comandos marcados como `bash` son comandos para ejecutar en la terminal.

---

## 1) Base de Datos (PostgreSQL) y REST Api

### 1.1 Restaurar la BD desde el dump (crea tabla + datos)

En la raíz del repo deberías tener un archivo como:
- `prueba_tecnica.sql` 

### A. Crea la base de datos vacía:
    ```bash
    createdb prueba_tecnica
    ```

### A.1. Restaurar el dump desde la raiz del repo:
        Poner: psql -h localhost -p 5432 -U prueba_user -d prueba_tecnica < prueba_tecnica.sql
        Si al restaurar el dump te pide password, usa: prueba123

### Opcional: Crear usuario prueba_user si no existe
        ```bash
        Entrar a PostgreSQL como admin:
            ejecuta: psql -U postgres
        ```
        Dentro de psql ejecuta: 
            CREATE USER prueba_user WITH PASSWORD 'prueba123';
            ALTER DATABASE prueba_tecnica OWNER TO prueba_user;
            GRANT ALL PRIVILEGES ON DATABASE prueba_tecnica TO prueba_user;

        Salir de psql: \q

### 1.2 Variables de entorno
        > Importante: El archivo `.env` NO está incluido en el repositorio (por seguridad).
        > Debes crearlo manualmente en `apps/app/.env`.
        
        Contenido del archivo: DATABASE_URL="postgresql://prueba_user:prueba123@localhost:5432/prueba_tecnica?schema=public"

### 1.3 Instalar dependencias (repo) 
        Desde la raiz del repo:
        npm install

### 1.4 Ejecutar REST Api

        > En desarrollo, la web usa un proxy de Vite (ver `apps/web/vite.config.ts`) para redirigir las llamadas `/api` hacia la REST API. Por eso, primero debes tener la API corriendo.
        
        cd apps/app
        npx prisma generate
        npm run dev

        > Importante: deja la API corriendo en esta terminal.  
        > Luego abre otra terminal para ejecutar la web.
---
        
## 2) Aplicación Web (React + Vite)

    > La web depende de la REST API. Asegúrate de tener primero la API corriendo.

    En otra terminal:
    ```bash
    cd apps/web
    npm run dev
    ```
    La web queda disponible en: http://localhost:5173

---

## 3) Dump incluido

    El archivo prueba_tecnica.sql permite restaurar la base de datos localmente (tablas y datos) para revisar la prueba

---

## 4) Posible problema

### Error: `Cannot find module 'dotenv/config'` al ejecutar `npx prisma generate`
    
    Si al correr:
    ```bash
    cd apps/app
    npx prisma generate

    Aparece un error como: 
        > Failed to load config file ... prisma.config.ts 
        > Cannot find module 'dotenv/config'

### Solucion:

### 1. Asegurate de instalar dependencias en la raiz del repo:
        
            npm install

### 2. Intenta de nuevo:
        
            cd apps/app
            npm install dotenv
            npx prisma generate

### 3. Si aún falla, instala dotenv específicamente en apps/app:
        
            cd apps/app
            npm install dotenv
            npx prisma generate
