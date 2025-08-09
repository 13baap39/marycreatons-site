# Mary Creations — marycreations.shop

Static website for Mary Creations (women's stoles), deployable on GitHub Pages with custom domain marycreations.shop.

Includes:
- Home, Shop, Product, About, Contact, FAQ, Reviews, Shipping/Returns, Privacy pages
- Light/Dark theme toggle, search, price filter, WhatsApp floating button
- Client-side Admin page to manage products, settings, and reviews via JSON

Structure:
- /assets/css/styles.css
- /assets/js/*.js
- /data/settings.json, /data/products.json, /data/reviews.json
- /CNAME (custom domain)

Deploy (GitHub Pages):
1. Settings → Pages → Source: Deploy from a branch → Branch: main (/root)
2. Add custom domain: marycreations.shop and enable Enforce HTTPS.

Admin usage:
- Open /admin.html to edit settings/products/reviews and download updated JSON files for /data/.