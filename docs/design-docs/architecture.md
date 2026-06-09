Absolutely, Madhu. If you want to keep it simple and create **domain services with synchronous communication**, then remove the event bus, saga pattern, choreography, outbox, AsyncAPI, and complex event-driven parts for now.

Here is the updated version.

# Domain-Driven Services with Synchronous Communication

## 1. Architecture Goal

The goal is to create a clean domain-driven architecture for the home construction platform using domain services and synchronous API communication between services.

At this stage, the system does not need event-driven architecture, Kafka, saga orchestration, or asynchronous integration. The priority is to keep the design simple, modular, easy to build, and easy to evolve.

## 2. Core Principle

Design the system around business domains first, then expose each domain through well-defined APIs.

Each domain service should own its own business logic, data model, API contract, and persistence layer.

```text
Frontend / Website / Admin App
        |
API Gateway / Backend-for-Frontend
        |
------------------------------------------------
| Project Service                               |
| Document Service                              |
| Vendor Service                                |
| BOQ Service                                   |
| Quote Service                                 |
| Procurement Service                           |
| Execution Service                             |
| Quality Service                               |
| Handover Service                              |
| Notification Service                          |
------------------------------------------------
        |
Each service owns its own database or schema
```

## 3. Recommended Domain Services

| Domain Service       | Responsibility                                                      |
| -------------------- | ------------------------------------------------------------------- |
| Project Service      | Projects, sites, buildings, floors, rooms, spaces                   |
| Document Service     | Drawings, renders, BOQs, invoices, files, versions, approvals       |
| Vendor Service       | Vendors, contractors, suppliers, consultants, ratings, verification |
| BOQ Service          | BOQ packages, line items, quantities, benchmark rates               |
| Quote Service        | Vendor quotes, quote line items, comparison, negotiation, approval  |
| Procurement Service  | Purchase orders, deliveries, installation tracking                  |
| Execution Service    | Work packages, tasks, milestones, progress tracking                 |
| Quality Service      | Inspections, snags, issue tracking, closure evidence                |
| Handover Service     | Assets, warranties, manuals, maintenance records                    |
| Notification Service | Email, WhatsApp, SMS, reminders                                     |

## 4. Synchronous Communication Model

Use REST APIs for communication between services.

For example:

```text
Quote Service calls Vendor Service to validate vendor
Quote Service calls BOQ Service to fetch BOQ package
Procurement Service calls Quote Service to fetch approved quote
Execution Service calls Project Service to fetch room and project details
Quality Service calls Vendor Service to assign a snag to a vendor
Handover Service calls Procurement Service to fetch installed products
```

## 5. Example Flow: Quote Approval to Purchase Order

### Business Flow

```text
Homeowner approves quote
  Quote Service validates the quote
  Quote Service calls Vendor Service to confirm vendor status
  Quote Service calls BOQ Service to confirm BOQ package
  Quote Service marks quote as approved
  Procurement Service creates purchase order using approved quote
  Document Service stores purchase order PDF
  Notification Service sends message to vendor
```

### API Flow

```text
POST /quotes/{quoteId}/approve
        |
        |-- GET /vendors/{vendorId}
        |-- GET /boq-packages/{boqPackageId}
        |-- PATCH /quotes/{quoteId}/status
        |-- POST /purchase-orders
        |-- POST /documents
        |-- POST /notifications
```

## 6. Example REST APIs

### Project Service

```text
GET    /projects
POST   /projects
GET    /projects/{projectId}
GET    /projects/{projectId}/spaces
POST   /projects/{projectId}/spaces
GET    /spaces/{spaceId}
```

### Vendor Service

```text
GET    /vendors
POST   /vendors
GET    /vendors/{vendorId}
GET    /vendors/{vendorId}/ratings
PATCH  /vendors/{vendorId}/verification-status
```

### BOQ Service

```text
GET    /projects/{projectId}/boq-packages
POST   /projects/{projectId}/boq-packages
GET    /boq-packages/{boqPackageId}
GET    /boq-packages/{boqPackageId}/line-items
POST   /boq-packages/{boqPackageId}/line-items
```

### Quote Service

```text
GET    /projects/{projectId}/quotes
POST   /quotes
GET    /quotes/{quoteId}
GET    /quotes/{quoteId}/line-items
POST   /quotes/{quoteId}/approve
POST   /quotes/{quoteId}/reject
POST   /quotes/{quoteId}/negotiate
```

### Procurement Service

```text
GET    /projects/{projectId}/purchase-orders
POST   /purchase-orders
GET    /purchase-orders/{purchaseOrderId}
PATCH  /purchase-orders/{purchaseOrderId}/status
GET    /projects/{projectId}/deliveries
POST   /deliveries
```

### Quality Service

```text
GET    /projects/{projectId}/inspections
POST   /inspections
GET    /projects/{projectId}/snags
POST   /snags
PATCH  /snags/{snagId}/assign
PATCH  /snags/{snagId}/resolve
PATCH  /snags/{snagId}/close
```

## 7. Hexagonal Architecture Inside Each Service

Each service should follow hexagonal architecture.

```text
service-name
  domain
    entities
    value_objects
    domain_services
    repository_interfaces

  application
    use_cases
    commands
    queries
    dto
    service_clients

  infrastructure
    database
    external_api_clients
    file_storage
    notification_clients

  interfaces
    rest_controllers
    request_response_models
```

## 8. Example: Quote Service Structure

```text
quote-service
  domain
    Quote
    QuoteLineItem
    QuoteStatus
    Money
    QuoteRepository

  application
    SubmitQuoteUseCase
    ApproveQuoteUseCase
    CompareQuotesUseCase
    NegotiateQuoteUseCase
    VendorClient
    BOQClient
    ProcurementClient

  infrastructure
    PostgresQuoteRepository
    RestVendorClient
    RestBOQClient
    RestProcurementClient

  interfaces
    QuoteController
```

## 9. Example Quote Approval Use Case

```text
ApproveQuoteUseCase
  1. Load quote from QuoteRepository
  2. Validate quote is not expired
  3. Call Vendor Service to confirm vendor is verified
  4. Call BOQ Service to confirm BOQ package is active
  5. Approve quote
  6. Save quote
  7. Call Procurement Service to create purchase order
  8. Call Notification Service to notify vendor and homeowner
```

## 10. Example API Request

```http
POST /quotes/quote_789/approve
```

```json
{
  "approvedBy": "user_madhu",
  "approvedAmount": 1850000,
  "approvalNote": "Approved after final negotiation with vendor."
}
```

## 11. Example API Response

```json
{
  "quoteId": "quote_789",
  "status": "APPROVED",
  "approvedAmount": 1850000,
  "currency": "INR",
  "purchaseOrderId": "po_456",
  "message": "Quote approved and purchase order created successfully."
}
```

## 12. Data Ownership

Each service should own its data.

| Data                           | Owning Service      |
| ------------------------------ | ------------------- |
| Projects, floors, rooms        | Project Service     |
| Drawings, files, versions      | Document Service    |
| Vendors, ratings, verification | Vendor Service      |
| BOQ packages and line items    | BOQ Service         |
| Quotes and quote line items    | Quote Service       |
| Purchase orders and deliveries | Procurement Service |
| Tasks and milestones           | Execution Service   |
| Snags and inspections          | Quality Service     |
| Assets and warranties          | Handover Service    |

Other services should access this data only through APIs.

## 13. Recommended First Version

Do not start with too many services. Start with fewer domain services and split later.

### MVP Services

```text
Project Service
Document Service
Vendor Service
Commercial Service
Quality Service
Notification Service
```

Where **Commercial Service** initially owns:

```text
BOQ
Quote
Procurement
PurchaseOrder
```

Later, when the platform grows, split Commercial Service into:

```text
BOQ Service
Quote Service
Procurement Service
```

## 14. Recommended MVP Architecture

```text
Frontend / Residence Website / Admin Dashboard
        |
Backend API Gateway
        |
------------------------------------------------
| Project Service                               |
| Document Service                              |
| Vendor Service                                |
| Commercial Service                            |
| Quality Service                               |
| Notification Service                          |
------------------------------------------------
        |
PostgreSQL schemas or separate databases
File Storage: S3 / Google Cloud Storage
Search: OpenSearch / Meilisearch
```

## 15. Technology Recommendation

| Layer          | Recommendation                             |
| -------------- | ------------------------------------------ |
| Frontend       | Next.js                                    |
| Backend        | Java Spring Boot or Python FastAPI         |
| API style      | REST                                       |
| API contract   | OpenAPI                                    |
| Database       | PostgreSQL                                 |
| File storage   | S3-compatible storage                      |
| Search         | Meilisearch or OpenSearch                  |
| Authentication | Auth0, Cognito, Firebase Auth, or Keycloak |
| Observability  | OpenTelemetry, Grafana, Prometheus         |

## 16. When to Add Events Later

Start synchronous. Add asynchronous events only when you see real need.

Add events later for:

```text
Notifications
Audit logs
Search indexing
Dashboard read models
Analytics
AI processing
Document processing
Long-running procurement workflows
```

For now, synchronous APIs are enough.

## 17. Final Recommendation

Start with a **modular domain-driven service architecture using synchronous REST APIs**.

Build the first version as:

```text
Project Service
Document Service
Vendor Service
Commercial Service
Quality Service
Notification Service
```

Keep clear domain boundaries, use hexagonal architecture inside each service, define OpenAPI contracts, and make each service responsible for its own data.

Once the platform grows, you can introduce events, sagas, and separate services only where needed.
