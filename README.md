# 📦 Catálogo de Productos

Aplicación web para mostrar un catálogo de productos con imágenes y un panel de administración protegido mediante autenticación JWT.

---

## 🚀 Tecnologías utilizadas

### Frontend
- React 19
- Vite
- React Router
- Axios
- Bootstrap 5

### Backend
- Node.js
- Express.js

### Base de datos
- SQLite (better-sqlite3)

---

## ✨ Características

- Catálogo público de productos
- Visualización de imágenes
- Panel de administración
- Inicio de sesión mediante JWT
- Crear productos
- Editar productos
- Eliminar productos
- Subida de imágenes
- Base de datos SQLite creada automáticamente

---

## 📋 Requisitos

- Node.js 18 o superior

---

## ⚙️ Instalación

### Clonar el repositorio

```bash
git clone https://github.com/USUARIO/catalogo.git

cd catalogo
```

### Instalar dependencias

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd ../frontend
npm install
```

---

## 🔧 Configuración

Editar el archivo:

```
backend/.env
```

| Variable | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| PORT | 5000 | Puerto del servidor |
| JWT_SECRET | catalogo_jwt_secret_key_2024 | Clave para firmar JWT |
| ADMIN_USER | admin | Usuario administrador |
| ADMIN_PASS | admin123 | Contraseña del administrador |

---

## ▶️ Ejecutar el proyecto

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run dev
```

La base de datos SQLite se crea automáticamente al iniciar el backend.

---

## 🌐 Acceso

| Aplicación | URL |
|------------|-----|
| Catálogo | http://localhost:3000 |
| Administración | http://localhost:3000/admin/login |

### Credenciales por defecto

```
Usuario: admin
Contraseña: admin123
```

---

## 📡 API

### Endpoints públicos

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | /api/productos | Lista de productos |
| GET | /api/productos/:id | Obtener un producto |

### Endpoints protegidos

Requieren autenticación JWT.

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| POST | /api/login | Iniciar sesión |
| POST | /api/productos | Crear producto |
| PUT | /api/productos/:id | Editar producto |
| DELETE | /api/productos/:id | Eliminar producto |
| POST | /api/upload | Subir imagen |

---

## 📁 Estructura del proyecto

```
catalogo/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── routes/
│   ├── uploads/
│   ├── app.js
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       └── services/
│
└── README.md
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.