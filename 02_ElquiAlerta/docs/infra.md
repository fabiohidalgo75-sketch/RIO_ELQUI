# Infraestructura local — ElquiAlerta

Todos los servicios de soporte corren con Docker Compose desde la raíz del proyecto.

---

## Requisitos

- Docker Desktop o Docker Engine con el plugin Compose v2
- El archivo `.env` en la raíz con las variables de entorno (ver `.env.example`)

---

## Levantar servicios

```bash
docker compose up -d
```

Levanta en orden:

1. **postgres** — espera a estar healthy
2. **redis** — espera a estar healthy
3. **minio** — espera a estar healthy
4. **minio-init** — crea el bucket `elquialerta` si no existe, luego termina

La primera vez descarga las imágenes; las siguientes arranca en segundos.

---

## Verificar estado

```bash
docker compose ps
```

Los tres servicios permanentes deben mostrar `Up (healthy)`:

```
NAME                STATUS
elquialerta_postgres   Up (healthy)
elquialerta_redis      Up (healthy)
elquialerta_minio      Up (healthy)
```

`elquialerta_minio_init` aparece como `Exited (0)` — eso es correcto, es un job de un solo uso.

---

## Levantar la API

Desde la raíz del proyecto:

```bash
pnpm --filter api dev
```

La API queda disponible en:

| Recurso | URL |
|---|---|
| API REST | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/api/docs` |

---

## Bajar servicios

```bash
# Solo detiene los contenedores (conserva los volúmenes y datos)
docker compose down

# Detiene y borra también los datos (postgres, redis, minio)
docker compose down -v
```

> Usar `-v` solo si se quiere un entorno completamente limpio. Borra la base de datos, la caché y los archivos de MinIO.

---

## Puertos

| Servicio | Puerto local | Puerto interno |
|---|---|---|
| PostgreSQL | 5433 | 5432 |
| Redis | 6380 | 6379 |
| MinIO API (S3) | 9002 | 9000 |
| MinIO Console | 9003 | 9001 |
| NestJS API | 3000 | 3000 |

---

## Consola de MinIO

Abrir `http://localhost:9003` en el navegador.

- **Usuario:** `elquialerta_minio`
- **Contraseña:** `elquialerta_minio_secret`

---

## Flujo habitual de desarrollo

```bash
# 1. Levantar infra
docker compose up -d

# 2. Verificar que todo esté healthy
docker compose ps

# 3. Arrancar la API en modo watch
pnpm --filter api dev

# --- al terminar ---

# 4. Detener la API con Ctrl+C

# 5. Bajar la infra
docker compose down
```
