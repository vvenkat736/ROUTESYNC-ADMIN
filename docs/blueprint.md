# **App Name**: RouteSync ADMIN

## Core Features:

- Interactive Map: Display interactive OpenStreetMap with live bus locations, routes, and status color coding (Green, Orange, Grey). Provide hover/click info: bus number, route, driver, status, with real-time updates.
- Fleet Overview: Display summary cards: Total, Active, Delayed, Inactive buses. Include filters by route, bus number, driver name, and color-coded quick glance indicators.
- Real-time Analytics: Display real-time charts for trips per day, delays per route, active vs. inactive buses, and SOS alerts, with automatic refresh. Also display Carbon Footprint Chart comparing CO₂ savings.
- CSV Route Import: Enable importing routes from CSV/Excel files (Route ID, stops, lat/lng, distances, ETA, frequency, bus type). Imported routes should auto-appear on the map and should enable Edit/Delete/Update.
- Alerting: Provide real-time notifications for SOS alerts, delayed buses, and inactive buses.
- Bilingual UI: Offer a toggle switch for Tamil/English translations for UI text, labels, and stop names.
- Theme Customization: Offer Light/Dark theme switch.

## Style Guidelines:

- Primary color: Deep Blue (#293462) to represent trust and reliability.
- Background color: Light gray (#F0F0F0) for light mode, charcoal gray (#333333) for dark mode.
- Accent color: Orange (#FF7F50) for CTAs and interactive elements.
- Headline font: 'Poppins' (sans-serif) for a geometric, contemporary feel.
- Body font: 'PT Sans' (sans-serif) for legibility and a modern touch.
- Use simple, clear icons to represent bus status, routes, and alerts. Incorporate map markers to indicate locations. Favor FontAwesome.
- Modern dashboard layout with rounded cards and smooth transitions. Ensure responsiveness for desktop & tablet.
- Employ subtle animations to enhance user experience when data updates or when users are navigating to a new UI. Prefer Framer Motion.
- Loading screen: Black and orange themed with 'RouteSync' (app name) popping up after 1-100 loading bar above which a blue bus runs towards a GPS pointer