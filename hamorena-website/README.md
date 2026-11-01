# HaMorena Website Project

## Project Title
HaMorena Fine Watches &amp; Men's Accessories &ndash; Website (WEDE5020 Portfolio of Evidence)

## Student Information
- Student Name: Naledi Mohoje
- Business: Star_Works &ndash; Web Design &amp; Development
- Module: Web Development (Introduction) &ndash; WEDE5020

## Project Overview
This project is the development of a responsive, functional website for
HaMorena Fine Watches & Men's Accessories, a South African men's
accessories retailer with stores in Sandton, Cape Town (V&A Waterfront)
and Umhlanga, Durban. The website showcases HaMorena's product range
(watches, chains, belts and shoes), and is being built in three parts
across the module's Portfolio of Evidence: HTML foundation (Part 1),
CSS styling and responsive design (Part 2), and JavaScript
functionality and SEO (Part 3).

## Website Goals and Objectives
- Build a basic online store so HaMorena isn't only relying on people
  walking into a mall store.
- Let customers browse products online and enquire about purchasing.
- Let customers request to "Reserve to Try In-Store" for watches.
- Show up better on Google when people search things like "men's
  watches Johannesburg".

## Key Features and Functionality
- Multi-page responsive website (Home, About Us, Shop, Enquiries,
  Contact).
- Consistent navigation across all pages.
- A product catalogue organised by category (Watches, Chains, Belts,
  Shoes), with an individual page per product.
- Enquiry and contact forms (to be made functional with client-side
  validation in Part 3).
- A cart and checkout page structure (to be made functional in Part 3).
- Store location details for all three HaMorena branches.

## Timeline and Milestones
| Milestone | Description |
|---|---|
| Part 1 | Project initiation, planning, and HTML foundation |
| Part 2 | CSS styling and responsive design |
| Part 3 | JavaScript functionality and SEO optimisation |

## Part 1 Details
Part 1 focused on building the foundation of the HaMorena website:
- Selecting HaMorena as the target organisation, based on Proposal 1 of
  the Star_Works website proposal document.
- Establishing a well-organised file and folder structure, matching the
  structure used for the FORMEZ project.
- Creating the HTML structure for five core pages: `index.html`,
  `about.html`, `services.html` (Shop), `inquiries.html`, and
  `contact.html`.
- Creating 8 individual product pages, organised across the Watches,
  Chains, Belts and Shoes categories.
- Creating `cart.html` and `checkout.html` as static page structures.
- Linking all pages together with a functional navigation menu.
- Adding placeholder product images to the `_images` folder. These are
  simple generated placeholders (no real HaMorena product photography
  was supplied), and should be replaced with real product photos before
  the site is styled in Part 2.

Part 2 and Part 3 details will follow in future submissions/edits.

## Sitemap
```
HaMorena Website
|
|-- Home (index.html)
|-- About Us (about.html)
|-- Shop (services.html)
|   |-- Classic Steel Watch (product-classic-steel-watch.html)
|   |-- Gold-Tone Dress Watch (product-gold-dress-watch.html)
|   |-- Chronograph Watch (product-chronograph-watch.html)
|   |-- Gold Curb Chain (product-gold-curb-chain.html)
|   |-- Silver Rope Chain (product-silver-rope-chain.html)
|   |-- Leather Belt - Black (product-leather-belt-black.html)
|   |-- Leather Belt - Tan (product-leather-belt-tan.html)
|   `-- Leather Dress Shoes (product-leather-dress-shoes.html)
|-- Enquiries (inquiries.html)
|-- Contact (contact.html)
|-- Cart (cart.html)
`-- Checkout (checkout.html)
```

## File Structure
```
/
|-- index.html
|-- about.html
|-- services.html
|-- inquiries.html
|-- contact.html
|-- cart.html
|-- checkout.html
|-- product-classic-steel-watch.html
|-- product-gold-dress-watch.html
|-- product-chronograph-watch.html
|-- product-gold-curb-chain.html
|-- product-silver-rope-chain.html
|-- product-leather-belt-black.html
|-- product-leather-belt-tan.html
|-- product-leather-dress-shoes.html
|-- _images/        (product and site images - currently placeholders)
|-- css_assets/     (CSS files - to be added in Part 2)
|-- js_assets/      (JavaScript files - to be added in Part 3)
|-- private/        (project working files not published on the site)
`-- README.md
```

Note: the site has 15 HTML pages in total (5 core pages plus 8
individual product pages, a cart page, and a checkout page). These
additional pages are documented here, since the brief's minimum is 5
pages.

## Changelog
### Part 1
- Set up project folder structure (`_images`, `css_assets`, `js_assets`,
  `private`), matching the structure used for the FORMEZ project.
- Added placeholder product images to `_images` (to be replaced with
  real HaMorena product photography).
- Created HTML structure and content for `index.html`, `about.html`,
  `services.html`, `inquiries.html`, and `contact.html`.
- Added 8 individual product pages (`product-*.html`), each displaying
  the product's image, category, description, price in Rands, and a
  form (size, colour, quantity, Add to Cart) as static HTML.
- Added `cart.html` and `checkout.html` as static page structures for
  the future shopping cart and checkout flow.
- Linked navigation across all pages.
- **Note on scope:** these pages are HTML structure only, with no CSS
  or JavaScript. The "Add to Cart" forms, cart contents, and order
  totals are not yet functional &ndash; this will be implemented with
  JavaScript in Part 3, as specified in the module brief.

## References
- The Independent Institute of Education (Pty) Ltd, 2026. *WEDE5020
  Portfolio of Evidence*. Module guide. IIE.
- Content sourced from the Star_Works Website Proposal for HaMorena
  (Proposals_WEDE_Naledi_.docx, Proposal 1).
