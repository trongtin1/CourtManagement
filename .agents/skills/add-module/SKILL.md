---
name: add-module
description: Guide for scaffolding backend clean architecture modules and React frontend components.
---

# Add Module

Use this skill when tasked with creating a new functional module (e.g., Facility, Area, Booking, Pricing) in the Court Management System.

Follow these 5 steps sequentially:

---

## Step 1: Define Domain Entity
- Create the core entity class in `CourtManagementBE.Domain/Entities/`.
- Ensure it defines audit fields (or inherits from a common base entity if available).
- Add navigation properties cleanly.

---

## Step 2: Establish Application layer
- **DTOs**: Create request/response DTOs in `CourtManagementBE.Application/DTOs/<ModuleName>/`.
- **Service Interface**: Define the service contract in `CourtManagementBE.Application/Interfaces/I<ModuleName>Service.cs` returning `Result<T>` or `Result<bool>`.
- **Service Implementation**: Implement in `CourtManagementBE.Application/Services/<ModuleName>Service.cs`.
- **Mapping**: Register AutoMapper profiles in `CourtManagementBE.Application/Mappings/`.
- Remember to prefix logs inside services in Vietnamese with `loggingHeader`.

---

## Step 3: Register Infrastructure & EF Core
- Update `AppDbContext.cs` to expose `DbSet<T>` for the new domain entity.
- Implement configuration mappings in `CourtManagementBE.Infrastructure/Configurations/` if custom SQL Server behaviors (e.g., grid indexing or pricing models) are required.
- Add repository interfaces and implementations.
- Register new repositories inside the **Unit of Work** (`UnitOfWork.cs`) so that operations bound to database contexts execute in transactions.
- Create migration script: `dotnet ef migrations add Add<ModuleName>Table` if database structural shifts occur.

---

## Step 4: Expose Controller Endpoint
- Add the C# Controller class in `CourtManagementBE.Api/Controllers/`.
- Ensure it inherits from `BaseApiController`.
- Annotate actions with standard route mappings and apply permission-based attributes (e.g., `[RequirePermission]`) or facility isolated scoping validation.

---

## Step 5: Frontend Feature Scaffolding
- Create the feature folder under `ClientApp/src/features/<moduleName>/`.
- Structure it with:
  - `api/<moduleName>Api.ts`: Axios client actions.
  - `hooks/use<ModuleName>Queries.ts`: Custom React Query queries and mutations.
  - `model/types.ts`: TypeScript interfaces mirroring Backend DTOs.
- Create UI pages in `ClientApp/src/pages/<moduleName>/` utilizing Ant Design v6 and Tailwind CSS v4.
- Register page routes in `AppRoutes.tsx` or router configuration.
