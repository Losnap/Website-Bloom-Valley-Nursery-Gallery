# Bloom Valley Nursery Website

## Files
- `CSS/styles.css`: Shared styles for all pages.
- `JS/site-alerts.js`: Shared JavaScript alert handlers.
- `HTML/Index.html`: Home page.
- `HTML/Gallery.html`: Gallery page.
- `HTML/About-Us.html`: About Us / contact page.
- `HTML/Customer-Engage.html`: Customer Engage page.

## Alert Handlers
- Footer `Subscribe` button (`.js-subscribe-btn`) on all pages:
  - Alert: `Thank you for subscribing.`
- Gallery `Add to Cart` buttons (`.js-add-cart`):
  - Alert: `Item added to the cart.`
- Gallery `Clear Cart` button (`.js-clear-cart`):
  - Alert: `Cart cleared.`
- Gallery `Process Order` button (`.js-process-order`):
  - Alert: `Thank you for your order.`
- About Us contact `Submit` button (`.js-contact-submit`):
  - Alert: `Thank you for your message.`

## Compliance Checklist
- Front-end expertise:
  - Shared responsive layout and style system in `CSS/styles.css`.
  - Mobile-friendly grids, flexible navigation, and responsive cart modal.
- Data storage and security:
  - Shopping cart uses `sessionStorage` key `bloomValleySessionCart`.
  - About Us form saves feedback/custom orders in `localStorage`.
  - Input validation and sanitization are applied before saving data.
  - Local data is capped to recent records and can be cleared by users.
- Web accessibility:
  - Semantic structure (`header`, `nav`, `main`, `section`, `footer`).
  - Keyboard focus styles and skip link on each page.
  - Dialog accessibility for cart modal (`role="dialog"`, close on `Esc`, focus trap).
  - Live regions and accessible labels for cart/status updates.

