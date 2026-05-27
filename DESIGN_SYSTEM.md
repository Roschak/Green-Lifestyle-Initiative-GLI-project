# Unified Design System - GLI Platform

## Executive Overview

This document establishes a **unified, consistent design system** for the entire GLI Platform, ensuring both frontend public pages and admin dashboard feel like a cohesive, professional SaaS experience.

### Design Principles

- **Modern & Clean**: Minimal visual clutter, maximum clarity
- **Premium Feel**: Soft minimalism, elegant spacing, thoughtful details
- **Professional**: Clear hierarchy, consistent patterns, scalable structure
- **Accessible**: Strong contrast, readable typography, keyboard friendly
- **Performant**: Smooth animations, optimized rendering

---

## Color System

### Primary Palette

#### Greens (Current Brand)
```
Primary Green:    #2D8F5D (vibrant, active state)
Green 400:        #4ADE80 (bright, accent)
Green 300:        #86EFAC (light accent)
Green 50:         #F0FDF4 (very light background)
```

#### Grays (Neutral Workspace)
```
Gray 50:          #F9FAFB (almost white, cards)
Gray 100:         #F3F4F6 (light background)
Gray 200:         #E5E7EB (borders, subtle)
Gray 400:         #9CA3AF (secondary text)
Gray 600:         #4B5563 (body text)
Gray 800:         #1F2937 (headings)
Gray 900:         #111827 (dark text)
```

#### Blues (Secondary)
```
Blue 500:         #3B82F6 (info state)
Blue 50:          #EFF6FF (light background)
```

#### Semantic Colors
```
Success:          #2D8F5D (green)
Warning:          #F59E0B (amber)
Danger:           #EF4444 (red)
Info:             #3B82F6 (blue)
```

### Background Colors

```
Page Background:      #F9FAFB or #FFFFFF
Card Background:      #FFFFFF
Overlay:              rgba(0,0,0,0.5)
Input Background:     #FFFFFF
```

### Text Colors

```
Headings:             #111827 (gray-900)
Body:                 #374151 (gray-700)
Secondary:            #6B7280 (gray-500)
Muted:                #9CA3AF (gray-400)
Light:                #D1D5DB (gray-300)
```

---

## Typography System

### Font Family
```
Primary:              'Inter', 'Geist', sans-serif
Fallback:             'Poppins', sans-serif
Code:                 'Fira Code', 'Courier New', monospace
```

### Font Sizes & Weights

#### Headings
```
H1 (Page Title):      36px, font-black (900), letter-spacing: -0.02em
H2 (Section):         28px, font-bold (700), letter-spacing: -0.01em
H3 (Subsection):      20px, font-bold (700)
H4 (Card Title):      18px, font-bold (700)
H5 (Small Title):     16px, font-semibold (600)
```

#### Body Text
```
Body Large:           16px, font-normal (400), line-height: 1.5
Body:                 14px, font-normal (400), line-height: 1.5
Body Small:           12px, font-normal (400), line-height: 1.4
Caption:              11px, font-medium (500), line-height: 1.2
```

#### UI Labels
```
Button:               12px, font-bold (700), uppercase, letter-spacing: 0.05em
Badge:                11px, font-bold (700), uppercase, letter-spacing: 0.05em
Tab:                  13px, font-semibold (600), uppercase
```

### Line Heights
```
Tight:                1.2
Normal:               1.5
Relaxed:              1.75
```

---

## Spacing System

### Unit Base: 4px
```
xs:       4px   (0.25rem)
sm:       8px   (0.5rem)
md:       12px  (0.75rem)
lg:       16px  (1rem)
xl:       24px  (1.5rem)
2xl:      32px  (2rem)
3xl:      40px  (2.5rem)
4xl:      48px  (3rem)
```

### Recommended Usage
```
Padding (inside cards):      16px (lg)
Margin (between sections):   32px (2xl)
Margin (between items):      12px (md)
Padding (buttons):           10px 16px
Padding (inputs):            12px 16px
Padding (modals):            24px-32px
Gap (flex items):            8-16px (sm-lg)
```

---

## Border Radius System

```
xs:       4px      (subtle, inputs)
sm:       6px      (small elements)
md:       8px      (buttons, badges)
lg:       12px     (cards, containers)
xl:       16px     (larger cards)
2xl:      24px     (prominent cards)
3xl:      32px     (full-width sections)
full:     9999px   (pills, avatars)
```

### Recommended Usage
```
Buttons:              8px (md)
Form Inputs:          8px (md)
Small Cards:          12px (lg)
Large Cards:          16px (xl)
Modal:                16px (xl)
Avatars:              9999px (full)
Section Containers:   12-16px (lg-xl)
```

---

## Shadow System

```
sm:       0 1px 2px 0 rgba(0,0,0,0.05)
md:       0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)
lg:       0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)
xl:       0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)
2xl:      0 25px 50px -12px rgba(0,0,0,0.25)

Hover:    md shadow when interactive
Focus:    md shadow with outline ring
Active:   sm shadow (pressed state)
```

### Recommended Usage
```
Card at rest:        shadow-sm (subtle)
Card on hover:       shadow-md (elevated)
Modal backdrop:      shadow-2xl (prominent)
Dropdown:            shadow-lg (floating)
Button pressed:      shadow-sm (active)
```

---

## Transitions & Animations

### Duration
```
Fast:       150ms
Normal:     200ms
Slow:       300ms
```

### Easing
```
Default:    cubic-bezier(0.4, 0, 0.2, 1)
Ease In:    cubic-bezier(0.4, 0, 1, 1)
Ease Out:   cubic-bezier(0, 0, 0.2, 1)
Bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Recommended Animations
```
Hover Effects:       200ms opacity/color/shadow
Page Transitions:    300ms opacity/transform
Loading:            Shimmer (see index.css)
Success Feedback:    Flash or scale up (150ms)
```

---

## Component System

### Layout Components

#### Page Container
```tsx
Props: children, maxWidth="6xl", className
Classes: mx-auto px-4 sm:px-6 lg:px-8 py-8
```

#### Section Container
```tsx
Props: children, title, description
Classes: py-8 px-6 bg-white rounded-xl
```

#### Grid System
```
Desktop:  12-column grid
Tablet:   6-column grid
Mobile:   2-column grid
Gap:      16px (lg)
```

### Card System

#### Card
```
Background:   #FFFFFF
Border:       1px solid #E5E7EB
Radius:       12px (lg)
Shadow:       shadow-sm
Hover:        shadow-md + border color shift
Padding:      16px (lg)
```

#### Card Types
- **Plain Card**: Basic white card with border
- **Elevated Card**: With shadow-md on desktop
- **Interactive Card**: Hover state with shadow-md + slight lift
- **Status Card**: With left border accent (colored border-l-4)

### Button System

#### Button Sizes
```
xs:  px-3 py-1.5  text-xs
sm:  px-4 py-2    text-sm
md:  px-4 py-2.5  text-sm
lg:  px-6 py-3    text-base
```

#### Button Variants

**Primary (Green)**
```
Background:   #2D8F5D (green-600)
Text:         #FFFFFF
Hover:        #1E6B47 (darker green)
Active:       shadow-sm inset
Radius:       8px (md)
Transition:   200ms
```

**Secondary (White)**
```
Background:   #FFFFFF
Border:       1px solid #E5E7EB
Text:         #374151
Hover:        bg-gray-50, border-gray-300
Transition:   200ms
```

**Danger (Red)**
```
Background:   #EF4444
Text:         #FFFFFF
Hover:        #DC2626
Transition:   200ms
```

**Ghost**
```
Background:   transparent
Text:         #374151
Border:       1px solid transparent
Hover:        bg-gray-100, border-gray-200
Transition:   200ms
```

### Form Components

#### Input
```
Background:    #FFFFFF
Border:        1px solid #D1D5DB
Radius:        8px (md)
Padding:       12px 16px (md)
Font:          14px normal
Focus:         border-green-500 + ring-2 ring-green-200
Transition:    200ms
```

#### Select/Dropdown
```
Same as input
Icon:          chevron-down in gray-400
Open:          Shows dropdown with shadow-lg
```

#### Textarea
```
Same as input
Min-height:    120px
Resize:        vertical
Line-height:   1.5
```

#### Checkbox/Radio
```
Size:          16x16px
Color:         #2D8F5D
Border:        2px solid #D1D5DB
Radius:        4px (checkbox), full (radio)
Checked:       solid color with checkmark/dot
Transition:    200ms
```

### Badge System

#### Badge Variants
```
Success:      bg-green-100   text-green-800   border-green-200
Warning:      bg-amber-100   text-amber-800   border-amber-200
Danger:       bg-red-100     text-red-800     border-red-200
Info:         bg-blue-100    text-blue-800    border-blue-200
Neutral:      bg-gray-100    text-gray-800    border-gray-200
```

#### Badge Sizes
```
sm:  px-2   py-1   text-xs    rounded-md
md:  px-3   py-1.5 text-sm    rounded-lg
lg:  px-4   py-2   text-base  rounded-lg
```

### Modal System

#### Modal
```
Backdrop:     rgba(0,0,0,0.5) fixed inset-0 z-40
Container:    bg-white rounded-xl shadow-2xl max-w-lg z-50
Padding:      32px (2xl)
Close button: top-right, gray-400 hover:gray-600
Animation:    fade-in 200ms
```

#### Modal Actions
```
Button layout:  flex gap-3 justify-end
Primary button: right side, solid green
Secondary:      left side, white outline
```

### Table System

#### Table
```
Background:    white
Border:        1px solid #E5E7EB
Radius:        12px (lg) with overflow-hidden
Shadow:        shadow-sm
```

#### Table Header
```
Background:    #F9FAFB
Text:          #4B5563 (gray-600), font-semibold (600)
Border-bottom: 2px solid #E5E7EB
Padding:       12px 16px (md)
```

#### Table Row
```
Border-bottom: 1px solid #E5E7EB
Padding:       12px 16px (md)
Hover:         bg-gray-50
Transition:    200ms
```

### Loading & Empty States

#### Loading
```
Use shimmer animation (see index.css)
Skeleton:     bg-gray-200 rounded-lg
Wave:         linear-gradient animation
```

#### Empty State
```
Container:     py-20 text-center
Icon:          size-16 gray-300
Title:         font-bold gray-700 text-lg
Description:   gray-500 text-sm
Action:        button below description
```

---

## Layout Patterns

### Page Layout

```
┌─────────────────────────────────┐
│      Header / Title Area        │
├─────────────────────────────────┤
│                                 │
│  Main Content Area (py-8)       │
│  Responsive Grid                │
│                                 │
└─────────────────────────────────┘

Padding:   px-4 sm:px-6 lg:px-8 py-8
Max-width: 6xl (1152px)
```

### Dashboard Grid

```
Desktop:  grid-cols-12
          [Main Content: col-span-8]
          [Sidebar/Stats: col-span-4]

Tablet:   grid-cols-6
          [Main: col-span-4]
          [Sidebar: col-span-2]

Mobile:   grid-cols-1
          Stacked vertically
```

### Card Grid

```
Desktop:  grid-cols-3 (4-col for smaller cards)
Tablet:   grid-cols-2
Mobile:   grid-cols-1
Gap:      16px (lg)
```

---

## Sidebar Design

### Structure

```
Width:        256px (fixed)
Background:   Keep current green gradient
Text:         White
Sticky:       sticky top-0 h-screen
```

### Navigation Item

```
Padding:      12px 16px
Radius:       12px (lg)
Margin-bottom: 8px (sm)
Font:         14px semibold

Active:       bg-white/20 + font-bold
Hover:        bg-white/15 opacity-100
Transition:   200ms
```

### Sidebar Profile Card (Top)

```
Background:   bg-white/90
Padding:      16px (lg)
Radius:       12px (lg)
Margin:       12px (md)
Shadow:       shadow-sm
```

---

## Responsive Design Rules

### Breakpoints
```
xs:   0px
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### Mobile-First Approach
```
Base:     Mobile (xs)
@sm:      Add tablet styles
@md:      Adjust for larger tablets
@lg:      Desktop styles
@xl:      Large desktop (optional)
```

### Visibility Classes
```
hidden          Full hide
sm:block        Show on tablet+
md:block        Show on desktop+
lg:block        Show on large desktop+

sm:hidden       Hide on tablet+
md:hidden       Hide on desktop+
```

---

## Accessibility Guidelines

### Color Contrast
- Text on background: WCAG AA (4.5:1 for normal, 3:1 for large)
- Use `--contrast-enhanced` for critical elements

### Typography
- Min font size: 12px (captions only)
- Body: 14px minimum
- Line height: ≥1.5 for body text
- Letter spacing: Normal (not condensed)

### Interactive Elements
- Min touch target: 44x44px
- Min click target: 32x32px
- Focus visible: outline-2 outline-green-500
- Focus gap: 2px

### Motion
- Respect `prefers-reduced-motion`
- Animate opacity/transform (not layout)
- Never auto-play videos/animations

### Forms
- Label + Input visible together
- Error messages clear and associated
- Required fields marked with `*`
- Placeholder NOT a substitute for label

---

## Implementation Files

### Core Files to Create

1. **tailwind.config.js** - Extended theme tokens
2. **index.css** - CSS variables, base utilities
3. **components/Layout/**
   - PageContainer.jsx
   - SectionContainer.jsx
   - Grid.jsx
4. **components/Common/**
   - Card.jsx, Button.jsx, Badge.jsx
   - Input.jsx, Select.jsx, Textarea.jsx
   - Modal.jsx, Table.jsx
5. **styles/variables.css** - CSS custom properties

### Files to Update

1. Tailwind config
2. index.css
3. All page layouts (gradual)
4. All components (gradual)

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
- [ ] Enhanced Tailwind config with design tokens
- [ ] CSS custom properties setup
- [ ] Core layout components
- [ ] Global styles normalization

### Phase 2: Components (Week 2)
- [ ] Card, Button, Badge components
- [ ] Form input components
- [ ] Modal, Table components
- [ ] Loading/Empty states

### Phase 3: Admin Pages (Week 3)
- [ ] Dashboard refactor
- [ ] Event, Article pages
- [ ] Monitoring, Moderasi pages
- [ ] Test all interactions

### Phase 4: Frontend Pages (Week 4)
- [ ] Landing page
- [ ] User event/article pages
- [ ] User dashboard/profile
- [ ] Forms and modals

### Phase 5: Polish (Week 5)
- [ ] Responsive testing
- [ ] Animation refinement
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Success Criteria

✅ All pages use consistent colors (no hardcoded colors except special cases)  
✅ All spacing follows 4px grid system  
✅ All border radius from defined scale  
✅ All shadows from defined set  
✅ Typography hierarchy consistent  
✅ Components reusable across pages  
✅ Mobile responsive without layout breaking  
✅ Accessibility: WCAG AA contrast + keyboard nav  
✅ No visual regression from original  
✅ Performance maintained (no new issues)  

---

## Notes for Implementation

- **No breaking changes**: Backend APIs unchanged
- **Gradual rollout**: Component-by-component
- **Testing required**: Each phase thoroughly tested
- **Preservation**: Existing functionality intact
- **Backward compatible**: Old components gradually replaced
- **Team communication**: Changes documented

---

**Design System Version**: 1.0  
**Last Updated**: May 20, 2026  
**Status**: Ready for Implementation
