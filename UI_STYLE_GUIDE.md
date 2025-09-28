# Globe Application UI Style Guide

## Button Styling Standards

### Primary Buttons
- **Size**: `sm`
- **Height**: `25px`
- **Color Scheme**: `blue` (primary actions)
- **Font Weight**: `600`
- **Font Size**: `0.7rem`
- **Border Radius**: `md`
- **White Space**: `nowrap`

### Secondary Buttons
- **Size**: `sm`
- **Height**: `25px`
- **Color Scheme**: `green` (success actions), `red` (destructive actions), `orange` (warning actions), `gray` (neutral actions)
- **Font Weight**: `600`
- **Font Size**: `0.7rem`
- **Border Radius**: `md`
- **White Space**: `nowrap`

### Outline Buttons
- **Size**: `sm`
- **Height**: `25px`
- **Variant**: `outline`
- **Color Scheme**: `green` (import actions), `blue` (primary actions)
- **Font Weight**: `600`
- **Font Size**: `0.7rem`
- **Border Radius**: `md`
- **White Space**: `nowrap`

## Input Field Styling Standards

### Text Inputs
- **Height**: `25px`
- **Background**: `gray.50`
- **Border**: `1px solid`
- **Border Color**: `gray.200`
- **Color**: `white`
- **Placeholder Color**: `gray.400`
- **Border Radius**: `md`
- **Font Size**: `0.7rem`

### Form Layout
- **Gap**: `8px` between form elements
- **Flex**: `1` for input fields to take available space
- **HStack**: For horizontal form layouts

## Color Scheme Guidelines

### Primary Colors
- **Blue**: Primary actions, main buttons
- **Green**: Success actions, import buttons, save actions
- **Red**: Destructive actions, delete buttons
- **Orange**: Warning actions, hide/toggle buttons
- **Gray**: Neutral actions, close buttons

### Background Colors
- **Input Background**: `gray.50`
- **Button Background**: Based on colorScheme
- **Container Background**: Transparent or `white`

## Typography Standards

### Button Text
- **Font Weight**: `600` (semi-bold)
- **Font Size**: `0.7rem`
- **White Space**: `nowrap`

### Input Text
- **Font Size**: `0.7rem`
- **Color**: `white`

## Spacing Standards

### Button Spacing
- **Gap**: `8px` between buttons
- **Height**: `25px` for all buttons
- **Padding**: Default Chakra UI padding for `sm` size

### Form Spacing
- **Gap**: `8px` between form elements
- **Margin Bottom**: `8px` for form sections

## Component Consistency

### All Interactive Elements
- **Height**: `25px` (consistent across all components)
- **Font Size**: `0.7rem` (consistent text size)
- **Border Radius**: `md` (consistent rounded corners)
- **Font Weight**: `600` for buttons, normal for inputs

### Layout Patterns
- **HStack**: For horizontal button groups
- **VStack**: For vertical form layouts
- **Gap**: `8px` for consistent spacing
- **Flex**: `1` for input fields to expand

## Implementation Examples

### Standard Button
```jsx
<Button
  size="sm"
  h="25px"
  colorScheme="blue"
  fontWeight="600"
  fontSize="0.7rem"
  borderRadius="md"
  whiteSpace="nowrap"
>
  Button Text
</Button>
```

### Outline Button
```jsx
<Button
  size="sm"
  h="25px"
  colorScheme="green"
  variant="outline"
  fontWeight="600"
  fontSize="0.7rem"
  borderRadius="md"
  whiteSpace="nowrap"
>
  Import
</Button>
```

### Standard Input
```jsx
<Input
  h="25px"
  bg="gray.50"
  border="1px solid"
  borderColor="gray.200"
  color="white"
  _placeholder={{ color: "gray.400" }}
  borderRadius="md"
  fontSize="0.7rem"
  flex={1}
/>
```

## Design Principles

1. **Consistency**: All interactive elements follow the same height (25px) and font size (0.7rem)
2. **Clarity**: Clear color coding for different action types
3. **Accessibility**: Sufficient contrast and readable font sizes
4. **Efficiency**: Compact design that maximizes screen space
5. **Cohesion**: Unified visual language across all components
