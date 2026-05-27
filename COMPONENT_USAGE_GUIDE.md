# Component Usage Examples

## Quick Reference

### Button
```jsx
import Button from '@/components/Common/Button'

// Variants: primary, secondary, danger, ghost
// Sizes: xs, sm, md, lg

<Button variant="primary">Click Me</Button>
<Button variant="secondary" size="lg">Secondary Large</Button>
<Button variant="danger" disabled>Disabled</Button>
<Button variant="ghost" icon={<Icon />}>With Icon</Button>
<Button loading>Saving...</Button>
<Button fullWidth>Full Width</Button>
```

### Card
```jsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Common/Card'
import Button from '@/components/Common/Button'

// Variants: default, elevated, interactive, status
// Padding: sm, md, lg, xl
// Status: success, warning, error, info

<Card variant="default">
  <CardHeader title="Card Title" description="Subtitle" />
  <CardBody>Content here</CardBody>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>

// Status Card
<Card variant="status" status="success">
  <p>Success! Order #123 placed.</p>
</Card>

// Interactive Card
<Card variant="interactive" onClick={() => navigate('/details')}>
  Click me to navigate
</Card>
```

### Badge
```jsx
import Badge from '@/components/Common/Badge'

// Variants: success, warning, error, info, neutral
// Sizes: sm, md, lg

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="lg">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
<Badge variant="neutral">Draft</Badge>
```

### Input Fields
```jsx
import { Input, Textarea, Select, Checkbox } from '@/components/Common/Input'
import { Mail } from 'lucide-react'

// Input with icon
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={Mail}
  iconPosition="left"
  error={errorMsg}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Textarea
<Textarea
  label="Message"
  placeholder="Type your message..."
  rows={4}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// Select
<Select
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
/>

// Checkbox
<Checkbox
  label="I agree to terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

### Modal
```jsx
import { Modal, ModalBody, ModalFooter } from '@/components/Common/Modal'
import Button from '@/components/Common/Button'

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <ModalBody>
    <p>Are you sure you want to delete this item?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

---

## Real Page Example: Refactoring

### BEFORE (Old Style)
```jsx
// Old UserEvent.jsx - Mixed styles everywhere
export default function UserEvent() {
  return (
    <div className="ml-64 bg-gradient-to-b from-green-600 to-green-800 min-h-screen">
      <div className="text-white p-8">
        <h1 className="text-4xl font-black italic">Event</h1>
      </div>
      
      {/* Raw buttons with inconsistent styling */}
      <div className="px-8">
        <button className="px-6 py-3 bg-green-400 text-green-900 font-bold rounded-lg">
          Create Event
        </button>
        
        {/* Cards with hardcoded styling */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border">
          <h3 className="font-black text-gray-800">Event Title</h3>
          <p className="text-gray-400 text-sm">Description</p>
          
          {/* Inconsistent button styling */}
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl">
            View
          </button>
        </div>
      </div>
    </div>
  )
}
```

### AFTER (New Design System)
```jsx
import Button from '@/components/Common/Button'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Common/Card'
import Badge from '@/components/Common/Badge'
import { PageContainer } from '@/components/Layout/PageContainer'

export default function UserEvent() {
  return (
    <PageContainer>
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900">Event</h1>
        <p className="text-slate-500 text-sm mt-2">Create and participate in community events</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <Button variant="primary" size="lg">
          Create Event
        </Button>
        <Button variant="secondary">
          My Events
        </Button>
      </div>

      {/* Event card - consistent styling */}
      <Card variant="interactive">
        <CardHeader
          title="Event Title"
          description="June 15, 2024 • 2 registered"
          action={<Badge variant="success">Active</Badge>}
        />
        <CardBody className="space-y-3">
          <p className="text-slate-600">Event description and details go here.</p>
          <div className="flex gap-2 text-sm text-slate-500">
            <span>📍 Jakarta</span>
            <span>👥 2 registered</span>
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="secondary" size="sm" className="flex-1">
            View Details
          </Button>
          <Button variant="primary" size="sm" className="flex-1">
            Register
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
```

---

## Key Principles

✅ **Always use component props, never hardcode classes**
```jsx
// GOOD ✅
<Button variant="primary" size="lg">
  Click Me
</Button>

// BAD ❌
<button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-bold">
  Click Me
</button>
```

✅ **Use the design system color names**
```jsx
// GOOD ✅
className="text-slate-900"
className="bg-brand-primary"

// BAD ❌
className="text-black"
className="bg-green-600"
```

✅ **Keep spacing from the scale**
```jsx
// GOOD ✅
<div className="p-6 gap-4 mb-8">

// BAD ❌
<div className="p-[24px] gap-[16px] mb-[32px]">
```

✅ **Component composition over custom styling**
```jsx
// GOOD ✅
<Card variant="interactive" onClick={handleClick}>
  <CardHeader title="Title" />
  <CardBody>Content</CardBody>
</Card>

// BAD ❌
<div className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg" onClick={handleClick}>
  <h3>Title</h3>
  <p>Content</p>
</div>
```

---

## Testing Checklist for Refactored Pages

- [ ] All text is readable (good contrast)
- [ ] All buttons work and have correct variant
- [ ] All forms have labels and validation
- [ ] All cards look consistent
- [ ] All spacing looks balanced
- [ ] Mobile view works (< 640px)
- [ ] Tablet view works (640-1024px)
- [ ] Desktop view works (> 1024px)
- [ ] No console errors
- [ ] No console warnings
- [ ] Tab navigation works
- [ ] Focus states visible
- [ ] Images/icons display correctly
- [ ] API calls still work
- [ ] State management works

---

## Import Paths

When using components, import from their locations:

```jsx
// Buttons
import Button from '@/components/Common/Button'

// Cards
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Common/Card'

// Badges
import Badge from '@/components/Common/Badge'

// Form Inputs
import { Input, Textarea, Select, Checkbox } from '@/components/Common/Input'

// Modals
import { Modal, ModalBody, ModalFooter } from '@/components/Common/Modal'

// Layouts (when created)
import { PageContainer, SectionContainer, GridContainer } from '@/components/Layout/PageContainer'
```

---

## Tailwind Classes to Use

**Never hardcode these - use the design system tokens:**

```
Colors:        Use brand-primary, slate-500, red-500, etc.
Spacing:       Use p-4, mb-8, gap-6, px-lg, etc.
Border Radius: Use rounded-md, rounded-lg, rounded-xl
Shadows:       Use shadow-sm, shadow-md, shadow-lg
Fonts:         Use font-bold, font-semibold, text-slate-900
Transitions:   Use transition-all duration-normal
```

---

**Total Components Ready to Use:** 5 core + variations = 12 components  
**Estimated Refactor Time per Page:** 1-2 hours  
**Total Estimated Refactor Time:** 16-32 hours for all 16 pages
