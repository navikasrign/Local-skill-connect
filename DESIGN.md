# Design System: Local Skill Connect App

> **Stitch Project ID:** `14113995560909919430`  
> **Project Name:** `projects/14113995560909919430`  
> **Device Target:** Mobile (390px base width, fluid responsive)  
> **Design Concept:** Verified Local Craft & Trade Marketplace  

---

## 📱 Project Screens

The project currently contains the following screen:

| Screen Name | Screen ID | Type | Dimensions | Resource Path |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Home - Local Skill Connect** | `041abbfb86664cf2b38b4c78c9301e76` | Mobile Screen | 780 × 3928 (390 × 1964 @2x) | `projects/14113995560909919430/screens/041abbfb86664cf2b38b4c78c9301e76` |

---

## 🎨 Color Palette

### 1. Brand & Core Action Colors
| Token / Name | Hex Code | Preview | Usage & Semantic Role |
| :--- | :--- | :---: | :--- |
| **Primary** | `#2563EB` | ![#2563EB](https://via.placeholder.com/16/2563EB/000000?text=+) | Electric Royal Blue. Core conversion loops, primary CTAs, active tab indicators, progress tracks. |
| **Secondary** | `#1E293B` | ![#1E293B](https://via.placeholder.com/16/1E293B/000000?text=+) | Slate Navy. Top app bars, category badges, key stat panels, prominent headings. |
| **Tertiary** | `#F59E0B` | ![#F59E0B](https://via.placeholder.com/16/F59E0B/000000?text=+) | Marigold Amber. Star ratings, active guarantee callouts, technician countdowns. |
| **Neutral / Dark** | `#0F172A` | ![#0F172A](https://via.placeholder.com/16/0F172A/000000?text=+) | Deep Slate. High-contrast typography and icon glyphs. |

### 2. Functional & Status Colors
| State | Hex Code | Preview | Purpose |
| :--- | :--- | :---: | :--- |
| **Verified Trust** | `#10B981` | ![#10B981](https://via.placeholder.com/16/10B981/000000?text=+) | Verified identity badges, police-cleared seals, completed jobs. |
| **Verified Trust Surface** | `#ECFDF5` | ![#ECFDF5](https://via.placeholder.com/16/ECFDF5/000000?text=+) | Tinted background for verified trust badges. |
| **Emergency / Alert** | `#EF4444` | ![#EF4444](https://via.placeholder.com/16/EF4444/000000?text=+) | High-visibility crimson for urgent triage, leaks, hazard response, cancel actions. |
| **Error Primary** | `#BA1A1A` | ![#BA1A1A](https://via.placeholder.com/16/BA1A1A/000000?text=+) | Form validation errors and alerts. |
| **Error Container** | `#FFDAD6` | ![#FFDAD6](https://via.placeholder.com/16/FFDAD6/000000?text=+) | Background container for error notices. |

### 3. Surface & Material Palette
| Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| `surface` / `background` | `#FAF8FF` | Luminous pearl base ground |
| `surface-container-lowest` | `#FFFFFF` | Clean white card backgrounds, modals |
| `surface-container-low` | `#F2F3FF` | Low elevation subtle panels |
| `surface-container` | `#EAEDFF` | Default surface containers |
| `surface-container-high` | `#E2E7FF` | High-emphasis containers |
| `surface-container-highest` | `#DAE2FD` | Highlighted surfaces and subtle pill buttons |
| `on-surface` / `on-background`| `#131B2E` | High-contrast body copy on luminous ground |
| `on-surface-variant` | `#434655` | Secondary text, sub-labels, metadata |
| `outline` | `#737686` | Standard structural borders and dividing lines |
| `outline-variant` | `#C3C6D7` | Subtle dividers and chip strokes |
| `primary-container` | `#2563EB` | Active container fill |
| `on-primary-container` | `#EEEFFF` | Text on active container fill |
| `secondary-container` | `#D5E0F8` | Subdued secondary containers |
| `on-secondary-container` | `#586377` | Muted secondary text |

---

## ✍️ Typography

The design system employs **Outfit** for geometric display headers and currency metrics, paired with **Manrope** for legible UI copy, service scopes, and metadata.

### Typography Scale Table

| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Intended Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display-lg`** | Outfit | `36px` | 700 (Bold) | `44px` | `-0.02em` | Hero displays, promotional splash text |
| **`headline-lg`** | Outfit | `28px` | 600 (Semi-Bold) | `36px` | `-0.015em` | Main section headings (Desktop/Tablet) |
| **`headline-lg-mobile`** | Outfit | `24px` | 600 (Semi-Bold) | `32px` | `-0.01em` | Primary screen headers on mobile viewports |
| **`headline-md`** | Outfit | `20px` | 600 (Semi-Bold) | `28px` | `-0.01em` | Card group titles, service category headers |
| **`title-md`** | Outfit | `18px` | 500 (Medium) | `24px` | `0` | Service card titles, technician names |
| **`currency-md`** | Outfit | `18px` | 700 (Bold) | `24px` | `0` | Indian Rupee pricing (`₹1,499`) |
| **`body-lg`** | Manrope | `16px` | 400 (Regular) | `24px` | `0` | Primary descriptive paragraphs |
| **`body-md`** | Manrope | `14px` | 400 (Regular) | `20px` | `0` | Standard UI text, list item descriptions |
| **`body-sm`** | Manrope | `12px` | 400 (Regular) | `16px` | `0` | Captions, timestamps, secondary notes |
| **`label-lg`** | Manrope | `14px` | 600 (Semi-Bold) | `20px` | `+0.01em` | Buttons, tab bars, filter pill text |
| **`label-md`** | Manrope | `12px` | 600 (Semi-Bold) | `16px` | `+0.02em` | Badges, tags, form field labels |

### Currency & Metric Rules
- Always use **Outfit 700 (Bold)** or **600 (Semi-Bold)** for currency values.
- Keep the Rupee glyph (`₹`) locked to the integer baseline (do not superscript).
- Use standard Indian comma-separated numbering (e.g. `₹499`, `₹1,499`, `₹12,500`).

---

## 📐 Spacing & Layout Tokens

### Spacing Scale
| Token | Value | Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| `space-xs` | `0.25rem` | 4px | Micro-spacing, badge icon gap |
| `space-sm` | `0.5rem` | 8px | Gap between badge icon and text label |
| `space-md` | `1.0rem` | 16px | Standard internal padding for cards and inputs |
| `space-lg` | `1.5rem` | 24px | Section separation, container margins |
| `space-xl` | `2.0rem` | 32px | Major vertical section breaks |
| `gutter` | `1.0rem` | 16px | Grid gutter on mobile |
| `margin` | `1.0rem` | 16px | Screen outer horizontal margin |

### Responsive Grid
- **Mobile (Base ≤ 640px)**: 4 columns, 16px margins, 16px gutters. Fixed action bar anchored to bottom with 16px safe-area margins.
- **Tablet (641px - 1024px)**: 8 columns, 24px gutters, 24px outer margins. Split catalog/preview layout.
- **Desktop (1025px+)**: 12 columns, max content width 1200px, 24px gutters, 32px margins.

---

## 🔘 Corner Radii & Elevation

### Corner Radii (`rounded`)
| Token | Value | Applied To |
| :--- | :--- | :--- |
| `rounded-sm` | `0.5rem` (8px) | Small chips, inner indicators |
| `rounded` | `1.0rem` (16px) | Standard inputs, secondary buttons, notification banners |
| `rounded-md` | `1.5rem` (24px) | Modals, bottom sheet sheets |
| `rounded-lg` | `2.0rem` (32px) | Service listing cards, technician bios, preview tiles |
| `rounded-xl` | `3.0rem` (48px) | Large hero containers |
| `rounded-full`| `9999px` | Primary CTA buttons, filter chips, avatar badges |

### Elevation & Shadows
- **Level 0 (Ground)**: `#FAF8FF` flat surface.
- **Level 1 (Card Base)**: `0px 2px 8px -2px rgba(15, 23, 42, 0.05), 0px 4px 16px -4px rgba(37, 99, 235, 0.04)`, `1px solid #F1F5F9`.
- **Level 2 (Interactive Hover / Drag)**: `0px 8px 24px -4px rgba(15, 23, 42, 0.08), 0px 4px 12px -2px rgba(37, 99, 235, 0.06)`.
- **Level 3 (Sticky Bottom Tray & Modals)**: `0px 16px 36px -6px rgba(15, 23, 42, 0.12), 0px 0px 0px 1px rgba(226, 232, 240, 0.8)`.

---

## 🧩 Component Standards

### 1. Primary Buttons
- **Fill**: `#2563EB` (Electric Royal Blue), Active: `#1D4ED8`
- **Text**: `#FFFFFF`, Manrope `label-lg` (14px, 600 weight)
- **Geometry**: Height `52px`, `rounded-full` (9999px pill)
- **Active state**: `transform: scale(0.98)`

### 2. Category Chips & Filter Pills
- **Geometry**: Height `36px`, `rounded-full` (9999px pill)
- **Inactive**: Background `#F1F5F9`, text `#64748B`
- **Active**: Background `#2563EB`, text `#FFFFFF`, subtle ambient glow

### 3. Service Listing Cards
- **Background**: `#FFFFFF` with Level 1 shadow
- **Corner Radius**: `32px` (`rounded-lg`)
- **Padding**: `16px` to `20px`
- **Layout**:
  - **Top**: Category badge + Verified shield checkmark badge (`#10B981`)
  - **Center**: Professional title, technician avatar, star rating (`#F59E0B`), completed jobs count
  - **Bottom**: Fixed inspection rate in Outfit bold (`₹1,499`) with a direct "Book" button

### 4. Verified Trust Badges
- **Container**: Translucent emerald tint (`#ECFDF5`), border `1px solid rgba(16, 185, 129, 0.2)`
- **Icon**: Solid shield checkmark in `#10B981`
- **Label**: `#065F46`, Manrope `label-md` (`12px`, weight `600`)
