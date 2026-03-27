# Lease Module - Complete Implementation Guide

## Overview

The Lease module is a comprehensive rental management system designed for the Kenyan property management context. It provides full CRUD operations, business logic validation, and integration with Units and Payments modules.

---

## Backend Implementation

### 1. **Schema - `lease.schema.ts`**

**Database Structure:**
```
Lease {
  tenantId: string (System Organization ID)
  propertyTenantId: string (Rental Tenant ID)
  unitId: string (Direct Unit Reference)
  propertyId: string (Property Reference - for backward compatibility)
  leaseNumber: string (Auto-generated - LS-{timestamp})
  status: enum (draft|active|terminated|expired|renewed)
  startDate: Date
  endDate: Date
  rentAmount: number
  currency: string (default: KES)
  depositAmount: number
  depositPaid: boolean
  paymentFrequency: enum (monthly|quarterly|semi_annually|annually)
  paymentDueDay: number (1-31, default: 5)
  lateFeeAmount: number
  gracePeriodDays: number (default: 5)
  terms: string (optional lease terms)
  documents: string[] (document URLs)
  terminatedAt: Date
  terminationReason: string
  renewedFromLeaseId: string
  propertyName: string (denormalized for reporting)
  propertyTenantName: string (denormalized for reporting)
  isSigned: boolean
  signedAt: Date
  signedByPropertyTenantId: string
}
```

**Enums:**
- `LeaseStatus`: draft, active, expired, terminated, renewed
- `PaymentFrequency`: monthly, quarterly, semi_annually, annually
- `RentCycleLease`: daily, weekly, monthly (for future use)

**Indexes:**
- `{ tenantId: 1, status: 1 }` - Fast lease status queries
- `{ tenantId: 1, propertyTenantId: 1 }` - Get leases by tenant
- `{ tenantId: 1, unitId: 1 }` - Get leases by unit
- `{ tenantId: 1, propertyId: 1 }` - Get leases by property
- `{ startDate: 1, endDate: 1 }` - Range queries for reporting

---

### 2. **DTO - `lease.dto.ts`**

**CreateLeaseDto:**
```typescript
{
  propertyId: string (required),
  unitId: string (required),
  propertyTenantId: string (required),
  startDate: string (ISO date, required),
  endDate: string (ISO date, required),
  rentAmount: number (required),
  currency?: string (default: KES),
  depositAmount?: number,
  paymentFrequency?: PaymentFrequency (default: monthly),
  paymentDueDay?: number (1-31, default: 5),
  lateFeeAmount?: number,
  gracePeriodDays?: number (default: 5),
  terms?: string,
  documents?: string[],
  notes?: string,
  propertyName?: string,
  propertyTenantName?: string
}
```

**UpdateLeaseDto:**
Extends CreateLeaseDto with optional fields:
```typescript
{
  status?: LeaseStatus,
  depositPaid?: boolean,
  terminationReason?: string
}
```

---

### 3. **Service - `leases.service.ts`**

**Key Methods:**

#### Create Lease
```typescript
async create(dto: CreateLeaseDto, tenantId: string): Promise<Lease>
```
- Validates unit doesn't have active lease
- Auto-generates lease number
- Sets initial status to 'draft'
- Returns created lease

#### Activate Lease
```typescript
async activate(id: string, tenantId: string): Promise<Lease>
```
- Checks unit doesn't have another active lease
- Updates lease status to 'active'
- Calls `unitsService.assignTenant()` to mark unit as occupied
- Returns updated lease

#### Terminate Lease
```typescript
async terminate(id: string, tenantId: string, reason: string): Promise<Lease>
```
- Updates lease status to 'terminated'
- Records termination date and reason
- Calls `unitsService.releaseTenant()` to mark unit as vacant
- Returns updated lease

#### Get Expiring Soon
```typescript
async findExpiringSoon(tenantId: string, days: number = 30): Promise<Lease[]>
```
- Returns active leases expiring within specified days
- Used for renewal reminders and reporting

#### Get Statistics
```typescript
async getStats(tenantId: string): Promise<{
  total: number,
  active: number,
  expired: number,
  draft: number,
  expiringSoonCount: number
}>
```

---

### 4. **Repository - `lease.repository.ts`**

**Database Methods:**
- `findByUnit(tenantId, unitId)` - Get all leases for a unit
- `findActiveByUnit(unitId, tenantId)` - Get active lease for unit (business logic check)
- `findExpiringSoon(tenantId, daysAhead)` - Get leases expiring soon
- `countByStatus(tenantId, status)` - Count leases by status
- `countByTenant(tenantId)` - Total lease count

---

### 5. **Controller - `leases.controller.ts`**

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leases` | Create new lease |
| GET | `/leases` | Get all leases (paginated) |
| GET | `/leases/stats` | Get lease statistics |
| GET | `/leases/expiring-soon` | Get leases expiring soon |
| GET | `/leases/:id` | Get lease details |
| GET | `/leases/by-property/:propertyId` | Get leases by property |
| GET | `/leases/by-tenant/:propertyTenantId` | Get leases by tenant |
| GET | `/leases/by-unit/:unitId` | Get leases by unit |
| PUT | `/leases/:id` | Update lease |
| PUT | `/leases/:id/activate` | Activate lease |
| PUT | `/leases/:id/terminate` | Terminate lease |
| DELETE | `/leases/:id` | Delete lease |

---

## Frontend Implementation

### 1. **Service - `leases.service.ts`**

```typescript
getAll(page, limit, search?, status?): Observable<PaginatedResponse<Lease>>
getById(id): Observable<Lease>
getByProperty(propertyId): Observable<Lease[]>
getByTenant(propertyTenantId): Observable<Lease[]>
getExpiringSoon(days?): Observable<Lease[]>
create(data): Observable<Lease>
update(id, data): Observable<Lease>
activate(id): Observable<Lease>
terminate(id, reason): Observable<Lease>
delete(id): Observable<void>
getStats(): Observable<any>
```

---

### 2. **List Component - `leases-list`**

**Features:**
- Real-time search functionality
- Status filtering
- Pagination
- Add/Edit/Delete operations
- Responsive table design

**Table Columns (Responsive):**
- **Mobile**: Lease #, Status, Rent, Actions
- **Tablet**: + Tenant Name
- **Desktop**: + Unit ID, Period

**Responsive Design:**
- Fixed Add button on top-right
- Sticky headers on scroll
- Mobile-friendly action buttons
- Color-coded status badges

---

### 3. **Form Component - `lease-form`**

**Features:**
- Modal-based form (overlay)
- Auto-fill rent from unit selection
- Property and unit validation
- Payment terms configuration
- Notes field for additional information

**Form Fields:**
1. **Property Selection** - Dropdown of all properties
2. **Unit Selection** - Dropdown of vacant units only (auto-populated)
3. **Tenant Reference** - Tenant ID or reference field
4. **Date Range** - Start and end date pickers
5. **Financial Terms** - Rent, deposit, currency
6. **Payment Terms** - Frequency, due day, grace period, late fee
7. **Notes** - Additional lease notes

**Validations:**
- Property required
- Unit required (must be vacant)
- Tenant ID required
- Start date required
- End date required
- Dates must be valid range

**Auto-Fill Logic:**
- When unit is selected, auto-fills:
  - Rent amount from unit `rentAmount`
  - Deposit from unit `securityDeposit`
  - Currency from unit `currency`

---

### 4. **Detail Component - `lease-detail`**

**Features:**
- Full lease information display
- Payment history integration
- Activate/Terminate actions
- Status tracking
- Linked payments view

---

## Business Logic

### Lease Creation Flow

```
1. User selects Property
   ↓
2. System loads vacant units from selected property
   ↓
3. User selects Unit
   ↓
4. System auto-fills Rent & Deposit from Unit
   ↓
5. User enters Tenant ID and dates
   ↓
6. System validates no active lease exists for unit
   ↓
7. Lease created with status = 'draft'
   ↓
8. User can edit or activate
```

### Lease Activation Flow

```
1. User clicks "Activate" on draft lease
   ↓
2. System verifies unit doesn't have another active lease
   ↓
3. System updates lease status to 'active'
   ↓
4. System calls UnitsService.assignTenant()
   ↓
5. Unit status automatically changes to 'occupied'
   ↓
6. Lease is now active and payments can be recorded
```

### Lease Termination Flow

```
1. User clicks "Terminate" with reason
   ↓
2. System updates lease status to 'terminated'
   ↓
3. System records termination date and reason
   ↓
4. System calls UnitsService.releaseTenant()
   ↓
5. Unit status automatically changes to 'vacant'
   ↓
6. Unit is available for new lease
```

---

## Data Relationships

```
Tenant (Organization)
  ├── Many Leases
  │    ├── One Unit
  │    ├── One PropertyTenant (Occupant)
  │    └── Many Payments (future)
  │
  ├── Many Units
  │    └── Can have only ONE active Lease at a time
  │
  └── Many Properties
       └── Many Units
```

---

## Integration Points

### 1. **Units Module Integration**
```typescript
// When lease is activated:
await unitsService.assignTenant(unitId, tenantId, propertyTenantId, leaseId)
  - Sets unit.status = 'occupied'
  - Records tenant assignment

// When lease is terminated:
await unitsService.releaseTenant(unitId, tenantId)
  - Sets unit.status = 'vacant'
  - Clears tenant assignment
```

### 2. **Payments Module Integration** (Future)
```typescript
// Payment recording will reference:
- lease._id
- lease.rentAmount
- lease.propertyTenantId
- lease.paymentDueDay
```

### 3. **Reports Module Integration** (Future)
```typescript
- Lease statistics dashboard
- Occupancy reports
- Revenue tracking
- Expiring lease reminders
```

---

## API Response Examples

### Create Lease Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "tenantId": "system-tenant-1",
  "propertyTenantId": "tenant-john-doe",
  "unitId": "unit-room-102",
  "propertyId": "property-1",
  "leaseNumber": "LS-7NPK0HB0",
  "status": "draft",
  "startDate": "2024-04-01T00:00:00Z",
  "endDate": "2025-03-31T00:00:00Z",
  "rentAmount": 10000,
  "currency": "KES",
  "depositAmount": 10000,
  "paymentFrequency": "monthly",
  "paymentDueDay": 5,
  "lateFeeAmount": 500,
  "gracePeriodDays": 5,
  "propertyName": "Westlands Plaza",
  "propertyTenantName": "John Doe",
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T10:30:00Z"
}
```

### List Leases Response
```json
{
  "data": [
    { /* lease object */ }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

## Validation Rules

### Backend Validation (NestJS class-validator)
- `propertyId`: Required string
- `unitId`: Required string
- `propertyTenantId`: Required string
- `startDate`: Required ISO date string
- `endDate`: Required ISO date string
- `rentAmount`: Required number
- `paymentFrequency`: Valid enum value

### Frontend Validation
- Display error messages for required fields
- Validate date range (end > start)
- Show success/error toasts on actions

### Business Logic Validation
- Unit must be vacant (status = 'vacant')
- No active lease can exist for unit
- Only active leases can be terminated
- Lease dates must be valid date range

---

## Error Handling

### Common Errors

| Error | Status | Message |
|-------|--------|---------|
| Unit has active lease | 400 | "This unit already has an active lease" |
| Lease not found | 404 | "Lease not found" |
| Invalid status | 400 | "Invalid lease status" |
| Unit not vacant | 400 | "Selected unit is not vacant" |
| Unauthorized tenant | 403 | "Access denied to this lease" |

---

## Future Enhancements

1. **Lease Renewal**
   - Auto-renew functionality
   - Renewal terms configuration
   - Renewal notifications

2. **Digital Signatures**
   - E-signature integration
   - Audit trail
   - PDF generation

3. **Payment Integration**
   - Automatic payment reminders
   - Late payment tracking
   - Payment plans

4. **Co-tenants**
   - Support multiple tenants per unit
   - Burden sharing configuration

5. **Lease Templates**
   - Standardized lease templates
   - Clause management
   - Version control

6. **Compliance**
   - Kenyan landlord-tenant law compliance
   - Audit logging
   - Document retention

---

## Testing Checklist

### Create Lease
- [ ] Validate empty property selection error
- [ ] Validate empty unit selection error
- [ ] Auto-fill works correctly
- [ ] Lease saves with draft status
- [ ] LeaseNumber is unique

### Activate Lease
- [ ] Draft lease can be activated
- [ ] Active unit prevents second lease
- [ ] Unit status changes to occupied
- [ ] Lease history updated

### Terminate Lease
- [ ] Active lease can be terminated
- [ ] Termination date is recorded
- [ ] Unit status changes to vacant
- [ ] Reason is recorded

### List & Search
- [ ] Real-time search works
- [ ] Status filter works
- [ ] Pagination works
- [ ] Responsive layout works

---

## File Structure Summary

```
rentium-backend/src/modules/leases/
├── schemas/
│   └── lease.schema.ts (Entity definition)
├── dto/
│   └── lease.dto.ts (Validation DTOs)
├── repositories/
│   └── lease.repository.ts (Database queries)
├── leases.service.ts (Business logic)
├── leases.controller.ts (API endpoints)
└── leases.module.ts (Module definition)

rentium-frontend/src/app/modules/leases/
├── leases-list/
│   ├── leases-list.component.ts
│   ├── leases-list.component.html
│   └── leases-list.component.scss
├── lease-form/
│   ├── lease-form.component.ts
│   ├── lease-form.component.html
│   └── lease-form.component.scss
└── lease-detail/
    ├── lease-detail.component.ts
    ├── lease-detail.component.html
    └── lease-detail.component.scss
```

---

## Deployment Notes

1. **MongoDB Indexes**: Ensure all indexes are created at deployment
2. **Environment Variables**: Confirm API URL in environment.ts
3. **Units Module**: Ensure Units module is imported in LeasesModule
4. **Auth Guards**: All endpoints protected by JWT auth
5. **CORS**: Frontend and backend on same origin or CORS configured

---

## Support & Maintenance

For issues or questions:
1. Check business logic in `leases.service.ts`
2. Review validation in DTOs
3. Check relationships in `lease.schema.ts`
4. Verify API responses in controller
5. Test form validations in component

---

**Last Updated**: March 27, 2026
**Status**: Production Ready
