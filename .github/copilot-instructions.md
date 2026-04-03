# Los Corrales ERP Backend - AI Coding Guidelines

## Architecture Overview
This is a Node.js Express backend for an ERP system managing inventory, products, warehouses, stock movements, and users. The application uses PostgreSQL as the database.

### Key Components
- **Server**: `src/server.js` - Express app setup with CORS and JSON middleware
- **Database**: `src/config/database.js` - PostgreSQL connection pool
- **Models**: `src/models/` - Data models (currently empty, intended for database schemas)
- **Controllers**: `src/controllers/` - Request handlers (empty, to contain business logic)
- **Routes**: `src/routes/` - API route definitions (empty, to define endpoints)
- **Services**: `src/services/` - Business logic layer (empty, for complex operations like reports and XML import)
- **Middlewares**: `src/middlewares/` - Auth and role-based access (empty)

### Data Flow
Requests flow: Routes → Controllers → Services → Models → Database

### Database Integration
Uses `pg` library with connection pooling. Query via `pool.query(text, params)` exported from `database.js`.

## Developer Workflows
- **Start Server**: `node src/server.js` (note: package.json main is 'index.js', but entry is server.js)
- **Development**: Use `nodemon` for auto-restart (no script defined yet)
- **Environment**: Configure via `.env` file (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, PORT)

## Conventions
- **Module System**: CommonJS (`require`/`module.exports`)
- **Language**: JavaScript with Portuguese comments
- **Structure**: Separation of concerns with dedicated folders for each layer
- **Database**: Raw SQL queries (no ORM yet, models are placeholders)

## Dependencies
- `express`: Web framework
- `pg`: PostgreSQL client
- `cors`: Cross-origin requests
- `dotenv`: Environment variables
- `nodemon`: Development tool

## Key Patterns
- Database connection tested on startup in `database.js`
- Health check endpoint at `/` returns JSON status
- Middlewares applied globally for CORS and JSON parsing

## Integration Points
- PostgreSQL database for data persistence
- Front-end communication via CORS-enabled API
- Potential XML import functionality (service placeholder exists)

## Notes
Most files are currently empty placeholders. Implement models as SQL schema definitions or query functions. Controllers should handle HTTP requests and delegate to services. Routes define API paths and link to controllers.