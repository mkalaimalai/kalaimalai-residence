"""Generate a Postman v2.1 collection for the Kalaimalai Residence API.

Mirrors the routers wired in app/bootstrap.py. Run from api/:

    python scripts/gen_postman.py

Writes kalaimalai-residence.postman_collection.json next to api/README.md.
Regenerate whenever endpoints or request schemas change.
"""
from __future__ import annotations

import json
from pathlib import Path

BASE = "{{baseUrl}}"


def body(obj: dict) -> dict:
    return {
        "mode": "raw",
        "raw": json.dumps(obj, indent=2),
        "options": {"raw": {"language": "json"}},
    }


def req(name, method, path_segments, *, query=None, json_body=None, desc=""):
    """One request. path_segments is a list; {{var}} segments allowed."""
    url = {
        "raw": BASE + "/" + "/".join(path_segments),
        "host": [BASE],
        "path": list(path_segments),
    }
    if query:
        url["query"] = [{"key": k, "value": v} for k, v in query.items()]
        url["raw"] += "?" + "&".join(f"{k}={v}" for k, v in query.items())
    r = {
        "name": name,
        "request": {
            "method": method,
            "header": (
                [{"key": "Content-Type", "value": "application/json"}]
                if json_body is not None
                else []
            ),
            "url": url,
            "description": desc,
        },
        "response": [],
    }
    if json_body is not None:
        r["request"]["body"] = body(json_body)
    return r


def folder(name, items, desc=""):
    return {"name": name, "description": desc, "item": items}


# --- example request bodies (from interfaces/schemas.py *Create models) -------------
space_create = {
    "name": "Master Bedroom", "slug": "master-bedroom", "description": "",
    "designIntent": "", "image": "", "domainIds": [], "materialIds": [],
    "furniture": [], "lighting": [], "vendorIds": [], "drawingIds": [],
    "decisionIds": [], "status": "Concept", "lessonIds": [],
}
space_update = {"status": "In Progress", "description": "Updated description"}

domain_create = {
    "name": "Flooring", "slug": "flooring", "description": "",
    "spaceIds": [], "drawingIds": [], "vendorIds": [], "status": "Not Started",
    "lessonIds": [],
}
domain_update = {"status": "In Progress"}

progress_create = {
    "date": "2026-06-20", "phase": "Finishing", "spaceId": "space-master-bedroom",
    "workCompleted": "", "photos": [], "issues": "", "nextAction": "",
    "owner": "Site Engineer", "status": "On Track",
}
progress_update = {"status": "Delayed"}

project_create = {
    "publicTitle": "A Contemporary Zen Residence in Bengaluru", "publicSubtitle": "",
    "city": "Bengaluru", "designer": "", "direction": "", "heroImage": "",
    "conceptStatement": "", "plotArea": "", "builtUpArea": "", "floors": 2,
    "status": "In Progress", "startDate": "2025-01-01", "internalName": "",
    "villaNo": "", "community": "", "address": "",
}
project_update = {"status": "Handover"}

drawing_create = {
    "title": "Ground Floor Plan", "domainId": "", "spaceId": "", "revision": "R0",
    "date": "2026-06-20", "status": "Draft", "consultant": "", "fileUrl": "",
    "notes": "",
}
drawing_update = {"status": "Issued", "revision": "R1"}

gallery_create = {
    "title": "Living Room Render", "category": "render", "image": "",
    "spaceId": "", "domainId": "", "caption": "",
}
gallery_update = {"caption": "Updated caption"}

lesson_create = {
    "title": "Order long-lead items early", "category": "Procurement", "summary": "",
    "domainId": "", "spaceId": "",
    "impact": {"cost": "", "time": "", "quality": "", "design": ""},
}
lesson_update = {"summary": "Updated summary"}

vendor_create = {
    "name": "Acme Interiors", "category": "Carpentry", "contactPerson": "",
    "phone": "", "email": "", "location": "Bengaluru", "website": "",
    "quoteUrl": "", "finalized": False, "rating": 0.0, "notes": "",
}
vendor_update = {"finalized": True, "rating": 4.5}
verification_status = {"status": "Verified"}

boq_create = {
    "vendorId": "", "category": "Civil", "quoteDate": "2026-06-20",
    "originalAmount": 100000, "negotiatedAmount": 95000, "gst": 17100,
    "total": 112100, "paymentStatus": "Unpaid", "fileUrl": "", "notes": "",
}
boq_update = {"paymentStatus": "Paid"}

procurement_create = {
    "item": "Italian Marble", "category": "Flooring", "spaceId": "", "brand": "",
    "vendorId": "", "country": "Italy", "quantity": 1, "estimatedPrice": 0,
    "quotedPrice": 0, "negotiatedPrice": 0, "finalPrice": 0, "currency": "INR",
    "status": "Identified", "deliveryDate": "", "installationDate": "",
    "warranty": "", "notes": "",
}
procurement_update = {"status": "Ordered"}

material_create = {
    "name": "Oak Veneer", "category": "Wood", "spaceIds": [], "vendorId": "",
    "status": "", "image": "", "notes": "",
}
material_update = {"status": "Selected"}

quote_create = {
    "projectId": "project-1", "vendorId": "vendor-1", "boqId": "", "quoteNumber": "",
    "quoteDate": "2026-06-20", "validUntil": "", "totalAmount": 250000,
    "currency": "INR", "taxAmount": 0, "scopeSummary": "", "terms": "",
    "documentId": "", "comparisonStatus": "Pending",
}
quote_approve = {"approvedBy": "Owner", "approvedAmount": 240000, "approvalNote": ""}
quote_action_note = {"note": "Please revise scope and resubmit."}

quote_line_item_create = {
    "quoteId": "quote-1", "boqLineId": "", "description": "Supply & install",
    "quantity": 10, "unit": "sqft", "unitPrice": 500, "totalPrice": 5000,
    "brand": "", "specification": "", "inclusions": "", "exclusions": "",
    "negotiationTargetPrice": 0,
}

po_create = {
    "projectId": "project-1", "quoteId": "", "vendorId": "vendor-1", "amount": 240000,
    "currency": "INR", "status": "Created", "notes": "",
}
po_status = {"status": "Dispatched"}

delivery_create = {
    "purchaseOrderId": "po-1", "projectId": "project-1", "expectedDate": "2026-07-01",
    "actualDate": "", "status": "Planned", "notes": "",
}
delivery_update = {"status": "Delivered", "actualDate": "2026-07-03"}

boq_line_item_create = {
    "boqId": "", "projectId": "", "spaceId": "", "workPackageId": "",
    "description": "Brickwork", "quantity": 100, "unit": "sqft", "benchmarkRate": 0,
    "approvedRate": 0, "approvedVendorId": "", "status": "Estimated",
}

snag_create = {
    "spaceId": "", "category": "Finishing", "description": "Paint smudge on wall",
    "photoUrl": "", "assignedTo": "", "priority": "Low", "status": "Open",
    "targetClosureDate": "", "actualClosureDate": "", "notes": "",
}
snag_update = {"priority": "High"}
snag_assign = {"assignedTo": "Painter Team"}
snag_resolve = {"actualClosureDate": "2026-06-25", "notes": "Repainted and cleaned."}

decision_create = {
    "title": "Marble vs Tile flooring", "domainId": "", "spaceId": "", "type": "Design",
    "optionsConsidered": ["Marble", "Vitrified Tile"], "finalDecision": "Marble",
    "reason": "", "costImpact": "", "timeImpact": "", "qualityImpact": "",
    "date": "2026-06-20", "owner": "Owner", "status": "Open",
}
decision_update = {"status": "Decided"}

inspection_create = {
    "spaceId": "", "workPackageId": "", "inspector": "QA Engineer",
    "inspectionDate": "2026-06-20", "result": "Pending", "notes": "",
}
inspection_update = {"result": "Pass"}

warranty_create = {
    "item": "Air Conditioner", "category": "HVAC", "vendorId": "", "brand": "Daikin",
    "purchaseDate": "2026-06-20", "warrantyStart": "2026-06-20",
    "warrantyEnd": "2031-06-20", "invoiceUrl": "", "manualUrl": "",
    "serviceContact": "", "notes": "",
}
warranty_update = {"serviceContact": "1800-XXX-XXXX"}

notification_create = {
    "channel": "log", "recipient": "owner@example.com",
    "subject": "Quote approved", "body": "Quote quote-1 has been approved.",
    "relatedEntity": "quote-1",
}


def crud(prefix, sample_id, create_obj, update_obj, *, read_public, write_admin=True):
    """Standard 4-verb CRUD folder produced by make_crud_router."""
    seg = prefix.strip("/")
    read = "public" if read_public else "auth (require_user)"
    return [
        req(f"List {seg}", "GET", [seg], desc=f"List all. Read: {read}."),
        req(f"Get {seg} by id", "GET", [seg, sample_id], desc=f"Read: {read}."),
        req(f"Create {seg}", "POST", [seg], json_body=create_obj,
            desc="Admin only (require_admin)."),
        req(f"Update {seg}", "PATCH", [seg, sample_id], json_body=update_obj,
            desc="Admin only. Partial update (exclude_unset)."),
    ]


collection = {
    "info": {
        "name": "Kalaimalai Residence API",
        "description": (
            "DDD/hexagonal FastAPI modular monolith over Supabase Postgres.\n\n"
            "**Setup**\n"
            "1. Set the `baseUrl` variable (default `http://localhost:8099`).\n"
            "2. For authenticated/admin routes, set the `accessToken` variable to a "
            "Supabase JWT (the collection sends it as a Bearer token). In local dev you "
            "can instead run the API with `AUTH_DISABLED=true` and any/no token works.\n\n"
            "**Auth tiers** (api/README.md): public GETs are open (build-time); the "
            "sensitive financial/snag tables and `/project/full` require `require_user`; "
            "all writes require `require_admin` (`user_metadata.role == \"admin\"`)."
        ),
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {
        "type": "bearer",
        "bearer": [{"key": "token", "value": "{{accessToken}}", "type": "string"}],
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:8099"},
        {"key": "accessToken", "value": "", "type": "string"},
    ],
    "item": [
        folder("Health", [req("Health check", "GET", ["healthz"])]),
        folder("Project", [
            *crud("/spaces", "space-master-bedroom", space_create, space_update,
                  read_public=True),
            *crud("/domains", "domain-flooring", domain_create, domain_update,
                  read_public=True),
            *crud("/progress", "progress-1", progress_create, progress_update,
                  read_public=True),
            req("Get public project", "GET", ["project"],
                desc="Anonymized singleton. Public."),
            req("Get full project", "GET", ["project", "full"],
                desc="Sensitive identity/location. Auth (require_user)."),
            req("Update project (singleton)", "PATCH", ["project", "{{projectId}}"],
                json_body=project_update, desc="Admin only."),
            req("List projects", "GET", ["projects"], desc="Auth (require_user)."),
            req("Create project", "POST", ["projects"], json_body=project_create,
                desc="Admin only."),
            req("Get project by id", "GET", ["projects", "{{projectId}}"],
                desc="Auth (require_user)."),
            req("Update project by id", "PATCH", ["projects", "{{projectId}}"],
                json_body=project_update, desc="Admin only."),
            req("List project spaces", "GET", ["projects", "{{projectId}}", "spaces"],
                desc="Nested read (single-project semantics)."),
            req("Create project space", "POST", ["projects", "{{projectId}}", "spaces"],
                json_body=space_create, desc="Admin only."),
        ]),
        folder("Document", [
            *crud("/drawings", "drawing-1", drawing_create, drawing_update,
                  read_public=True),
            *crud("/gallery", "gallery-1", gallery_create, gallery_update,
                  read_public=True),
            *crud("/lessons", "lesson-1", lesson_create, lesson_update,
                  read_public=True),
        ]),
        folder("Vendor", [
            req("List vendors", "GET", ["vendors"], desc="Public."),
            req("Get vendor by id", "GET", ["vendors", "{{vendorId}}"], desc="Public."),
            req("Create vendor", "POST", ["vendors"], json_body=vendor_create,
                desc="Admin only."),
            req("Update vendor", "PATCH", ["vendors", "{{vendorId}}"],
                json_body=vendor_update, desc="Admin only."),
            req("Get vendor ratings", "GET", ["vendors", "{{vendorId}}", "ratings"],
                desc="Public. Schema.org-style rating projection."),
            req("Set verification status", "PATCH",
                ["vendors", "{{vendorId}}", "verification-status"],
                json_body=verification_status,
                desc="Admin only. Unverified|Verified|Preferred → finalized flag."),
        ]),
        folder("Commercial", [
            *crud("/boq", "boq-1", boq_create, boq_update, read_public=False),
            *crud("/procurement", "procurement-1", procurement_create,
                  procurement_update, read_public=False),
            *crud("/materials", "material-1", material_create, material_update,
                  read_public=True),
            # Quotes
            req("List quotes", "GET", ["quotes"], desc="Auth (require_user)."),
            req("Submit quote", "POST", ["quotes"], json_body=quote_create,
                desc="Admin only."),
            req("Get quote by id", "GET", ["quotes", "{{quoteId}}"],
                desc="Auth (require_user)."),
            req("Get quote line items", "GET",
                ["quotes", "{{quoteId}}", "line-items"], desc="Auth (require_user)."),
            req("Approve quote", "POST", ["quotes", "{{quoteId}}", "approve"],
                json_body=quote_approve,
                desc="Admin only. Quote→PurchaseOrder flow; notifies vendor."),
            req("Reject quote", "POST", ["quotes", "{{quoteId}}", "reject"],
                json_body=quote_action_note, desc="Admin only."),
            req("Negotiate quote", "POST", ["quotes", "{{quoteId}}", "negotiate"],
                json_body=quote_action_note, desc="Admin only."),
            *crud("/quote-line-items", "qli-1", quote_line_item_create,
                  quote_line_item_create, read_public=False),
            # Purchase orders
            req("List purchase orders", "GET", ["purchase-orders"],
                desc="Auth (require_user)."),
            req("Create purchase order", "POST", ["purchase-orders"],
                json_body=po_create, desc="Admin only."),
            req("Get purchase order by id", "GET", ["purchase-orders", "{{poId}}"],
                desc="Auth (require_user)."),
            req("Set purchase order status", "PATCH",
                ["purchase-orders", "{{poId}}", "status"], json_body=po_status,
                desc="Admin only."),
            # Deliveries
            *crud("/deliveries", "delivery-1", delivery_create, delivery_update,
                  read_public=False),
            # BOQ packages (§6 shape)
            req("List BOQ packages", "GET", ["boq-packages"],
                desc="Auth (require_user)."),
            req("Create BOQ package", "POST", ["boq-packages"], json_body=boq_create,
                desc="Admin only."),
            req("Get BOQ package by id", "GET", ["boq-packages", "{{boqId}}"],
                desc="Auth (require_user)."),
            req("List BOQ package line items", "GET",
                ["boq-packages", "{{boqId}}", "line-items"],
                desc="Auth (require_user)."),
            req("Add BOQ package line item", "POST",
                ["boq-packages", "{{boqId}}", "line-items"],
                json_body=boq_line_item_create, desc="Admin only."),
            # Project-nested commercial reads
            req("List project quotes (comparison)", "GET",
                ["projects", "{{projectId}}", "quotes"], desc="Auth (require_user)."),
            req("List project purchase orders", "GET",
                ["projects", "{{projectId}}", "purchase-orders"],
                desc="Auth (require_user)."),
            req("List project deliveries", "GET",
                ["projects", "{{projectId}}", "deliveries"],
                desc="Auth (require_user)."),
        ]),
        folder("Quality", [
            *crud("/snags", "snag-1", snag_create, snag_update, read_public=False),
            *crud("/decisions", "decision-1", decision_create, decision_update,
                  read_public=True),
            *crud("/inspections", "inspection-1", inspection_create, inspection_update,
                  read_public=False),
            req("Assign snag", "PATCH", ["snags", "{{snagId}}", "assign"],
                json_body=snag_assign, desc="Admin only. → status In Progress."),
            req("Resolve snag", "PATCH", ["snags", "{{snagId}}", "resolve"],
                json_body=snag_resolve, desc="Admin only. → status Fixed."),
            req("Close snag", "PATCH", ["snags", "{{snagId}}", "close"],
                desc="Admin only. → status Closed."),
            req("List project snags", "GET", ["projects", "{{projectId}}", "snags"],
                desc="Admin only."),
            req("List project inspections", "GET",
                ["projects", "{{projectId}}", "inspections"], desc="Admin only."),
        ]),
        folder("Handover", [
            *crud("/warranties", "warranty-1", warranty_create, warranty_update,
                  read_public=False),
        ]),
        folder("Notification", [
            req("List notifications", "GET", ["notifications"],
                desc="Auth (require_user). Audit log."),
            req("Send notification", "POST", ["notifications"],
                json_body=notification_create, desc="Admin only. Manual send."),
        ]),
    ],
}

out = Path(__file__).resolve().parent.parent / "kalaimalai-residence.postman_collection.json"
out.write_text(json.dumps(collection, indent=2) + "\n")
print(f"wrote {out} ({len(collection['item'])} folders)")
