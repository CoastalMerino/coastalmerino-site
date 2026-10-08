# Photos

Drop a finished photo here with the same file name to replace a placeholder, then run `python3 build.py`
(it makes the resized copies in `images/r/`). Keep each original under about 400 KB (JPG, quality 75 to 80).

Every photo below is currently a free Unsplash placeholder (Unsplash License: free for commercial use,
no attribution required) and is marked `data-stock="unsplash"` in the page source. Several show other
brands' garments or logos, so all of them must be replaced or removed before launch. `build.py` counts them.

| File | Shape | Used on | What the real shot should be |
|---|---|---|---|
| hero.jpg | 16:9 (shoot wide) | Home hero | Polo worn on course, wide |
| tile-polo.jpg | 4:5 | Home tile 01 | The polo, clean product shot |
| tile-fabric.jpg | 4:5 | Home tile 02 | Fabric or knit detail |
| tile-course.jpg | 4:5 | Home tile 03 | After the round, clubhouse or dinner |
| fabric-macro.jpg | 1:1 | Home fabric section, product page | Piqué knit macro |
| polo-2.jpg | 4:5 | Product page, image 1 | Polo flat lay, front |
| polo-1.jpg | 4:5 | Product page, image 2 | Collar and placket detail |
| polo-3.jpg | 4:5 | Product page, image 3 | On model, front |
| polo-4.jpg | 4:5 | Product page, image 4 | Worn on course |
| polo-6.jpg | 4:5 | Product page, image 5 | Lifestyle, after the round |
| story-hero.jpg | 2:1 | Our Story banner | Founders or home course |
| story-walk.jpg | 4:5 | Our Story | Walking the course |
| progress-hero.jpg | 2:1 | Progress banner | Sheep on a New Zealand farm (from the supplier if possible) |
| step-idea.jpg | 4:5 | Progress 01, home strip | Your sketches, notes, or the reference polo |
| step-farm.jpg | 4:5 | Progress 02, home strip | The farm or flock the wool comes from |
| step-swatches.jpg | 4:5 | Progress 03, home strip | Your real swatches laid out on a table |
| step-yarn.jpg | 4:5 | Progress 04, home strip | Mill photo: yarn cones or the knitting machine |
| step-sample.jpg | 4:5 | Progress 05, home strip | Pattern pieces, cutting, or the first sample being sewn |

Progress page: when a stage is finished, swap its photo, change its status (`status done`), and update the text in `src/pages/progress.html` and the home strip in `src/pages/index.html`.
