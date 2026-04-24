# RR Admin Parity Matrix

This matrix tracks route parity between `/home/nikesh/rr` and `Nepalixx`.

## Route Parity

| RR Route | Nepalixx Route | Status |
| --- | --- | --- |
| `/admin` | `/admin` | Implemented |
| `/admin/profile` | `/admin/profile` | Implemented |
| `/admin/analytics` | `/admin/analytics` | Implemented |
| `/admin/marketing` | `/admin/marketing` | Implemented |
| `/admin/logs` | `/admin/logs` | Added (placeholder route) |
| `/admin/promo-codes` | `/admin/promo-codes` | Implemented |
| `/admin/products` | `/admin/products` | Implemented |
| `/admin/products/new` | `/admin/products/new` | Added (points to products page) |
| `/admin/products/layout` | `/admin/products/layout` | Added (placeholder page) |
| `/admin/inventory` | `/admin/inventory` | Implemented |
| `/admin/inventory/light` | `/admin/inventory/light` | Added (mapped to inventory) |
| `/admin/inventory/platinum` | `/admin/inventory/platinum` | Added (mapped to inventory) |
| `/admin/orders` | `/admin/orders` | Implemented |
| `/admin/orders/new` | `/admin/orders/new` | Added (placeholder page) |
| `/admin/customers` | `/admin/customers` | Implemented |
| `/admin/messages` | `/admin/messages` | Implemented |
| `/admin/store-users` | `/admin/store-users` | Implemented |
| `/admin/store-users/:id` | `/admin/store-users/:id` | Added (mapped to users page) |
| `/admin/bills` | `/admin/bills` | Implemented |
| `/admin/pos` | `/admin/pos` | Added (placeholder page) |
| `/admin/images` | `/admin/images` | Added (placeholder page) |
| `/admin/buckets` | `/admin/buckets` | Added (placeholder page) |
| `/admin/storefront-images` | `/admin/storefront-images` | Added (placeholder page) |
| `/admin/notifications` | `/admin/notifications` | Implemented |
| `/admin/dev-font` | `/admin/dev-font` | Added (mapped to profile page) |
| `/admin/landing-page` | `/admin/landing-page` | Added (placeholder page) |
| `/admin/canvas` | `/admin/canvas` | Added (placeholder page) |
| `/admin/canvas/legacy` | `/admin/canvas/legacy` | Added (placeholder page) |
| `/admin/canvas/builder` | `/admin/canvas/builder` | Added (placeholder page) |
| `/admin/canvas/branding` | `/admin/canvas/branding` | Added (placeholder page) |
| `/admin/canvas/theme` | `/admin/canvas/theme` | Added (placeholder page) |

## API Parity Notes

- Core implemented and tenant-hardened in this milestone:
  - Products
  - Orders
  - Customers
  - Inventory
  - Promo codes
  - Marketing
  - Notifications
  - Bills
- Remaining advanced RR modules should be implemented behind these newly enabled routes in follow-up slices:
  - POS order desk and session APIs
  - Media library and bucket APIs
  - Landing/canvas/template APIs
  - Logs/security feed APIs
