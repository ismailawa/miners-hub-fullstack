# Responsive Design Guidelines

**Last Updated:** 2025-01-XX  
**Story:** 1.10 - Responsive Design Foundation

---

## Overview

This document outlines the responsive design strategy and patterns used throughout the Miners Hub application. All components must follow these guidelines to ensure consistent, accessible experiences across all devices.

---

## Breakpoint Strategy

We use a **mobile-first approach** with Tailwind CSS breakpoints:

| Breakpoint | Screen Size | Usage |
|------------|-------------|-------|
| **Mobile** | 320px - 767px | Base styles (no prefix) |
| **sm** | 640px+ | Small tablets, large phones |
| **md** | 768px+ | Tablets |
| **lg** | 1024px+ | Desktop |
| **xl** | 1280px+ | Large desktop |

### Breakpoint Usage Pattern

```tsx
// Mobile-first: Start with mobile styles, then add larger breakpoints
<div className="
  text-sm          // Mobile: small text
  sm:text-base     // 640px+: base text
  md:text-lg       // 768px+: large text
  lg:text-xl       // 1024px+: extra large text
">
```

---

## Layout Patterns

### Single Column → Multi Column

**Mobile:** Single column layout  
**Tablet:** 2-3 columns  
**Desktop:** 3-4 columns

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Cards stack vertically on mobile, 2 columns on tablet, 3 on desktop */}
</div>
```

### Navigation Patterns

**Mobile:**
- Hamburger menu (Sheet component)
- Full-width menu drawer
- Touch-friendly menu items (min 44x44px)

**Tablet:**
- Condensed or full navigation menu
- Touch interactions still important

**Desktop:**
- Full horizontal navigation menu
- Hover states active

---

## Typography

### Responsive Text Sizing

Use Tailwind responsive text classes:

```tsx
// Headings
<h1 className="text-2xl sm:text-3xl md:text-4xl">
  Title
</h1>

// Body text
<p className="text-base sm:text-lg md:text-xl">
  Content
</p>

// Small text
<span className="text-sm md:text-base">
  Caption
</span>
```

### Line Heights

Adjust line heights for readability:

```tsx
<p className="leading-6 sm:leading-8">
  // Tighter on mobile, more spacious on desktop
</p>
```

---

## Touch Targets

**Minimum Size:** 44x44px for all interactive elements on mobile

### Buttons

```tsx
<Button className="min-h-[44px] min-w-[44px]">
  Click Me
</Button>
```

### Links

```tsx
<Link className="min-h-[44px] flex items-center">
  Link Text
</Link>
```

### Icons

```tsx
<a className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon className="h-5 w-5" />
</a>
```

---

## Spacing

### Responsive Padding/Margins

```tsx
<div className="
  px-4 py-4        // Mobile: compact spacing
  sm:px-6 sm:py-6  // Tablet: medium spacing
  md:px-8 md:py-8  // Desktop: generous spacing
">
```

### Gap Spacing

```tsx
<div className="gap-3 sm:gap-4 md:gap-6">
  // Tighter gaps on mobile, more space on desktop
</div>
```

---

## Forms

### Form Inputs

- Stack vertically on mobile
- Full width on mobile (w-full)
- Adequate spacing between inputs
- Minimum 44px height for touch targets

```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">Email</label>
    <input
      className="w-full px-3 py-2 sm:py-2.5 border rounded-md min-h-[44px] text-base sm:text-sm"
      type="email"
    />
  </div>
</div>
```

### Form Buttons

- Full width on mobile (optional, or adequate spacing)
- Minimum 44px height

```tsx
<Button className="w-full sm:w-auto min-h-[44px]">
  Submit
</Button>
```

---

## Images and Media

### Responsive Images

```tsx
<img
  src="image.jpg"
  alt="Description"
  className="w-full max-w-full h-auto object-cover"
/>
```

### Aspect Ratios

Maintain aspect ratios across breakpoints:

```tsx
<div className="aspect-video w-full">
  <img className="w-full h-full object-cover" />
</div>
```

---

## Component-Specific Guidelines

### Header

- **Mobile:** Hamburger menu, hidden desktop nav
- **Desktop:** Full navigation menu, search bar
- **Search Bar:** Responsive width (w-48 lg:w-64)
- **Touch Targets:** All menu items min 44x44px

### Footer

- **Mobile:** Single column, stacked sections
- **Tablet:** 2 columns
- **Desktop:** 4 columns
- **Links:** Touch-friendly (min 44px height)

### Cards

- **Mobile:** Full width, stacked
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns

### Buttons

- **Mobile:** Full width or adequate spacing
- **Desktop:** Auto width
- **Always:** Minimum 44x44px touch target

---

## Testing Checklist

### Mobile (320px - 767px)
- [ ] All components adapt correctly
- [ ] Navigation uses hamburger menu
- [ ] Text is readable without zooming
- [ ] Touch targets are at least 44x44px
- [ ] Single-column layouts
- [ ] Forms stack vertically
- [ ] Buttons are full-width or have adequate spacing

### Tablet (768px - 1023px)
- [ ] Layout adapts correctly
- [ ] Multi-column layouts (2-3 columns)
- [ ] Touch interactions work
- [ ] Text remains readable

### Desktop (1024px+)
- [ ] Full desktop layout
- [ ] Multi-column layouts (3-4 columns)
- [ ] Full navigation menu visible
- [ ] Hover states work
- [ ] Optimal use of screen space

---

## Common Patterns

### Responsive Container

```tsx
<div className="container mx-auto px-4 sm:px-6 md:px-8">
  {/* Content */}
</div>
```

### Responsive Flex Direction

```tsx
<div className="flex flex-col sm:flex-row gap-4">
  {/* Stacks on mobile, horizontal on tablet+ */}
</div>
```

### Responsive Visibility

```tsx
{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">Desktop Only</div>

{/* Show on mobile, hide on desktop */}
<div className="block md:hidden">Mobile Only</div>
```

---

## Best Practices

1. **Mobile-First:** Always start with mobile styles, then add larger breakpoints
2. **Touch Targets:** Minimum 44x44px for all interactive elements
3. **Readable Text:** Use responsive typography, ensure adequate line heights
4. **No Hover-Only:** All interactions must work without hover (mobile)
5. **Consistent Spacing:** Use Tailwind spacing scale consistently
6. **Test Real Devices:** Test on actual devices when possible
7. **Progressive Enhancement:** Enhance experience for larger screens

---

## References

- [Source: docs/stories/1-10-responsive-design-foundation.md] - Story acceptance criteria
- [Source: docs/PRD.md#Web-Application-Specific-Requirements] - PRD responsive design requirements
- [Source: docs/architecture.md] - Architecture patterns
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)

