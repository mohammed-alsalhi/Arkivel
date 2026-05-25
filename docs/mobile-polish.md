# Mobile Polish

Arkivel v4.94.0 defines the final mobile polish contract for the beta line.

## Surfaces

`GET /api/mobile-polish` publishes responsive QA checkpoints for:

- Mobile navigation
- Article actions
- Editor trays
- Admin panels
- Marketplace pages
- Customization previews

## Viewports

Every flagship surface and admin page should be checked at:

- Phone: `390x844`
- Tablet: `768x1024`
- Laptop: `1366x768`
- Wide desktop: `1440x1100`

## Regression Checklist

- No horizontal overflow at any QA viewport.
- No clipped button, tab, chip, badge, or table header text.
- Touch targets are at least 44px tall on phone and tablet.
- Safe-area padding protects bottom navigation, drawers, and sticky actions.
- Dialogs and popovers remain inside the viewport and can be dismissed.
- Editor trays, admin filters, marketplace detail panels, and customization previews wrap without overlapping.

## Help Screenshots

The mobile help set should include the mobile home bottom navigation, mobile article actions, and mobile editor trays. Screenshot paths are reserved under `docs/screenshots/` so release candidates can attach actual captures without changing the contract.
