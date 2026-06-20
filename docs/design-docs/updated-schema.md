Yes, Madhu. Below is a **combined construction industry data model** that uses each standard in the right place:

**Schema.org** for public web pages and SEO, **IFC** for building objects, spaces, materials and quantities, **BCF** for snags and design issues, **openCDE Documents API pattern** for drawings and files, **bSDD** for standard construction vocabulary, **IDS** for data completeness and quality rules, **COBie** for handover and warranty, and your **custom homeowner model** for quotes, vendors, procurement, decisions and learnings.

buildingSMART positions openBIM standards as a family of standards and services including IFC, bSDD, IDS and openCDE, while its openCDE initiative includes API standards such as Foundation API, BCF API, Documents API and Dictionary API. ([buildingSMART International][1]) IFC is the core openBIM standard for structured building data exchange, BCF is used for issue and topic collaboration around models, IDS defines machine-checkable information requirements, and bSDD provides agreed construction terms and properties. ([buildingSMART Technical][2]) COBie is useful for structured handover data needed to maintain a facility digitally. ([National Institute of Building Sciences][3])

# 1. Overall layered model

| Layer              | Standard                      | What it owns in your platform                                                         |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------- |
| Public web / SEO   | Schema.org                    | Website pages, room pages, vendor pages, product pages, articles, case studies        |
| Building model     | IFC                           | Building, floor, room, wall, slab, door, window, roof, stair, MEP systems, quantities |
| Documents          | openCDE Documents API pattern | Drawings, PDFs, BOQs, renders, photos, revisions, approvals, metadata                 |
| Issues / snags     | BCF                           | Design comments, site issues, snags, viewpoints, assigned vendor, status              |
| Dictionary         | bSDD                          | Standard names, classifications, property definitions, material vocabulary            |
| Requirements       | IDS                           | Required data checklists, compliance rules, completeness validation                   |
| Handover           | COBie                         | Assets, equipment, spaces, systems, warranties, spares, maintenance info              |
| Homeowner workflow | Custom model                  | Quotes, vendors, procurement, decisions, costs, learnings, negotiation history        |

# 2. Core entity model

```text
HomeConstructionProject
  has Site
  has Building
  has Floors
  has Spaces / Rooms
  has BuildingElements
  has Systems
  has Materials
  has Quantities
  has Documents
  has Issues / Snags
  has Vendors
  has Quotes
  has BOQ
  has ProcurementItems
  has PurchaseOrders
  has Deliveries
  has Decisions
  has Learnings
  has HandoverAssets
  has Warranties
  has IDSChecklists
  has PublicWebPages
```

# 3. Main entities and standard mapping

| Your platform entity | Primary standard                   | Secondary standard      | Purpose                                          |
| -------------------- | ---------------------------------- | ----------------------- | ------------------------------------------------ |
| Project              | Custom + Schema.org                | openCDE                 | Overall home project                             |
| Site                 | IFC + Schema.org                   | COBie                   | Plot, address, location                          |
| Building             | IFC                                | Schema.org              | Residence building                               |
| Floor                | IFC                                | COBie                   | Ground floor, first floor, terrace               |
| Room / Space         | IFC                                | COBie + Schema.org      | Living room, kitchen, bedroom, terrace           |
| Building Element     | IFC                                | bSDD                    | Wall, door, window, slab, stair, roof            |
| System               | IFC                                | COBie                   | Electrical, plumbing, HVAC, automation, lighting |
| Material             | IFC + bSDD                         | Schema.org Product      | Paint, stone, tile, veneer, plywood              |
| Quantity             | IFC                                | Custom BOQ              | Area, volume, count, running feet                |
| Product              | Schema.org Product + bSDD          | COBie                   | Light, faucet, furniture, appliance              |
| Drawing / File       | openCDE Documents pattern          | Schema.org CreativeWork | PDF, CAD, render, image, BOQ                     |
| Issue / Snag         | BCF                                | Custom QC               | Site snag, design comment, defect                |
| Vendor               | Custom + Schema.org                | COBie Contact           | Contractor, supplier, consultant                 |
| Quote                | Custom + Schema.org Offer          | BOQ                     | Vendor estimate                                  |
| Procurement          | Custom                             | COBie Asset             | Purchase, delivery, installation                 |
| Decision             | Custom                             | openCDE document link   | Approved choices and why                         |
| Learning             | Custom + Schema.org Article        | Case study              | Homeowner learnings                              |
| Handover Asset       | COBie                              | IFC Product             | Equipment and maintainable assets                |
| Warranty             | COBie + Schema.org WarrantyPromise | Custom                  | Warranty and service info                        |
| Checklist            | IDS                                | Custom QC               | Required information and quality gates           |

# 4. Recommended database model

## 4.1 Project

Central object for the entire home.

| Field                  | Type    | Standard mapping         |
| ---------------------- | ------- | ------------------------ |
| project_id             | UUID    | Custom                   |
| schema_type            | string  | Schema.org `Project`     |
| name                   | string  | Schema.org `name`        |
| description            | text    | Schema.org `description` |
| owner_id               | UUID    | Schema.org `Person`      |
| site_id                | UUID    | IFC `IfcSite`            |
| building_id            | UUID    | IFC `IfcBuilding`        |
| start_date             | date    | Schema.org `startDate`   |
| target_completion_date | date    | Schema.org `endDate`     |
| status                 | enum    | Custom                   |
| budget_amount          | decimal | Custom                   |
| currency               | string  | Custom                   |
| design_style           | string  | Schema.org `keywords`    |
| public_url             | URL     | Schema.org `url`         |

## 4.2 Site

| Field          | Type    | Standard mapping             |
| -------------- | ------- | ---------------------------- |
| site_id        | UUID    | IFC `IfcSite`                |
| project_id     | UUID    | Custom                       |
| name           | string  | Schema.org `Place.name`      |
| address_line   | text    | Schema.org `PostalAddress`   |
| city           | string  | Schema.org `addressLocality` |
| state          | string  | Schema.org `addressRegion`   |
| country        | string  | Schema.org `addressCountry`  |
| latitude       | decimal | Schema.org `GeoCoordinates`  |
| longitude      | decimal | Schema.org `GeoCoordinates`  |
| plot_area      | decimal | IFC quantity                 |
| plot_area_unit | string  | IFC unit                     |

## 4.3 Building

| Field             | Type    | Standard mapping                            |
| ----------------- | ------- | ------------------------------------------- |
| building_id       | UUID    | IFC `IfcBuilding`                           |
| site_id           | UUID    | IFC relationship                            |
| name              | string  | IFC `Name`                                  |
| building_type     | enum    | Schema.org `House`, `SingleFamilyResidence` |
| total_built_area  | decimal | IFC quantity                                |
| number_of_floors  | integer | Custom                                      |
| construction_type | string  | bSDD classification                         |
| structural_system | string  | IFC / bSDD                                  |
| public_page_url   | URL     | Schema.org page                             |

## 4.4 Floor / Storey

| Field            | Type    | Standard mapping        |
| ---------------- | ------- | ----------------------- |
| floor_id         | UUID    | IFC `IfcBuildingStorey` |
| building_id      | UUID    | IFC relationship        |
| name             | string  | IFC `Name`              |
| level_number     | integer | Custom                  |
| elevation        | decimal | IFC elevation           |
| gross_floor_area | decimal | IFC quantity            |
| status           | enum    | Custom                  |

## 4.5 Space / Room

This is one of the most important entities for your residence website.

| Field              | Type    | Standard mapping                   |
| ------------------ | ------- | ---------------------------------- |
| space_id           | UUID    | IFC `IfcSpace`                     |
| floor_id           | UUID    | IFC containment                    |
| name               | string  | IFC `Name`, Schema.org `Room.name` |
| room_type          | enum    | bSDD classification                |
| area_sqft          | decimal | IFC quantity                       |
| ceiling_height     | decimal | IFC property                       |
| design_intent      | text    | Custom                             |
| function           | string  | bSDD / Custom                      |
| finish_schedule_id | UUID    | Custom                             |
| public_page_url    | URL     | Schema.org `Room`                  |
| cobie_space_name   | string  | COBie Space                        |

Examples:

```text
Living Room
Dining
Kitchen
Master Bedroom
Guest Bedroom
Puja Room
Home Theatre
Terrace
Garden
Utility
Powder Room
```

# 5. IFC-based building element model

## 5.1 BuildingElement

Use this for walls, doors, windows, slabs, stairs, roofs, railings and built-in elements.

| Field            | Type   | Standard mapping                        |
| ---------------- | ------ | --------------------------------------- |
| element_id       | UUID   | IFC element GlobalId                    |
| project_id       | UUID   | Custom                                  |
| building_id      | UUID   | IFC relationship                        |
| floor_id         | UUID   | IFC relationship                        |
| space_id         | UUID   | IFC relationship                        |
| ifc_class        | string | `IfcWall`, `IfcDoor`, `IfcWindow`, etc. |
| name             | string | IFC `Name`                              |
| type_name        | string | IFC type                                |
| bsdd_class_uri   | URI    | bSDD class                              |
| material_id      | UUID   | IFC material                            |
| quantity_set_id  | UUID   | IFC quantity set                        |
| status           | enum   | Custom                                  |
| linked_documents | UUID[] | openCDE documents                       |
| linked_issues    | UUID[] | BCF topics                              |

## 5.2 Common IFC classes to support

| Construction object | IFC class                                                |
| ------------------- | -------------------------------------------------------- |
| Wall                | `IfcWall`                                                |
| Door                | `IfcDoor`                                                |
| Window              | `IfcWindow`                                              |
| Slab                | `IfcSlab`                                                |
| Roof                | `IfcRoof`                                                |
| Stair               | `IfcStair`                                               |
| Railing             | `IfcRailing`                                             |
| Column              | `IfcColumn`                                              |
| Beam                | `IfcBeam`                                                |
| Curtain wall        | `IfcCurtainWall`                                         |
| Space / Room        | `IfcSpace`                                               |
| Electrical device   | `IfcElectricAppliance`, `IfcFlowTerminal`                |
| Light fixture       | `IfcLamp`, `IfcLightFixture` depending on schema version |
| Pipe / Plumbing     | `IfcPipeSegment`, `IfcFlowFitting`                       |
| HVAC                | `IfcFlowTerminal`, `IfcDistributionElement`              |

# 6. Material and quantity model

## 6.1 Material

| Field                  | Type   | Standard mapping   |
| ---------------------- | ------ | ------------------ |
| material_id            | UUID   | IFC `IfcMaterial`  |
| name                   | string | IFC / bSDD         |
| category               | enum   | bSDD class         |
| brand_id               | UUID   | Schema.org `Brand` |
| finish                 | string | Custom             |
| color                  | string | Schema.org `color` |
| texture                | string | Custom             |
| performance_properties | JSON   | bSDD properties    |
| linked_products        | UUID[] | Schema.org Product |

Examples:

```text
Italian marble
Granite
Engineered wood
Veneer
PU polish
Asian Paints Royale Matt
Century plywood
Outdoor tile
Glass
Metal
```

## 6.2 Quantity

| Field         | Type    | Standard mapping                      |
| ------------- | ------- | ------------------------------------- |
| quantity_id   | UUID    | IFC quantity                          |
| element_id    | UUID    | IFC element                           |
| space_id      | UUID    | IFC space                             |
| quantity_type | enum    | Area, Volume, Count, Length, Weight   |
| name          | string  | IFC quantity name                     |
| value         | decimal | IFC value                             |
| unit          | string  | IFC unit                              |
| source        | enum    | BIM, manual, vendor, site measurement |
| verified_by   | UUID    | Custom                                |
| verified_date | date    | Custom                                |

This lets you connect **IFC quantities** directly to your **BOQ and quote comparison**.

# 7. openCDE-style document model

The openCDE Documents API pattern is useful for treating each file as a document plus metadata. buildingSMART lists Documents API as part of its openCDE API standards portfolio. ([buildingSMART International][1])

## 7.1 Document

| Field              | Type     | Standard mapping                                    |
| ------------------ | -------- | --------------------------------------------------- |
| document_id        | UUID     | openCDE document id                                 |
| project_id         | UUID     | Container/project                                   |
| title              | string   | Schema.org `CreativeWork.name`                      |
| document_type      | enum     | Drawing, BOQ, Quote, Invoice, Render, Photo         |
| discipline         | enum     | Architecture, Civil, Electrical, Lighting, Plumbing |
| file_name          | string   | openCDE file metadata                               |
| file_url           | URL      | Schema.org `url`                                    |
| mime_type          | string   | openCDE metadata                                    |
| version            | string   | openCDE version                                     |
| revision           | string   | ISO 19650 style revision                            |
| status             | enum     | WIP, Shared, Published, Archived                    |
| approval_status    | enum     | Pending, Approved, Rejected, Superseded             |
| created_by         | UUID     | Schema.org `creator`                                |
| created_at         | datetime | Schema.org `dateCreated`                            |
| modified_at        | datetime | Schema.org `dateModified`                           |
| related_space_id   | UUID     | Custom                                              |
| related_element_id | UUID     | IFC element                                         |
| related_vendor_id  | UUID     | Custom                                              |

## 7.2 Document types

```text
Architectural Drawing
Structural Drawing
Electrical Drawing
Plumbing Layout
Lighting Plan
False Ceiling Plan
Carpentry Drawing
Furniture Layout
Material Specification
BOQ
Quotation
Invoice
Purchase Order
Warranty Document
Site Photo
Progress Photo
Render
Approval Note
Snag Photo
Handover Document
```

# 8. BCF issue / snag model

BCF is made for model-based communication, allowing text, screenshots, model object references and viewpoints, with topic filtering and status management. ([buildingSMART International][4])

## 8.1 Issue / Snag / Design Comment

| Field                 | Type     | Standard mapping                                |
| --------------------- | -------- | ----------------------------------------------- |
| issue_id              | UUID     | BCF topic id                                    |
| project_id            | UUID     | BCF project                                     |
| title                 | string   | BCF topic title                                 |
| description           | text     | BCF topic description                           |
| issue_type            | enum     | Snag, Design Comment, Clash, RFI, Quality Issue |
| priority              | enum     | Low, Medium, High, Critical                     |
| status                | enum     | Open, In Review, Resolved, Closed               |
| assigned_to_vendor_id | UUID     | Custom                                          |
| assigned_to_person_id | UUID     | BCF assigned user                               |
| related_space_id      | UUID     | IFC `IfcSpace`                                  |
| related_element_id    | UUID     | IFC element reference                           |
| viewpoint_url         | URL      | BCF viewpoint                                   |
| snapshot_url          | URL      | BCF snapshot                                    |
| due_date              | date     | Custom                                          |
| resolved_date         | date     | Custom                                          |
| created_by            | UUID     | BCF author                                      |
| created_at            | datetime | BCF creation date                               |

## 8.2 IssueComment

| Field                  | Type     | Standard mapping |
| ---------------------- | -------- | ---------------- |
| comment_id             | UUID     | BCF comment id   |
| issue_id               | UUID     | BCF topic        |
| author_id              | UUID     | BCF author       |
| comment_text           | text     | BCF comment      |
| attachment_document_id | UUID     | openCDE document |
| created_at             | datetime | BCF date         |

# 9. bSDD vocabulary model

bSDD is buildingSMART’s service for sharing definitions for the built environment, and the bSDD API can retrieve class and property information from dictionaries such as IFC and ETIM. ([buildingSMART International][5])

## 9.1 Classification

| Field                  | Type   | Standard mapping                           |
| ---------------------- | ------ | ------------------------------------------ |
| classification_id      | UUID   | Custom                                     |
| bsdd_uri               | URI    | bSDD class URI                             |
| dictionary_name        | string | bSDD dictionary                            |
| class_name             | string | bSDD class                                 |
| class_code             | string | bSDD code                                  |
| definition             | text   | bSDD definition                            |
| parent_class_id        | UUID   | bSDD hierarchy                             |
| applicable_entity_type | enum   | Product, Material, Space, Element, Service |

## 9.2 PropertyDefinition

| Field                  | Type   | Standard mapping        |
| ---------------------- | ------ | ----------------------- |
| property_definition_id | UUID   | Custom                  |
| bsdd_property_uri      | URI    | bSDD property URI       |
| name                   | string | bSDD property           |
| definition             | text   | bSDD definition         |
| data_type              | string | bSDD data type          |
| unit                   | string | bSDD unit               |
| allowed_values         | JSON   | bSDD allowed values     |
| applicable_class_id    | UUID   | bSDD class relationship |

Use this to standardize:

```text
Paint finish
Tile thickness
Stone type
Light wattage
Color temperature
CRI
Veneer species
Plywood grade
Door height
Window system
Automation protocol
Waterproofing type
```

# 10. IDS checklist and validation model

IDS defines information requirements in a computer-interpretable way and supports automatic compliance checking of IFC models. ([buildingSMART International][6])

## 10.1 IDSChecklist

| Field             | Type   | Standard mapping                                        |
| ----------------- | ------ | ------------------------------------------------------- |
| checklist_id      | UUID   | IDS specification                                       |
| project_id        | UUID   | Custom                                                  |
| name              | string | IDS name                                                |
| discipline        | enum   | Architecture, Interiors, Lighting, Electrical, Plumbing |
| applies_to_entity | string | IFC class or custom entity                              |
| phase             | enum   | Design, Procurement, Execution, Handover                |
| status            | enum   | Draft, Active, Retired                                  |
| version           | string | IDS version                                             |

## 10.2 IDSRequirement

| Field              | Type   | Standard mapping                                    |
| ------------------ | ------ | --------------------------------------------------- |
| requirement_id     | UUID   | IDS requirement                                     |
| checklist_id       | UUID   | IDS specification                                   |
| target_entity_type | string | IFC class                                           |
| required_property  | string | IFC / bSDD property                                 |
| rule_type          | enum   | Required, AllowedValue, MinValue, MaxValue, Pattern |
| expected_value     | JSON   | IDS rule                                            |
| severity           | enum   | Warning, Error, Critical                            |
| validation_message | text   | Custom                                              |

Example checklist for a room:

```text
Every Room must have:
- Room name
- Floor
- Area
- Ceiling height
- Flooring material
- Wall finish
- Ceiling finish
- Lighting plan reference
- Electrical point layout
- Furniture layout
- Responsible vendor
- Approval status
```

# 11. COBie handover and warranty model

COBie provides a standardized way to deliver data needed to maintain a facility digitally. ([National Institute of Building Sciences][3])

## 11.1 HandoverAsset

| Field                          | Type   | Standard mapping                                 |
| ------------------------------ | ------ | ------------------------------------------------ |
| asset_id                       | UUID   | COBie Component                                  |
| project_id                     | UUID   | COBie Facility                                   |
| space_id                       | UUID   | COBie Space                                      |
| system_id                      | UUID   | COBie System                                     |
| product_id                     | UUID   | COBie Type / Component                           |
| name                           | string | COBie Component Name                             |
| serial_number                  | string | COBie SerialNumber                               |
| model_number                   | string | COBie ModelNumber                                |
| manufacturer_id                | UUID   | COBie Manufacturer                               |
| supplier_id                    | UUID   | COBie Supplier                                   |
| installation_date              | date   | COBie InstallationDate                           |
| warranty_id                    | UUID   | COBie Warranty                                   |
| maintenance_manual_document_id | UUID   | COBie Document                                   |
| status                         | enum   | Installed, Commissioned, Under Warranty, Retired |

Examples:

```text
Dishwasher
Chimney
Induction hob
Water softener
Heat pump
Solar inverter
KNX actuator
DALI driver
Curtain motor
Outdoor light fixture
Pump
CCTV camera
Door lock
```

## 11.2 Warranty

| Field                | Type | Standard mapping                            |
| -------------------- | ---- | ------------------------------------------- |
| warranty_id          | UUID | COBie Warranty / Schema.org WarrantyPromise |
| asset_id             | UUID | COBie Component                             |
| warranty_provider_id | UUID | COBie Contact                               |
| warranty_start_date  | date | COBie WarrantyStartDate                     |
| warranty_end_date    | date | COBie WarrantyEndDate                       |
| warranty_type        | enum | Product, Installation, Service              |
| coverage_description | text | Schema.org `WarrantyPromise`                |
| claim_process        | text | Custom                                      |
| service_contact_id   | UUID | COBie Contact                               |
| document_id          | UUID | COBie Document                              |

# 12. Custom homeowner business model

This is your unique layer. This is where the Indian homeowner construction market gap exists.

## 12.1 Vendor

| Field               | Type    | Standard mapping                                    |
| ------------------- | ------- | --------------------------------------------------- |
| vendor_id           | UUID    | Schema.org `HomeAndConstructionBusiness`            |
| name                | string  | Schema.org `name`                                   |
| vendor_type         | enum    | Contractor, Supplier, Consultant, Aggregator        |
| service_category    | enum    | Painting, Flooring, Lighting, Carpentry, Automation |
| gst_number          | string  | Schema.org `taxID`                                  |
| phone               | string  | Schema.org `telephone`                              |
| email               | string  | Schema.org `email`                                  |
| website             | URL     | Schema.org `url`                                    |
| address             | JSON    | Schema.org `PostalAddress`                          |
| brands_handled      | UUID[]  | Schema.org `brand`                                  |
| rating              | decimal | Schema.org `AggregateRating`                        |
| notes               | text    | Custom                                              |
| risk_level          | enum    | Low, Medium, High                                   |
| verification_status | enum    | Unverified, Verified, Preferred                     |

## 12.2 Quote

Schema.org `Offer` describes an offer to sell, rent, repair, or provide a service, so it maps well to quote headers and line items. ([schema.org][7])

| Field             | Type    | Standard mapping                                     |
| ----------------- | ------- | ---------------------------------------------------- |
| quote_id          | UUID    | Schema.org `Offer`                                   |
| project_id        | UUID    | Custom                                               |
| vendor_id         | UUID    | Schema.org `seller`                                  |
| quote_number      | string  | Custom                                               |
| quote_date        | date    | Custom                                               |
| valid_until       | date    | Schema.org `validThrough`                            |
| total_amount      | decimal | Schema.org `price`                                   |
| currency          | string  | Schema.org `priceCurrency`                           |
| tax_amount        | decimal | Custom                                               |
| scope_summary     | text    | Schema.org `description`                             |
| terms             | text    | Custom                                               |
| document_id       | UUID    | openCDE document                                     |
| comparison_status | enum    | Pending, Shortlisted, Negotiated, Accepted, Rejected |

## 12.3 QuoteLineItem

| Field                    | Type    | Standard mapping               |
| ------------------------ | ------- | ------------------------------ |
| quote_line_id            | UUID    | Custom                         |
| quote_id                 | UUID    | Schema.org Offer relationship  |
| boq_line_id              | UUID    | Custom BOQ                     |
| product_id               | UUID    | Schema.org Product             |
| service_id               | UUID    | Schema.org Service             |
| description              | text    | Custom                         |
| quantity                 | decimal | IFC quantity / BOQ quantity    |
| unit                     | string  | Custom                         |
| unit_price               | decimal | Schema.org price specification |
| total_price              | decimal | Custom                         |
| brand                    | string  | Schema.org Brand               |
| specification            | text    | bSDD properties                |
| inclusions               | text    | Custom                         |
| exclusions               | text    | Custom                         |
| negotiation_target_price | decimal | Custom                         |

## 12.4 BOQLineItem

| Field              | Type    | Standard mapping                                |
| ------------------ | ------- | ----------------------------------------------- |
| boq_line_id        | UUID    | Custom                                          |
| project_id         | UUID    | Custom                                          |
| space_id           | UUID    | IFC Space                                       |
| element_id         | UUID    | IFC Element                                     |
| work_package_id    | UUID    | Custom                                          |
| description        | text    | Custom                                          |
| quantity_id        | UUID    | IFC Quantity                                    |
| quantity           | decimal | IFC Quantity                                    |
| unit               | string  | IFC Unit                                        |
| benchmark_rate     | decimal | Custom                                          |
| approved_rate      | decimal | Custom                                          |
| approved_vendor_id | UUID    | Custom                                          |
| status             | enum    | Estimated, Quoted, Approved, Ordered, Completed |

## 12.5 ProcurementItem

| Field                  | Type    | Standard mapping                                |
| ---------------------- | ------- | ----------------------------------------------- |
| procurement_item_id    | UUID    | Custom                                          |
| project_id             | UUID    | Custom                                          |
| product_id             | UUID    | Schema.org Product                              |
| space_id               | UUID    | IFC Space                                       |
| vendor_id              | UUID    | Custom                                          |
| quote_line_id          | UUID    | Custom                                          |
| purchase_order_id      | UUID    | Schema.org Order                                |
| quantity               | decimal | Custom                                          |
| unit_price             | decimal | Custom                                          |
| expected_delivery_date | date    | ParcelDelivery                                  |
| actual_delivery_date   | date    | ParcelDelivery                                  |
| delivery_status        | enum    | Planned, Ordered, Shipped, Delivered, Installed |
| warranty_id            | UUID    | COBie Warranty                                  |

## 12.6 DecisionLog

| Field              | Type   | Standard mapping                                    |
| ------------------ | ------ | --------------------------------------------------- |
| decision_id        | UUID   | Custom                                              |
| project_id         | UUID   | Custom                                              |
| title              | string | Custom                                              |
| decision_type      | enum   | Design, Material, Vendor, Cost, Technical, Schedule |
| description        | text   | Custom                                              |
| options_considered | JSON   | Custom                                              |
| selected_option    | text   | Custom                                              |
| reason             | text   | Custom                                              |
| impact             | enum   | Cost, Quality, Timeline, Aesthetic, Maintenance     |
| approved_by        | UUID   | Custom                                              |
| decision_date      | date   | Custom                                              |
| related_documents  | UUID[] | openCDE documents                                   |
| related_space_id   | UUID   | IFC Space                                           |
| related_vendor_id  | UUID   | Custom                                              |

## 12.7 Learning / CaseStudy

Schema.org `CreativeWork` is the generic base for creative works, including photographs and other content, so it works well for homeowner learning pages and case studies. ([schema.org][8])

| Field             | Type   | Standard mapping                                   |
| ----------------- | ------ | -------------------------------------------------- |
| learning_id       | UUID   | Schema.org `Article` / `CreativeWork`              |
| project_id        | UUID   | Custom                                             |
| title             | string | Schema.org `name`                                  |
| category          | enum   | Cost, Vendor, Quality, Material, Timeline, Mistake |
| problem           | text   | Custom                                             |
| what_happened     | text   | Custom                                             |
| decision_taken    | text   | Custom                                             |
| lesson_learned    | text   | Custom                                             |
| recommendation    | text   | Custom                                             |
| related_space_id  | UUID   | IFC Space                                          |
| related_vendor_id | UUID   | Custom                                             |
| related_documents | UUID[] | openCDE documents                                  |
| publish_status    | enum   | Draft, Published, Private                          |

# 13. Relationship model

```text
Project
  1 to 1 Site
  1 to 1 Building
  1 to many Floors
  1 to many Spaces
  1 to many Documents
  1 to many Vendors
  1 to many Quotes
  1 to many WorkPackages
  1 to many Issues
  1 to many Decisions
  1 to many Learnings

Building
  1 to many Floors
  1 to many Systems
  1 to many BuildingElements

Floor
  1 to many Spaces
  1 to many BuildingElements

Space
  1 to many BuildingElements
  1 to many Materials
  1 to many Documents
  1 to many Issues
  1 to many BOQLineItems
  1 to many HandoverAssets

BuildingElement
  belongs to Space
  has Materials
  has Quantities
  has Documents
  has Issues

Document
  can link to Project, Space, Element, Vendor, Quote, Issue, Decision

Issue
  can link to Space, Element, Document, Vendor, Person

Quote
  belongs to Vendor
  has QuoteLineItems
  can map to BOQLineItems

ProcurementItem
  maps to Product
  maps to Vendor
  maps to PurchaseOrder
  maps to Delivery
  maps to Warranty

HandoverAsset
  maps to Space
  maps to Product
  maps to System
  maps to Warranty
  maps to MaintenanceDocument
```

# 14. API resource model

This is how I would expose it as API endpoints.

```text
/api/projects
/api/projects/{projectId}

/api/projects/{projectId}/sites
/api/projects/{projectId}/buildings
/api/projects/{projectId}/floors
/api/projects/{projectId}/spaces
/api/projects/{projectId}/elements
/api/projects/{projectId}/materials
/api/projects/{projectId}/quantities

/api/projects/{projectId}/documents
/api/projects/{projectId}/documents/{documentId}/versions

/api/projects/{projectId}/issues
/api/projects/{projectId}/issues/{issueId}/comments

/api/classifications
/api/classifications/bsdd/search
/api/property-definitions

/api/projects/{projectId}/ids-checklists
/api/projects/{projectId}/ids-checklists/{checklistId}/validate

/api/projects/{projectId}/vendors
/api/projects/{projectId}/quotes
/api/projects/{projectId}/quote-line-items
/api/projects/{projectId}/boq
/api/projects/{projectId}/procurement
/api/projects/{projectId}/purchase-orders
/api/projects/{projectId}/deliveries

/api/projects/{projectId}/handover-assets
/api/projects/{projectId}/warranties
/api/projects/{projectId}/maintenance-documents

/api/projects/{projectId}/decisions
/api/projects/{projectId}/learnings
/api/projects/{projectId}/public-pages
```

# 15. Example combined JSON object

```json
{
  "project_id": "proj_kalaimalai_residence",
  "schema_org": {
    "@context": "https://schema.org",
    "@type": "Project",
    "name": "Kalaimalai Residence",
    "url": "https://mkalaimalai-residence.github.io/",
    "description": "A homeowner-led dream home construction journey in Bangalore."
  },
  "ifc": {
    "site": {
      "ifc_class": "IfcSite",
      "name": "Kalaimalai Residence Site"
    },
    "building": {
      "ifc_class": "IfcBuilding",
      "name": "Kalaimalai Residence"
    },
    "spaces": [
      {
        "space_id": "space_living_room",
        "ifc_class": "IfcSpace",
        "name": "Living Room",
        "area_sqft": 450
      }
    ]
  },
  "documents": [
    {
      "document_id": "doc_lighting_plan_v1",
      "title": "Living Room Lighting Plan",
      "document_type": "Lighting Plan",
      "version": "1.0",
      "status": "Published",
      "related_space_id": "space_living_room"
    }
  ],
  "issues": [
    {
      "issue_id": "issue_001",
      "bcf_type": "Topic",
      "title": "Cove light alignment mismatch",
      "status": "Open",
      "priority": "High",
      "related_space_id": "space_living_room",
      "assigned_to_vendor_id": "vendor_lighting_contractor"
    }
  ],
  "requirements": [
    {
      "ids_checklist": "Room Data Completeness",
      "target_entity": "IfcSpace",
      "required_properties": [
        "Room Name",
        "Area",
        "Flooring Material",
        "Wall Finish",
        "Lighting Plan Reference"
      ]
    }
  ],
  "handover": {
    "assets": [
      {
        "asset_id": "asset_dali_driver_001",
        "cobie_type": "Component",
        "name": "DALI Driver",
        "space_id": "space_living_room",
        "warranty_id": "warranty_dali_driver_001"
      }
    ]
  },
  "homeowner_workflow": {
    "decisions": [
      {
        "decision_id": "decision_001",
        "title": "Use warm indirect lighting in living room",
        "reason": "To create a calm, premium evening ambience."
      }
    ],
    "learnings": [
      {
        "learning_id": "learn_001",
        "title": "Finalize lighting before false ceiling closure",
        "category": "Execution",
        "recommendation": "Coordinate lighting, ceiling, electrical and automation drawings before gypsum closure."
      }
    ]
  }
}
```

# 16. Best implementation approach

For your use case, I would implement the model in three levels:

| Level                | Purpose                        | Technology                                        |
| -------------------- | ------------------------------ | ------------------------------------------------- |
| Operational database | Day-to-day app data            | PostgreSQL / Supabase                             |
| Semantic layer       | Cross-standard mapping         | JSON-LD, IFC references, bSDD URIs                |
| Knowledge graph      | Relationships and intelligence | Neo4j / RDF graph / PostgreSQL graph-style tables |

A practical stack:

```text
Frontend: Next.js
Backend: FastAPI or Node.js
Database: PostgreSQL
File storage: S3 / Google Cloud Storage
Search: OpenSearch / Meilisearch
Graph layer: Neo4j or PostgreSQL relationships
AI layer: RAG over documents, quotes, drawings and learnings
Semantic export: JSON-LD + IFC references + COBie-style handover sheets
```

# 17. My recommended MVP data model

For the first version of your residence website and future business platform, do not overbuild the full BIM layer. Start with this:

```text
Project
Space
Document
Vendor
Quote
QuoteLineItem
BOQLineItem
Product
Material
WorkPackage
Issue
Decision
Learning
ProcurementItem
Warranty
HandoverAsset
Classification
IDSChecklist
```

That gives you a strong homeowner-centered model, while still being aligned to Schema.org, IFC, BCF, openCDE, bSDD, IDS and COBie.

[1]: https://www.buildingsmart.org/standards/?utm_source=chatgpt.com "Solutions and Standards"
[2]: https://technical.buildingsmart.org/standards/ifc/mvd/?utm_source=chatgpt.com "Model View Definitions (MVD) - buildingSMART Technical"
[3]: https://nibs.org/nbims/v3/cobie/?utm_source=chatgpt.com "COBie standardized"
[4]: https://www.buildingsmart.org/standards/bsi-standards/bim-collaboration-format/?utm_source=chatgpt.com "BIM Collaboration Format (BCF)"
[5]: https://www.buildingsmart.org/users/services/buildingsmart-data-dictionary/?utm_source=chatgpt.com "buildingSMART Data Dictionary (bSDD)"
[6]: https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/?utm_source=chatgpt.com "Information Delivery Specification (IDS)"
[7]: https://schema.org/Offer?utm_source=chatgpt.com "Offer - Schema.org Type"
[8]: https://schema.org/CreativeWork?utm_source=chatgpt.com "CreativeWork - Schema.org Type"


Yes, Madhu. Think of **semantic export** as one project item being exported in three useful formats:

1. **JSON-LD** for your public website and SEO
2. **IFC references** for linking back to building model objects like room, ceiling, light fixture, wall
3. **COBie-style handover sheet** for future maintenance, warranty, service, and asset tracking

Below is a practical example for a **DALI Driver installed in the Living Room cove lighting**.

---

# Example: Living Room DALI Driver

## 1. JSON-LD export for public website

This is what you can embed on the room page or product/detail page of your website.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://mkalaimalai-residence.github.io/products/dali-driver-living-room-001",
  "name": "DALI Driver for Living Room Cove Lighting",
  "category": "Lighting Automation Component",
  "description": "DALI dimmable driver installed for warm indirect cove lighting in the living room of Kalaimalai Residence.",
  "brand": {
    "@type": "Brand",
    "name": "Fulham"
  },
  "model": "DALI LED Driver 60W",
  "sku": "FULHAM-DALI-60W-LR-001",
  "isRelatedTo": {
    "@type": "Room",
    "@id": "https://mkalaimalai-residence.github.io/spaces/living-room",
    "name": "Living Room"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Control Protocol",
      "value": "DALI"
    },
    {
      "@type": "PropertyValue",
      "name": "Lighting Type",
      "value": "Cove Lighting"
    },
    {
      "@type": "PropertyValue",
      "name": "Color Temperature",
      "value": "3000K"
    },
    {
      "@type": "PropertyValue",
      "name": "Wattage",
      "value": "60W"
    }
  ],
  "warranty": {
    "@type": "WarrantyPromise",
    "durationOfWarranty": {
      "@type": "QuantitativeValue",
      "value": 3,
      "unitText": "Years"
    }
  }
}
```

This helps the website understand that the item is a **Product**, connected to a **Room**, with structured properties like protocol, wattage, color temperature and warranty.

---

## 2. IFC reference export

This links the website/product data to the actual BIM/building element reference.

```json
{
  "project_id": "proj_kalaimalai_residence",
  "space_reference": {
    "ifc_class": "IfcSpace",
    "ifc_global_id": "2xLr9A7bH3B8xLivingRoom",
    "name": "Living Room",
    "floor": "Ground Floor"
  },
  "building_element_reference": {
    "ifc_class": "IfcCovering",
    "ifc_global_id": "1coveCeilingElementLR001",
    "name": "Living Room Cove Ceiling"
  },
  "system_reference": {
    "ifc_class": "IfcSystem",
    "ifc_global_id": "3lightingSystemLR001",
    "name": "Living Room Lighting System"
  },
  "product_reference": {
    "ifc_class": "IfcFlowController",
    "ifc_global_id": "4daliDriverLR001",
    "name": "DALI Driver Living Room 001",
    "predefined_type": "LIGHTINGCONTROL"
  },
  "quantity_reference": {
    "quantity_name": "Driver Count",
    "quantity_value": 1,
    "unit": "Each"
  },
  "related_documents": [
    {
      "document_id": "doc_lighting_plan_lr_v03",
      "title": "Living Room Lighting Plan Rev 03"
    },
    {
      "document_id": "doc_dali_wiring_lr_v02",
      "title": "Living Room DALI Wiring Diagram Rev 02"
    }
  ]
}
```

This is not meant for public display. It is mainly for your internal project system, BIM model, consultant coordination, and future technical traceability.

---

## 3. COBie-style handover sheet

This is the handover format your future maintenance system can use. It can be exported as Excel, Google Sheet, CSV or database table.

### COBie Component Sheet

| Field               | Example value                                             |
| ------------------- | --------------------------------------------------------- |
| Facility            | Kalaimalai Residence                                      |
| Floor               | Ground Floor                                              |
| Space               | Living Room                                               |
| Component Name      | DALI Driver Living Room 001                               |
| Type Name           | DALI LED Driver 60W                                       |
| Category            | Lighting Control Component                                |
| Manufacturer        | Fulham                                                    |
| Model Number        | DALI LED Driver 60W                                       |
| Serial Number       | To be captured during installation                        |
| Installation Date   | 2026-01-15                                                |
| Installed By        | Lighting Contractor                                       |
| Supplier            | Lighting Vendor                                           |
| Warranty Start Date | 2026-01-15                                                |
| Warranty End Date   | 2029-01-14                                                |
| Warranty Duration   | 3 years                                                   |
| Maintenance Manual  | fulham-dali-driver-manual.pdf                             |
| Location Notes      | Above living room cove ceiling access panel               |
| Replacement Notes   | Confirm wattage and DALI compatibility before replacement |
| Status              | Installed                                                 |

---

## 4. Combined semantic export object

This is the useful master object that connects all three worlds.

```json
{
  "asset_id": "asset_dali_driver_lr_001",
  "asset_name": "DALI Driver Living Room 001",
  "project": {
    "project_id": "proj_kalaimalai_residence",
    "name": "Kalaimalai Residence"
  },
  "semantic_web": {
    "schema_org_type": "Product",
    "json_ld_url": "https://mkalaimalai-residence.github.io/products/dali-driver-living-room-001",
    "room_url": "https://mkalaimalai-residence.github.io/spaces/living-room"
  },
  "ifc_reference": {
    "space": {
      "ifc_class": "IfcSpace",
      "ifc_global_id": "2xLr9A7bH3B8xLivingRoom",
      "name": "Living Room"
    },
    "system": {
      "ifc_class": "IfcSystem",
      "ifc_global_id": "3lightingSystemLR001",
      "name": "Living Room Lighting System"
    },
    "element": {
      "ifc_class": "IfcFlowController",
      "ifc_global_id": "4daliDriverLR001",
      "name": "DALI Driver Living Room 001"
    }
  },
  "cobie_handover": {
    "facility": "Kalaimalai Residence",
    "floor": "Ground Floor",
    "space": "Living Room",
    "component_name": "DALI Driver Living Room 001",
    "type_name": "DALI LED Driver 60W",
    "manufacturer": "Fulham",
    "model_number": "DALI LED Driver 60W",
    "installation_date": "2026-01-15",
    "warranty_start_date": "2026-01-15",
    "warranty_end_date": "2029-01-14",
    "maintenance_manual": "fulham-dali-driver-manual.pdf"
  },
  "homeowner_context": {
    "why_selected": "Selected to support dimmable warm indirect lighting scenes in the living room.",
    "related_decision": "Use DALI dimming for premium evening ambience.",
    "related_vendor": "Lighting Contractor",
    "related_quote": "Lighting BOQ Rev 04",
    "maintenance_tip": "Keep access panel location documented for future replacement."
  }
}
```

---

## Simple way to understand it

| Export type              | Audience                                         | Purpose                                                   |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| **JSON-LD**              | Google, public website, SEO, AI search           | Explains what this item is publicly                       |
| **IFC references**       | Architect, BIM model, technical team             | Links item to room, system, building element and quantity |
| **COBie-style handover** | Homeowner, facility manager, future service team | Helps maintain, replace, warranty and service the item    |

For your home platform, this is powerful because every object becomes traceable from **design decision → drawing → installed item → room → vendor → warranty → future maintenance**.

