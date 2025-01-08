# LeelE Coder

## Cloning & running

1. Copy .env.example to .env and add your env variables
2. Run `npm install` and `npm run dev` to install dependencies and run locally

## Migration

```
npx prisma migrate dev --name init
```

Notice: You should create postgres database before running the migration.
the user should have the permission to create database. use:

```
ALTER ROLE your_role CREATEDB;
```
