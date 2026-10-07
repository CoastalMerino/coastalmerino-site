# Photo slots

Drop finished photos here with these exact names, then tell Claude to swap the placeholders on dev.

| Slot | File | Shape | What it shows |
|---|---|---|---|
| hero | hero.jpg | Full width, about 16:9 desktop, tall crop on mobile (shoot wide, about 3000px) | Polo worn on course, lifestyle |
| tile-polo | tile-polo.jpg | 4:5 (about 1600x2000) | The polo itself, clean product shot |
| tile-fabric | tile-fabric.jpg | 4:5 (about 1600x2000) | Fabric or knit detail |
| tile-course | tile-course.jpg | 4:5 (about 1600x2000) | Worn off the course, dinner or clubhouse |
| fabric-macro | fabric-macro.jpg | 1:1 (about 2000x2000) | Close-up of the piqué knit |

Keep each file under about 400 KB (export as JPG, quality 75 to 80).
Before going live, every slot must either have a photo or be removed. Placeholders should never reach the live site.

## Current stock photos (dev only, temporary)

All five slots currently hold free Unsplash photos (Unsplash License: free for commercial use, no attribution required). They show other brands' garments, so replace them with your own shots before launch. Each is marked `data-stock="unsplash"` in index.html so they're easy to find.

| Slot | Unsplash photo ID |
|---|---|
| hero | photo-1742498626081-a64f9677f468 |
| tile-polo | photo-1625910513394-ea511bed44ca |
| tile-fabric | photo-1602706294170-1fed8eecd9f9 |
| tile-course | photo-1780402411700-96a84f2f483a |
| fabric-macro | photo-1595026525047-dfa997df8a4a |
