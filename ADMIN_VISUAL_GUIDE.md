# Admin Dashboard - Visual Structure Guide

## Layout Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          HEADER                                  │
│  [☰] Semprepzie Admin  │  Content Management  │ [🌙] [👤] [Logout]│
└──────────────────────────────────────────────────────────────────┘
┌────────────────┬─────────────────────────────────────────────────┐
│                │                                                 │
│   SIDEBAR      │              MAIN CONTENT                       │
│                │                                                 │
│  ┌──────────┐ │  ┌─────────────────────────────────────────┐   │
│  │Document  │ │  │                                         │   │
│  │Modifier  │ │  │         Active Section Content          │   │
│  └──────────┘ │  │                                         │   │
│                │  │   (Document Modifier / Lab Programs /   │   │
│  ┌──────────┐ │  │    Min Code Modifier)                   │   │
│  │Lab       │ │  │                                         │   │
│  │Programs  │ │  └─────────────────────────────────────────┘   │
│  │Modifier  │ │                                                 │
│  └──────────┘ │                                                 │
│                │                                                 │
│  ┌──────────┐ │                                                 │
│  │Min Code  │ │                                                 │
│  │Modifier  │ │                                                 │
│  └──────────┘ │                                                 │
│                │                                                 │
└────────────────┴─────────────────────────────────────────────────┘
```

## Document Modifier View

```
┌────────────────────────────────────────────────────────────────────┐
│  Document Modifier                                                 │
│  Manage subjects, units, and documents in your knowledge base      │
│                                                                    │
│  [+ New Subject]  [+ New Unit]  [+ Upload Document]               │
│                                                                    │
│  ┌──────────────┬───────────────┬──────────────────────────────┐ │
│  │  Subjects    │    Units      │       Documents              │ │
│  ├──────────────┼───────────────┼──────────────────────────────┤ │
│  │              │               │                              │ │
│  │ 📚 DSA       │ Unit 1: Intro │ ┌────────────────────────┐  │ │
│  │ 🔥 OS        │ Unit 2: Array │ │ Arrays Introduction    │  │ │
│  │ 🌐 Networks  │ Unit 3: Stack │ │ Sorting Algorithms     │  │ │
│  │              │               │ │ Binary Search Trees    │  │ │
│  │              │               │ └────────────────────────┘  │ │
│  └──────────────┴───────────────┴──────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Lab Programs Modifier View

```
┌────────────────────────────────────────────────────────────────────┐
│  Lab Programs Modifier                                             │
│  Manage lab subjects and programming exercises                     │
│                                                                    │
│  [+ New Lab Subject]  [+ New Program]                             │
│                                                                    │
│  ┌─────────────────────────┬───────────────────────────────────┐ │
│  │    Lab Subjects         │          Programs                 │ │
│  ├─────────────────────────┼───────────────────────────────────┤ │
│  │                         │                                   │ │
│  │ CSE101                  │ ┌──────────────────────────────┐ │ │
│  │ Python Programming Lab  │ │ #1 [Easy] [python]           │ │ │
│  │ Semester 1              │ │ Print Hello World            │ │ │
│  │                         │ │ Simple output program        │ │ │
│  │ CSE201                  │ └──────────────────────────────┘ │ │
│  │ Data Structures Lab     │ ┌──────────────────────────────┐ │ │
│  │ Semester 2              │ │ #2 [Medium] [python]         │ │ │
│  │                         │ │ Calculator Program           │ │ │
│  │                         │ │ Basic arithmetic operations  │ │ │
│  │                         │ └──────────────────────────────┘ │ │
│  └─────────────────────────┴───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Min Code Modifier View

```
┌────────────────────────────────────────────────────────────────────┐
│  Min Code Modifier                                                 │
│  Manage minimum code examples (same structure as Lab Programs)     │
│                                                                    │
│  [+ New Subject]  [+ New Code Example]                            │
│                                                                    │
│  ┌─────────────────────────┬───────────────────────────────────┐ │
│  │      Subjects           │        Code Examples              │ │
│  ├─────────────────────────┼───────────────────────────────────┤ │
│  │                         │                                   │ │
│  │ CSE101                  │ ┌──────────────────────────────┐ │ │
│  │ Python Basics           │ │ #1 [Easy] [python]           │ │ │
│  │ Semester 1              │ │ Variable Declaration         │ │ │
│  │                         │ │ Basic variable usage         │ │ │
│  │                         │ └──────────────────────────────┘ │ │
│  │                         │ ┌──────────────────────────────┐ │ │
│  │                         │ │ #2 [Easy] [python]           │ │ │
│  │                         │ │ If-Else Statement            │ │ │
│  │                         │ │ Conditional logic example    │ │ │
│  │                         │ └──────────────────────────────┘ │ │
│  └─────────────────────────┴───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Mobile View (< 768px)

```
┌──────────────────────────┐
│ [☰] Semprepzie Admin     │
│ [🌙] [👤] [Logout]        │
└──────────────────────────┘

When Sidebar Opens:
┌──────────────────────────┐
│ [X] Admin Sections       │
│                          │
│ ┌────────────────────┐   │
│ │ Document Modifier  │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Lab Programs       │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Min Code Modifier  │   │
│ └────────────────────┘   │
│                          │
└──────────────────────────┘
```

## Modal Examples

### New Subject Modal
```
┌──────────────────────────────┐
│  Create New Subject         │
│                              │
│  Subject Name:               │
│  [___________________]       │
│                              │
│  Icon (Emoji):               │
│  [📚]                        │
│                              │
│  [Cancel]    [Create]        │
└──────────────────────────────┘
```

### Upload Document Modal
```
┌──────────────────────────────┐
│  Upload Document            │
│                              │
│  Document Title:             │
│  [___________________]       │
│                              │
│  PDF File:                   │
│  [Choose File]               │
│  Selected: document.pdf      │
│                              │
│  Progress: [████░░░░] 50%   │
│                              │
│  [Cancel]    [Upload]        │
└──────────────────────────────┘
```

### New Program Modal
```
┌──────────────────────────────┐
│  Create New Program         │
│                              │
│  Program Number: [1]         │
│                              │
│  Title:                      │
│  [___________________]       │
│                              │
│  Description:                │
│  [___________________]       │
│  [___________________]       │
│                              │
│  Language: [Python ▼]        │
│  Difficulty: [Easy ▼]        │
│                              │
│  [Cancel]    [Create]        │
└──────────────────────────────┘
```

## Color Schemes

### Light Theme
- Background: Gray-50 (#F9FAFB)
- Cards: White (#FFFFFF)
- Borders: Gray-200 (#E5E7EB)
- Text: Gray-900 (#111827)
- Accents: Blue-500, Green-500, Purple-500

### Dark Theme
- Background: Gray-900 (#111827)
- Cards: Gray-800 (#1F2937)
- Borders: Gray-700 (#374151)
- Text: White (#FFFFFF)
- Accents: Blue-600, Green-600, Purple-600

## Interactive Elements

### Buttons
- Primary: Blue gradient (Document), Green (Labs), Purple (Min Code)
- Secondary: Gray
- Danger: Red (Delete actions)
- Disabled: Gray-300 with reduced opacity

### States
- Hover: Slightly darker shade
- Active: Border highlight
- Loading: Spinner with disabled state
- Selected: Background color change with white text

## Accessibility Features
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA)
- ✅ Responsive touch targets
- ✅ Screen reader friendly

## Animations
- Sidebar slide: 300ms ease-in-out
- Modal fade: 200ms
- Button hover: 150ms
- Theme switch: 200ms
- Progress bars: Smooth transition
