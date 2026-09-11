# Crib Society — User Flow

## 1. Guest Flow
Landing → Explore Menu → Product Detail → Start Order / CTA → Order Summary → Confirmation State

## 2. Staff POS Flow
Login → Staff Dashboard/POS → Select Category → Select Product → Add to Cart → Adjust Quantity → Review Cart → Select Payment Method → Confirm Payment → Receipt/Success → New Order

## 3. Staff Operational Flow
Login → Staff Dashboard → Today's Orders → Open Order → Update Status → Confirm → Activity Updated

## 4. Owner Flow
Login → Owner Dashboard → KPI Overview → Sales/Orders → Product Management → Create/Edit Product → Save → Updated Product List

## 5. Product Management Flow
Products → Filter/Search → Add Product OR Edit Product → Form Validation → Save → Success Feedback → List Refresh

## 6. Error / Recovery Flows
Invalid form → Inline validation → Correct input → Submit
Failed action → Error feedback → Retry
Empty dataset → Empty state → Primary action
Unsaved changes → Confirmation → Stay / Discard

## 7. Navigation Principle
Public navigation and authenticated application navigation are separate. Owner and staff receive role-aware navigation generated from configuration, not hardcoded markup.
