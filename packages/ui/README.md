# @dnd-domain/ui

React components and styles for the **Dusk** design system. Every app in the monorepo builds its
UI from this package: use its components rather than writing one-off ones, and when something is
missing, add it here first.

The components mirror Dusk's own component bundle (same props, behaviour and `ds-*` class names),
and `styles.css` holds Dusk's tokens as CSS variables plus its component rules.

## Long lists are filterable

Any list longer than 10 items gets a filter: `List`, `SideNav` (not when collapsed to icons),
the rows and value lists in `ShapeForm`, and the icon picker in `MediaEditor`. New list
components should do the same with `useFilter` and `FilterInput` (`FILTER_THRESHOLD` is the
cut-off). `List` takes `filter` to force it on or off, `filterNoun` for its placeholder, and
`filterText` on items whose title isn't plain text.

## Using it

Import the stylesheet once, at the root of the app, then use the components:

```tsx
import '@dnd-domain/ui/styles.css';
import { Button, Header, Logo } from '@dnd-domain/ui';
```

Dusk is dark-first: give the page `background: var(--charcoal-950)` and `color: var(--ink)`. Its
font is Montserrat; load it (in Next.js, with `next/font`) and point `--font-sans` at it if the
loader renames the family.

The components use hooks and browser events, so the build marks them as client components.

## Components

| Component                                   | Use                                                                                                                                                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`, `ButtonLink`                      | Actions: `primary` (amber, the one key action), `secondary`, `default`; `ButtonLink` opens a page                                                                                                                                                    |
| `Label`, `Input`, `Textarea`                | Text fields with label, hint and error                                                                                                                                                                                                               |
| `Combobox`                                  | A text field that filters a dropdown of options                                                                                                                                                                                                      |
| `Checkbox`, `Radio`, `RadioGroup`, `Switch` | Choices; selected states in purple                                                                                                                                                                                                                   |
| `Slider`                                    | A number in a range                                                                                                                                                                                                                                  |
| `TagInput`                                  | Tags as removable chips inside the field: type, then Tab, Enter or comma to add; suggestions from a fixed set when given                                                                                                                             |
| `List`                                      | Simple, rich (image, description, meta) or columnar lists, with a filter once longer than 10 items                                                                                                                                                   |
| `Card`                                      | Image, title, content and actions at elevation 2                                                                                                                                                                                                     |
| `Header`                                    | The top navigation bar, with an account menu or log-in buttons                                                                                                                                                                                       |
| `SideNav`                                   | Secondary navigation in groups: inline (collapsible to an icon strip) or as a drawer                                                                                                                                                                 |
| `Breadcrumb`, `Link`                        | Paths and text links                                                                                                                                                                                                                                 |
| `Badge`, `Chip`                             | Update indicators and tags                                                                                                                                                                                                                           |
| `Toolbar`                                   | Dockable icon or label buttons with tooltips                                                                                                                                                                                                         |
| `Text`                                      | Text in Dusk's type styles (display, headings, body, label, caption, code)                                                                                                                                                                           |
| `Logo`                                      | The Wanderlust compass mark and wordmark                                                                                                                                                                                                             |
| `Icon`, `IconButton`                        | Named stroke icons (from Lucide), and a 32px ghost button holding one                                                                                                                                                                                |
| `ShapeForm`                                 | A form generated from a shape (`inferShape` in `@dnd-domain/utils`): simple fields (and dice, as notation like `2d6 + 3`) in a grid, small groups inline, lists of entities as rows you add, edit and remove, opened one at a time with a trail back |
| `MediaEditor`                               | An item's picture: upload, generate, remove, and an icon picker                                                                                                                                                                                      |
| `FilterInput`, `useFilter`                  | Search over any list: every word must match, ignoring case and accents                                                                                                                                                                               |

`Text` (with an optional status `tone`), `TagInput`, `Logo`, `Icon`, `IconButton`, `ShapeForm`,
`MediaEditor`, SideNav's collapsible mode and Link's `as` (for router links) are additions: Dusk defines
type styles but no text component or icon set, the logo comes from the Wanderlust navigation
design, and the apps needed a drawer that collapses to icons, generated forms and image editing. Icons come from
[Lucide](https://lucide.dev), grouped by theme in `ICON_GROUPS`; add one there before using it.

`colors`, `fonts`, `space`, `radius` and `elevation` export the token values for code that
needs them outside CSS.

## Scripts

Built with tsdown to ESM and CommonJS with type declarations (and `dist/styles.css`), tested with
Vitest. Run `pnpm build`, `pnpm test`, `pnpm lint` or `pnpm typecheck` here, or the same scripts
from the repository root through Turbo.
