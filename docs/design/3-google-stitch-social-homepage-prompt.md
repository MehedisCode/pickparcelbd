# Google Stitch prompt — PickParcelBD social-commerce homepage

Copy the prompt below into a new Google Stitch conversation. It is self-contained and leaves the color palette to the designer.

---

Design a complete, attractive, responsive homepage for **PickParcelBD**, a Bangladesh-based social marketplace with parcel delivery.

This is a fresh conversation. Use this brief as the full context; there is no existing design attached.

## Product concept

PickParcelBD combines:

- Buying and selling products.
- Public seller profiles and following.
- Messaging and notifications.
- Orders and cash memos.
- Parcel booking and tracking.
- Ride sharing.
- Personal, seller, rider, agent, and admin workspaces.

The homepage should feel like an everyday social-commerce application. People should immediately discover products posted by individuals and businesses.

Take inspiration from Facebook's familiar feed structure and Instagram's strong product imagery, but create an original identity. Do not copy their branding or exact interface.

This is a shopping community with delivery services, not a general-purpose social network.

## Primary design goal

Create a polished, welcoming product feed that makes these actions obvious:

1. Discover products.
2. Visit or follow a seller.
3. View a product or add it to the cart.
4. Post a product for sale.
5. Book or track a parcel.

Prioritize visual quality, clear hierarchy, and comfortable browsing. Preserve access to secondary features without filling the homepage with every tool.

Do not create a marketing landing page, an admin dashboard, or a conventional ecommerce grid.

## Brand and visual direction

**Brand name:** PickParcelBD.

**Audience:** Individuals and small businesses across Bangladesh.

Choose the color palette that best suits an attractive, trustworthy social-commerce experience. You have full creative freedom over colors; do not inherit a fixed palette from earlier designs or instructions.

Create a cohesive visual system with:

- Clear primary and secondary actions.
- Comfortable feed backgrounds and surfaces.
- Accessible text contrast.
- Distinct navigation, feedback, and status states that do not rely on color alone.
- Restrained shadows, balanced spacing, and consistent icons.
- Modern typography with excellent Bengali readability.

Use Noto Sans Bengali or a comparable Bengali-capable font. Use natural Bengali text as the primary interface language and provide an English switch. Ensure proper wrapping and spacing for Bengali labels.

Make the result polished, welcoming, and distinctive. Avoid visual clutter, excessive gradients, glass effects, oversized headings, and decorative animation.

Prioritize visual quality and usability over matching existing brand colors.

## First screen

The first screen should immediately show:

- A compact header.
- A small product composer.
- Feed/category controls.
- The first product post.

Do not place a large hero banner, promotional statistics, testimonials, or large category blocks above the feed.

## Desktop layout

Use a balanced three-column layout on wide desktop screens.

### Compact sticky header

- PickParcelBD logo.
- Prominent product/seller search.
- Home/feed navigation.
- Messages.
- Notifications.
- Cart with quantity badge.
- বাংলা / English switch.
- Profile menu when signed in.
- Continue with Google when signed out.

### Left navigation sidebar

Primary destinations:

- Home feed.
- Following.
- Marketplace.
- My workspace.
- Orders.
- Book a parcel.
- Track a parcel.
- Ride share.
- Help and support.

Put additional destinations inside expandable workspace/profile navigation:

- My products.
- Cash memos.
- Wallet.
- Account settings.
- Relevant rider/agent operations.
- Admin tools for authorized users only.

Do not design all these destination pages. Preserve their navigation entry points. Show personal tools only when signed in and operational tools only for appropriate roles.

### Center feed

- Compact product composer.
- Feed selection.
- Small category chips and filter/sort controls.
- Single-column product posts.
- Load more control.
- Loading and empty states.

Aim for a center feed approximately 600–680px wide where space permits. Use a restrained maximum width for the overall layout.

### Right utility sidebar

- Suggested sellers with Follow actions.
- Compact parcel tracking field.
- Small Book a parcel shortcut.
- Optional signed-in order/parcel summary.
- Small terms and support links.

Keep this sidebar visually secondary. Avoid large promotional cards.

## Product composer

Create a compact social-style composer:

- User avatar.
- Prompt: “আপনার পণ্য বিক্রি করতে চান?”
- Primary action: “পণ্য পোস্ট করুন”.
- Secondary action: “পার্সেল বুক করুন”.

Post product should lead to a structured product form rather than a generic status update. Support appropriate fields such as title, description, category, price, and media, with clear validation.

Parcel booking should lead to its own structured form. Do not mix booking and product fields.

Visitors can browse without signing in. Actions requiring an account should show a Google sign-in prompt and preserve the intended destination.

## Product feed

The default feed shows products from **all sellers**. Following sellers is optional and must not be required to browse products.

Include All products and Following feed selections. A Following feed can use local mock data; do not assume its aggregation API already exists.

Use substantial single-column product posts. Do not turn the main feed into a multi-column product grid or masonry gallery.

Preserve scroll position when returning from product details.

## Product post anatomy

### Seller header

- Avatar or business logo.
- Seller name linking to the public profile.
- Verification badge only when supplied by the data.
- Public district/locality.
- Posting time when supplied.
- Follow / Following button.
- Overflow menu with edit/delete actions only for the product owner.

### Product content

- Clear product title.
- Short description with Read more.
- Large, attractive product photograph.
- Consistent image treatment and reserved image dimensions.
- Accessible image viewing.
- Sensible fallback for missing images.
- Support for existing external-media previews when appropriate, without automatic playback.

### Commerce information

- Prominent price in Bangladeshi taka.
- Original price and discount only when relevant.
- Category.
- Availability only when supplied.
- Clear Add to cart action.
- Secondary View product action.
- Visible feedback after adding to cart.

### Supporting actions

- Share product link.
- Message seller through the appropriate messaging flow.
- Seller profile access.

Keep shopping actions distinct from secondary social actions. Avoid an overloaded row of equally prominent buttons.

## Existing features to preserve

The legacy PickParcelBD application includes:

- Google sign-in and profile completion.
- Public profiles and public IDs.
- Verification/member badges.
- Follow/unfollow and follower information.
- Profile news/status.
- Profile comments and profile sharing.
- Messaging and unread notifications.
- Presence indicators.
- Public phone privacy preferences.
- Product management, discounts, and external media.
- Cart and orders.
- Cash memos and payment-proof workflows.
- Order-to-parcel conversion.
- Direct parcel booking and tracking.
- Delivery and operational workspaces.
- Wallet and financial tools.
- Ride sharing.

Preserve access through logical navigation and contextual actions. Do not put the full operational workflows on the homepage or imply that every backend integration is already verified.

Important feature boundaries:

- Existing comments belong to profiles, not individual products.
- Do not invent product-comment, product-like, or review systems as existing functionality.
- Product sharing is separate from profile-sharing counters.
- Show phone numbers only when the owner permits public display.
- Show online status only when reliable data exists.
- Verification badges must represent actual verification data.
- Do not fabricate ratings, sales totals, engagement counts, delivery guarantees, or user statistics.
- An optional save/wishlist prototype must not be portrayed as a persisted backend feature.

Seller profile news can appear as a small profile preview or update. Do not introduce a new general-purpose social publishing system.

Do not add Stories, Reels, livestreams, or autoplay videos.

## Search, categories, and filters

Provide compact product/seller search.

Categories:

- সব পণ্য / All products.
- ফ্যাশন / Fashion.
- ইলেকট্রনিক্স / Electronics.
- খাবার / Food.
- বিউটি / Beauty.
- ঘর ও জীবনযাপন / Home.
- অন্যান্য / Other.

Use horizontal chips rather than a large category directory.

Include newest sorting, price sorting, active filter indicators, and Clear filters. Provide separate empty-feed and no-search-results states.

Preserve the surrounding feed layout when filters change.

## Mobile design

Make the mobile experience feel like a polished social shopping application.

- Single full-width feed.
- Compact sticky header.
- Search easily accessible.
- Messages, notifications, and cart easy to find.
- Fixed five-item bottom navigation: Home, Search, Post, Parcels, Profile.
- Recognizable central Post action.
- Additional destinations in a More/profile menu.
- Sidebar content moved into drawers, sheets, or compact sections.
- Cart opens in an appropriate mobile sheet.
- Filters use a mobile-friendly sheet.
- Product and parcel forms remain usable with the keyboard open.

Avoid excessive stacked headers that consume the first screen.

## Responsive requirements

Design and verify at **360px, 390px, 768px, 1024px, and 1440px**.

- **Phone:** one feed column, no permanent sidebars, bottom navigation.
- **Tablet:** one feed with one sidebar where space permits; collapse the other sidebar.
- **Wide desktop:** three columns; center feed remains readable rather than stretching excessively.

At every width:

- No horizontal page overflow.
- Bengali text wraps correctly.
- Touch targets are at least 44px.
- Sticky controls do not obscure content.
- Bottom navigation respects device safe areas.
- Dialogs fit the viewport and support scrolling when necessary.
- Keyboard navigation, visible focus states, semantic labels, and sufficient contrast are provided.
- Hover is not the only way to discover an action.

## Content examples

Use a small, coherent set of realistic Bangladesh product examples:

- Handwoven Jamdani saree from Tangail.
- Sundarbans honey.
- Handmade leather sandals.
- Nakshi Kantha cushion covers.
- Smartphone accessories.
- Seasonal mangoes from Rajshahi.

Use realistic Bangladeshi prices and natural Bengali descriptions. Use varied product photography and seller identities.

Treat example people, counters, timestamps, and transactions as illustrative mock data, not verified business claims.

## Interactions and states

Show coherent interactions where supported:

- Search and category selection.
- All products / Following.
- Follow/unfollow.
- Add to cart and quantity changes.
- Product details and return to feed.
- Product-posting form.
- Parcel-booking form.
- Share-link feedback.
- Messages and notifications menus.
- Language switching.
- Mobile navigation.
- Load more.
- Retry after an error.

Include feed-shaped loading skeletons, no products yet, no matching search results, request failure with Retry, unavailable product, missing image, signed-out prompts, and signed-in navigation.

Use local mock state for any prototype. Never imply that a real payment, order, message, upload, or booking was completed.

## Performance and scope

Keep design generation and the prototype lightweight:

- Produce one cohesive design direction, not multiple alternatives.
- Focus on the homepage and essential overlay states.
- Do not build every destination page.
- Reuse components and existing dependencies if a code project is provided.
- Use a small initial set of posts with Load more while keeping all products accessible through pagination.
- Lazy-load below-the-fold images; avoid delaying the first visible product image unnecessarily.
- Reserve image dimensions to avoid layout shifts.
- Avoid heavy animation, autoplay media, and decorative video.
- Do not load external social-media players automatically.
- Prefer available image assets over generating a separate custom image for every item.
- Avoid unnecessary dependencies, external API calls, repeated polling, and expensive decorative effects.
- Use CSS-driven responsive layouts and respect reduced-motion preferences.
- Do not generate extra screens solely to demonstrate navigation.

If generating code, use reusable React/TypeScript components suitable for later integration into a Next.js frontend with a Laravel API.

Do not generate backend services, database changes, authentication infrastructure, or deployment configuration.

## Deliverable

Deliver a visually polished, responsive PickParcelBD social-commerce homepage with:

1. A mobile layout around 390px.
2. A desktop layout around 1440px.
3. Responsive behavior for intermediate widths.
4. Essential interaction and loading/error states where supported.

Use a component structure such as AppHeader, FeedLayout, NavigationSidebar, ProductComposer, FeedFilters, ProductFeedPost, SuggestedSellers, DeliveryQuickActions, and MobileBottomNavigation.

The result should immediately feel like a community marketplace: people and businesses posting products, shoppers discovering them, and delivery tools close at hand.

Prioritize the finished visual design and clear user journeys over adding more features. Briefly identify any prototype-only interactions.
