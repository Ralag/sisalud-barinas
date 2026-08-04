<p align="center">
  <img src="public/img/logo.svg" alt="SISALUD" width="120" />
</p>

<h1 align="center">SISALUD — Sistema Informático de Salud</h1>

<p align="center">
  <strong>Base de Datos Médicas — Estado Barinas, Venezuela</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Pages_Router-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Hosting-000?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/Licencia-MIT-blue" alt="Licencia" />
  <img src="https://img.shields.io/badge/Estado-Desarrollo-orange" alt="Estado" />
</p>

---

## 📋 Descripción

**SISALUD** es un sistema de gestión de historias clínicas electrónicas diseñado para el sistema público de salud venezolano. Permite acceder a la información médica de cualquier paciente mediante su **cédula de identidad**, desde cualquier dispositivo con navegador web.

### 🎯 Piloto: ASIC Guanapa, Estado Barinas
- **18 consultorios populares** + **1 CDI** (Centro de Diagnóstico Integral)
- Diseñado **mobile-first** para uso desde teléfonos
- Arquitectura preparada para escalamiento a nivel nacional

---

## ✨ Características Principales

| Característica | Descripción |
|:---|:---|
| 🔍 **Búsqueda por Cédula** | Acceso instantáneo a la historia clínica con V12345678 o E87654321 |
| 👶 **Gestión de Menores** | ID temporal asociado al representante (V20111222-01) con migración posterior |
| 🔒 **Registros Inmutables** | Las consultas médicas no pueden ser editadas ni eliminadas (3 capas de protección) |
| 📱 **Mobile-First** | Diseñado primero para teléfonos, funciona en cualquier pantalla |
| 🏥 **Multi-Centro** | Cada registro lleva el sello del centro de salud emisor |
| 📊 **Trazabilidad** | Auditoría completa: quién, cuándo, dónde, qué acción |
| 🌐 **Compatible** | Funciona en Chrome 49+, Firefox 52+ (incluyendo Windows XP) |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────┐
│     Navegador / Teléfono    │
│     (Chrome, Firefox, etc)  │
└──────────┬──────────────────┘
           │ HTTPS
┌──────────▼──────────────────┐
│         Vercel              │
│   Next.js Pages Router      │
│   SSR + API Routes          │
└──────────┬──────────────────┘
           │ @supabase/ssr
┌──────────▼──────────────────┐
│        Supabase             │
│   PostgreSQL + Auth + RLS   │
│   Backups Automáticos       │
└─────────────────────────────┘
```

---

## 🚀 Inicio Rápido

### Requisitos
- [Node.js](https://nodejs.org/) 18+ LTS
- Cuenta en [Supabase](https://supabase.com) (tier gratis)
- Cuenta en [Vercel](https://vercel.com) (tier gratis, para deploy)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sisalud.git
cd sisalud

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Configurar la base de datos
# En el Dashboard de Supabase → SQL Editor:
# Ejecutar en orden:
#   supabase/migrations/001_schema.sql
#   supabase/migrations/002_rls_policies.sql
#   supabase/migrations/003_immutability.sql
#   supabase/migrations/004_seed_centers.sql

# 5. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`


## 📁 Estructura del Proyecto

```
src/
├── pages/              # Páginas y API routes (Next.js Pages Router)
│   ├── api/            # Endpoints REST
│   ├── pacientes/      # Páginas de gestión de pacientes
│   └── consultas/      # Páginas de consultas médicas
├── components/         # Componentes React reutilizables
├── lib/
│   ├── supabase/       # Clientes Supabase (server + browser)
│   ├── services/       # Lógica de negocio
│   └── utils/          # Utilidades y helpers
└── styles/             # CSS vanilla (mobile-first)

supabase/
└── migrations/         # Esquema SQL, RLS, triggers, seeds
```

---

## 🔐 Seguridad

- **Autenticación** con Supabase Auth (sesiones seguras)
- **Row Level Security (RLS)** en todas las tablas
- **Roles**: Admin, Médico, Enfermero, Recepción
- **Inmutabilidad** de registros médicos (RLS + REVOKE + Trigger)
- **Auditoría** de cada acción del sistema
- **Sanitización** estricta de cédula antes de persistir

---

## 🗺️ Roadmap

- [x] Fase 1: Sistema base (búsqueda, registro, consultas)
- [ ] Fase 2: Modo offline + sincronización
- [ ] Fase 3: Reportes epidemiológicos
- [ ] Fase 4: Expansión multi-estado
- [ ] Fase 5: Integración HL7 FHIR
- [ ] Fase 6: App móvil nativa

---

## 🤝 Contribuir

Este proyecto es de código abierto y busca mejorar el sistema público de salud venezolano. Las contribuciones son bienvenidas.

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Desarrollado con ❤️ para el sistema público de salud de Venezuela
</p>
