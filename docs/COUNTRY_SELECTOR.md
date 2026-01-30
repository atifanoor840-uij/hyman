# Country Selector Component

## Overview

Professional country selector component with flag emojis, search functionality, and smooth animations for the signup form.

## Features

✅ **50+ Countries** - Comprehensive list of major countries worldwide
✅ **Flag Icons** - SVG flag emojis for each country
✅ **Search Functionality** - Real-time search/filter countries
✅ **Smooth Animations** - Professional transitions and interactions
✅ **Keyboard Accessible** - Fully keyboard navigable
✅ **Click Outside to Close** - Closes dropdown when clicking outside
✅ **Clear Selection** - X button to clear selected country
✅ **Error State** - Shows validation errors
✅ **Disabled State** - Can be disabled during form submission
✅ **Mobile Responsive** - Works perfectly on all screen sizes

## Visual Design

### Selected State
```
┌─────────────────────────────────────────────┐
│  🇺🇸  United States                       ▼ │
└─────────────────────────────────────────────┘
```

### Dropdown Open
```
┌─────────────────────────────────────────────┐
│  🔍  Search countries...                  × │
├─────────────────────────────────────────────┤
│  🇺🇸  United States                         │ ← Selected (dark bg)
│  🇬🇧  United Kingdom                        │
│  🇨🇦  Canada                                │
│  🇦🇺  Australia                             │
│  🇩🇪  Germany                               │
│  ...                                        │
└─────────────────────────────────────────────┘
```

## Usage

### Basic Implementation

```tsx
import CountrySelector from '../components/CountrySelector';

<CountrySelector
  value={formData.country}
  onChange={(value) => setFormData({ ...formData, country: value })}
/>
```

### With Error Handling

```tsx
<CountrySelector
  value={formData.country}
  onChange={(value) => {
    setFormData({ ...formData, country: value });
    if (errors.country) {
      setErrors({ ...errors, country: undefined });
    }
  }}
  error={errors.country}
  disabled={isLoading}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Currently selected country name |
| `onChange` | `(value: string) => void` | Yes | - | Callback when country is selected |
| `error` | `string` | No | `undefined` | Error message to display |
| `disabled` | `boolean` | No | `false` | Disable the selector |

## Available Countries

The component includes 50 major countries:

### North America
- 🇺🇸 United States
- 🇨🇦 Canada
- 🇲🇽 Mexico

### Europe
- 🇬🇧 United Kingdom
- 🇩🇪 Germany
- 🇫🇷 France
- 🇪🇸 Spain
- 🇮🇹 Italy
- 🇳🇱 Netherlands
- 🇨🇭 Switzerland
- 🇧🇪 Belgium
- 🇦🇹 Austria
- 🇸🇪 Sweden
- 🇳🇴 Norway
- 🇩🇰 Denmark
- 🇫🇮 Finland
- 🇵🇱 Poland
- 🇵🇹 Portugal
- 🇬🇷 Greece
- 🇹🇷 Turkey

### Middle East
- 🇦🇪 United Arab Emirates
- 🇸🇦 Saudi Arabia
- 🇪🇬 Egypt
- 🇮🇱 Israel

### Asia Pacific
- 🇸🇬 Singapore
- 🇭🇰 Hong Kong
- 🇯🇵 Japan
- 🇰🇷 South Korea
- 🇮🇳 India
- 🇹🇭 Thailand
- 🇲🇾 Malaysia
- 🇮🇩 Indonesia
- 🇵🇭 Philippines
- 🇻🇳 Vietnam
- 🇨🇳 China
- 🇵🇰 Pakistan
- 🇧🇩 Bangladesh
- 🇦🇺 Australia
- 🇳🇿 New Zealand

### South America
- 🇧🇷 Brazil
- 🇦🇷 Argentina
- 🇨🇱 Chile
- 🇨🇴 Colombia
- 🇵🇪 Peru
- 🇻🇪 Venezuela

### Africa
- 🇿🇦 South Africa
- 🇳🇬 Nigeria
- 🇰🇪 Kenya
- 🇬🇭 Ghana
- 🇲🇦 Morocco

## Features in Detail

### Search Functionality

**How it works:**
1. Click the country selector
2. Dropdown opens with search box auto-focused
3. Type to filter countries in real-time
4. Clear search with X button
5. Select country or press ESC to close

**Search behavior:**
- Case-insensitive matching
- Searches country names
- Shows "No countries found" if no matches
- Clears search when selecting a country

### Flag Display

**Library:** `react-country-flag`
- SVG flags for high quality
- Rounded corners for modern look
- Consistent sizing (1.5em)
- Proper country code mapping

### Keyboard Navigation

**Supported keys:**
- **Tab** - Navigate to/from selector
- **Enter/Space** - Open dropdown
- **ESC** - Close dropdown
- **Click outside** - Close dropdown

### States

**1. Empty State**
```tsx
// No country selected
<CountrySelector value="" onChange={...} />
```
Shows: "Select your country" placeholder

**2. Selected State**
```tsx
// Country selected
<CountrySelector value="United States" onChange={...} />
```
Shows: Flag + Country name + Clear button

**3. Error State**
```tsx
// Validation error
<CountrySelector 
  value="" 
  onChange={...} 
  error="Please select your country"
/>
```
Shows: Red border and background

**4. Disabled State**
```tsx
// During form submission
<CountrySelector 
  value="United States" 
  onChange={...} 
  disabled={true}
/>
```
Shows: Reduced opacity, no interaction

## Styling

### Colors

**Normal State:**
- Border: `zinc-200`
- Background: `zinc-50`
- Text: `zinc-900`

**Error State:**
- Border: `red-500`
- Background: `red-50`
- Text: `red-900`

**Selected Item:**
- Background: `zinc-900`
- Text: `white`

**Hover State:**
- Border: `zinc-300`
- Item Background: `zinc-100`

### Animations

**Dropdown:**
- Fade in with scale
- Shadow for depth
- Smooth transitions

**Clear Button:**
- Fade in when country selected
- Hover effect (background change)

**Chevron Icon:**
- Rotates 180° when open
- Smooth transition

## Integration with Signup Form

### Before (Basic Select)
```tsx
<select value={country} onChange={...}>
  <option value="">Select country</option>
  <option value="United States">United States</option>
  ...
</select>
```

### After (Enhanced Selector)
```tsx
<CountrySelector
  value={country}
  onChange={setCountry}
  error={errors.country}
  disabled={isLoading}
/>
```

## Accessibility

✅ **ARIA Labels** - Proper labeling
✅ **Keyboard Navigation** - Full keyboard support
✅ **Focus Management** - Auto-focus search on open
✅ **Click Outside** - Close on outside click
✅ **Clear Button** - Easy to remove selection
✅ **Error Messages** - Screen reader friendly

## Mobile Optimization

✅ **Touch Friendly** - Large tap targets
✅ **Scrollable List** - Max height with scroll
✅ **Responsive Width** - Full width on mobile
✅ **Search Works** - Virtual keyboard compatible

## Performance

✅ **Lightweight** - Only renders visible items
✅ **Fast Search** - Client-side filtering
✅ **No API Calls** - Static country list
✅ **Lazy Loading** - Flags loaded on demand
✅ **Memoization** - Efficient re-renders

## Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ iOS Safari
✅ Chrome Mobile
✅ Samsung Internet

## Adding More Countries

To add more countries, edit the `COUNTRIES` array in `CountrySelector.tsx`:

```tsx
const COUNTRIES: Country[] = [
  // Existing countries...
  { name: 'Your Country', code: 'XX' }, // Use ISO 3166-1 alpha-2 code
];
```

**Country Code Format:** ISO 3166-1 alpha-2 (2-letter codes)
- 🇺🇸 United States = `US`
- 🇬🇧 United Kingdom = `GB`
- 🇫🇷 France = `FR`

**Find codes here:** https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

## Future Enhancements

- [ ] Group countries by region
- [ ] Show country calling codes
- [ ] Add popular countries section
- [ ] Autocomplete suggestions
- [ ] Fuzzy search matching
- [ ] Custom country list prop
- [ ] Multi-select support
- [ ] Country details on hover

## Dependencies

```json
{
  "react-country-flag": "^3.1.0",
  "lucide-react": "^0.561.0"
}
```

## File Location

```
app/
  components/
    CountrySelector.tsx    ← Component file
  signup/
    page.tsx              ← Usage in signup form
```

## Support

For issues or feature requests:
- Check component props
- Review error messages
- Verify country code format
- Contact: support@fxgenz.com

---

**Last Updated:** January 30, 2026
**Component:** `app/components/CountrySelector.tsx`
**Status:** ✅ Production Ready
