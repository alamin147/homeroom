# Adding a feature

This example adds a Weather dashboard widget without changing the dashboard renderer.

## 1. Create the feature

```text
src/features/weather/
  components/WeatherWidget.tsx
  useWeather.ts
  types.ts
  index.ts
```

Keep provider response shapes in `types.ts` and export only the hook/widget from `index.ts`.

## 2. Define a provider

Create `src/providers/weather/weatherProvider.ts`:

```ts
import type { WeatherSnapshot } from "../../features/weather/types";

export interface WeatherProvider {
  current(): Promise<WeatherSnapshot>;
}

export const weatherProvider: WeatherProvider = {
  async current() {
    // Fetch, invoke Tauri, or read a cache here.
    throw new Error("Provider not configured");
  },
};
```

The widget calls a feature hook; it does not fetch or invoke Tauri directly.

## 3. Register the widget

At feature initialization:

```ts
widgetRegistry.register({
  type: "weather",
  title: "Weather",
  component: WeatherWidget,
  defaultSize: "small",
  order: 40,
});
```

Home reads the registry automatically. No Home switch statement is needed.

## 4. Add a page only if needed

For a full page, lazy-load it in the composition root:

```ts
routeRegistry.register({
  id: "weather",
  title: "Weather",
  path: "/weather",
  icon: CloudSun,
  order: 40,
  component: lazy(() => import("../features/weather")),
});
```

The sidebar is generated from route metadata.

## 5. Add search or actions only when useful

Implement `SearchProvider` and register it with `searchRegistry`. Register entity actions through `actionRegistry`; do not put Weather-specific branches in the palette.

## 6. Add namespaced settings

Extend `SettingKey` with entries such as `weather.location` and `weather.units`. The feature owns their controls and defaults.

## 7. Keep failures isolated

Convert provider errors to safe `AppError` values, render a retry state inside the widget, and cache data with an explicit expiry. Use `subscribeToJob("weather.current", interval, task)` if more than one consumer needs refreshes.

## Completion check

- Feature code is under one feature directory.
- UI depends on a provider, not a data source.
- Route/widget/search additions use registries.
- Settings are namespaced.
- Provider failure does not break Home.
- Page is lazy-loaded.
- Native inputs are structured and validated.
