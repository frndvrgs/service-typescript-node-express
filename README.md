# service-typescript-node-express

E-commerce API with shopping cart system built with Express.js, TypeScript, and PostgreSQL.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL database**
   ```bash
   # Create database and tables
   psql -U postgres -f database.sql
   
   # Run migrations
   psql -d "service-typescript-node-express" -f migration.sql
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the API**
   ```
   http://localhost:4000
   http://localhost:4000/api-docs (API Documentation)
   ```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter and type check
npm run lint:fix     # Fix linting issues
npm run format       # Format code
```

## API Endpoints

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID

### Cart Management
- `POST /carts` - Create new cart
- `GET /carts/:id` - Get cart details
- `GET /carts/:id/operations` - Get cart operations history

### Cart Items
- `POST /carts/:id/items` - Add product to cart
  ```json
  { "productId": "1", "quantity": 2 }
  ```
- `PATCH /carts/:cartId/items/:productId` - Update item quantity
  ```json
  { "quantity": 3 }
  ```
- `DELETE /carts/:cartId/items/:productId` - Remove item from cart

### Coupons
- `POST /carts/:id/coupons` - Apply coupon to cart
  ```json
  { "code": "WELCOME10" }
  ```

## Tech Stack

- **Runtime**: Node.js 24
- **Framework**: Express.js v5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **API Documentation**: Swagger/OpenAPI
- **Build**: tsup
- **Linting**: Biome + TypeScript
- **Logging**: Pino (development only)

## Architecture

```
src/
├── main.ts                 # Application entry point
├── routes.ts               # HTTP routes
├── settings.ts             # Settings
├── shared/
│   ├── database.ts         # Database client
│   ├── exceptions.ts       # Custom error classes
│   ├── logger.ts           # Logging tools
│   ├── openapi.ts          # Open API definitions
│   └── validation.ts       # Request validation middleware
└── modules/
    ├── product/
    │   ├── controller.ts   # Controller logic
    │   ├── models.ts       # Model definitions
    │   ├── repository.ts   # Database operations
    │   └── services.ts     # Business logic
    └── cart/
        ├── controller.ts
        ├── models.ts
        ├── repository.ts
        └── services.ts
```

### Custom Error Types
- **interface_error**: Invalid request format or validation errors (400)
- **application_error**: Business logic errors (422)
- **server_error**: Internal server errors (500)
