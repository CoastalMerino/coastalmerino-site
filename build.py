#!/usr/bin/env python3
"""Build the Coastal Merino static site.

Edit pages in src/pages/ and shared pieces in src/partials/, then run:

    python3 build.py

It writes the finished .html files to the repo root (what Netlify serves),
makes resized JPG + WebP copies of every photo in images/ into images/r/,
and prints a pre-launch checklist (placeholders and stock photos still in use).

Requires Python 3 and Pillow (pip install pillow).
"""
import hashlib
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
IMG = os.path.join(ROOT, "images")
RESIZED = os.path.join(IMG, "r")
WIDTHS = [480, 800, 1200, 1600, 2400]

ORG_JSONLD = ('<script type="application/ld+json">\n'
              '{"@context":"https://schema.org","@type":"Organization","name":"Coastal Merino",'
              '"url":"https://coastalmerino.com","logo":"https://coastalmerino.com/apple-touch-icon.png",'
              '"email":"hello@coastalmerino.com","sameAs":["https://www.instagram.com/coastalmerino"]}\n'
              '</script>\n')


def crumbs_jsonld(items):
    parts = []
    for i, (name, path) in enumerate(items, 1):
        parts.append('{"@type":"ListItem","position":%d,"name":"%s","item":"https://coastalmerino.com%s"}' % (i, name, path))
    return ('<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[%s]}\n</script>\n'
            % ",".join(parts))


# out file, path, title, description, extra settings
PAGES = [
    dict(src="index.html", out="index.html", path="/", title="Coastal Merino",
         og_title="Coastal Merino",
         description="The 100% merino golf polo. Coming soon.",
         jsonld=ORG_JSONLD, preload="polo-4.jpg", preload_sizes="(max-width: 900px) 100vw, 46vw"),
    dict(src="polo.html", out="polo.html", path="/polo", title="The Merino Polo | Coastal Merino",
         og_title="The Merino Polo", og_type="product", cur="polo",
         description="A golf polo knit entirely from superfine New Zealand merino. Nothing synthetic. Coming soon.",
         jsonld=crumbs_jsonld([("Home", "/"), ("The Merino Polo", "/polo")]), preload="polo-2.jpg",
         preload_sizes="(max-width: 960px) 100vw, 58vw"),
    dict(src="our-story.html", out="our-story.html", path="/our-story", title="Our Story | Coastal Merino",
         og_title="Our Story", cur="story",
         description="Why we're making a golf polo from 100% merino, and the standards behind every one.",
         jsonld=crumbs_jsonld([("Home", "/"), ("Our Story", "/our-story")]), preload="story-hero.jpg", preload_sizes="(max-width: 860px) 100vw, 48vw"),
    dict(src="progress.html", out="progress.html", path="/progress", title="Progress | Coastal Merino",
         og_title="From the farm to the first polo", cur="progress",
         description="Every step of making the first Coastal Merino polo, from the farm and fabric swatches to the first sample.",
         jsonld=crumbs_jsonld([("Home", "/"), ("Progress", "/progress")]), preload="progress-hero.jpg",
         preload_sizes="(max-width: 640px) 200vw, 100vw"),
    dict(src="faq.html", out="faq.html", path="/faq", title="Help & FAQ | Coastal Merino",
         og_title="Help & FAQ", cur="help",
         description="Answers about the Coastal Merino polo, the fabric, sizing, shipping, and returns.",
         jsonld="{{faq_jsonld}}"),
    dict(src="shipping.html", out="shipping.html", path="/shipping", title="Shipping | Coastal Merino",
         og_title="Shipping", cur="help",
         description="How Coastal Merino orders ship.",
         jsonld=crumbs_jsonld([("Home", "/"), ("Help", "/faq"), ("Shipping", "/shipping")])),
    dict(src="returns.html", out="returns.html", path="/returns", title="Returns & Exchanges | Coastal Merino",
         og_title="Returns & Exchanges", cur="help",
         description="How returns and exchanges work at Coastal Merino.",
         jsonld=crumbs_jsonld([("Home", "/"), ("Help", "/faq"), ("Returns & Exchanges", "/returns")])),
    dict(src="size-guide.html", out="size-guide.html", path="/size-guide", title="Size Guide | Coastal Merino",
         og_title="Size Guide", cur="help",
         description="How to find your size in the Coastal Merino polo.",
         jsonld=crumbs_jsonld([("Home", "/"), ("Help", "/faq"), ("Size Guide", "/size-guide")])),
    dict(src="privacy.html", out="privacy.html", path="/privacy", title="Privacy | Coastal Merino",
         og_title="Privacy",
         description="How Coastal Merino handles your information."),
    dict(src="404.html", out="404.html", path="/404", title="Page not found | Coastal Merino",
         og_title="Page not found", description="This page doesn't exist.", robots=True),
]


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def partial(name):
    return read(SRC, "partials", name + ".html")


def resize_all():
    """Make resized JPG and WebP copies of each photo. Skips ones already up to date."""
    os.makedirs(RESIZED, exist_ok=True)
    info = {}
    for name in sorted(os.listdir(IMG)):
        if not name.lower().endswith(".jpg"):
            continue
        src = os.path.join(IMG, name)
        stem = name[:-4]
        with Image.open(src) as im:
            im = im.convert("RGB")
            w, h = im.size
            widths = [x for x in WIDTHS if x < w] + [w]
            info[name] = (w, h, widths)
            mtime = os.path.getmtime(src)
            for x in widths:
                for ext in ("jpg", "webp"):
                    out = os.path.join(RESIZED, "%s-%d.%s" % (stem, x, ext))
                    if os.path.exists(out) and os.path.getmtime(out) >= mtime:
                        continue
                    r = im if x == w else im.resize((x, round(h * x / w)), Image.LANCZOS)
                    if ext == "jpg":
                        r.save(out, "JPEG", quality=78, optimize=True, progressive=True)
                    else:
                        r.save(out, "WEBP", quality=74, method=6)
    # remove resized copies of photos that no longer exist
    for f in os.listdir(RESIZED):
        if f.rsplit("-", 1)[0] + ".jpg" not in info:
            os.remove(os.path.join(RESIZED, f))
    return info


IMG_RE = re.compile(r'<img src="/images/([\w.-]+\.jpg)"([^>]*)>')


def picture(m, info):
    name, attrs = m.group(1), m.group(2)
    if name not in info:
        sys.exit("Missing image: images/%s" % name)
    w, h, widths = info[name]
    stem = name[:-4]
    sizes = re.search(r'sizes="([^"]*)"', attrs)
    sizes = sizes.group(1) if sizes else "100vw"
    attrs = re.sub(r'\s*sizes="[^"]*"', "", attrs)
    if "loading=" not in attrs:
        attrs += ' loading="lazy"'
    webp = ", ".join("/images/r/%s-%d.webp %dw" % (stem, x, x) for x in widths)
    jpg = ", ".join("/images/r/%s-%d.jpg %dw" % (stem, x, x) for x in widths)
    fallback = "/images/r/%s-%d.jpg" % (stem, widths[min(2, len(widths) - 1)])
    return ('<picture><source type="image/webp" srcset="%s" sizes="%s">'
            '<img src="%s" srcset="%s" sizes="%s" width="%d" height="%d" decoding="async"%s></picture>'
            % (webp, sizes, fallback, jpg, sizes, w, h, attrs))


def faq_jsonld(body):
    qs = re.findall(r"<summary>(.*?)</summary>\s*<p>(.*?)</p>", body, re.S)
    def clean(t):
        t = re.sub(r"<[^>]+>", "", t)
        return t.replace("\\", "\\\\").replace('"', '\\"').strip()
    items = ",".join('{"@type":"Question","name":"%s","acceptedAnswer":{"@type":"Answer","text":"%s"}}'
                     % (clean(q), clean(a)) for q, a in qs if "tbd" not in a)
    return ('<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[%s]}\n</script>\n'
            % items)


def minify_css():
    css = read(ROOT, "fonts", "fonts.css") + read(ROOT, "assets", "site.css")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)
    css = css.replace(";}", "}").strip()
    # keep the space in "and (" for media queries
    css = css.replace("and(", "and (")
    with open(os.path.join(ROOT, "assets", "site.min.css"), "w", encoding="utf-8") as f:
        f.write(css + "\n")


def main():
    minify_css()
    info = resize_all()
    version = hashlib.sha1((read(ROOT, "fonts", "fonts.css") + read(ROOT, "assets", "site.css") + read(ROOT, "assets", "site.js")).encode()).hexdigest()[:8]
    head, header, footer = partial("head"), partial("header"), partial("footer")
    report = []

    for p in PAGES:
        body = read(SRC, "pages", p["src"])
        body = re.sub(r"\{\{> ([\w-]+)\}\}", lambda m: partial(m.group(1)).rstrip("\n"), body)
        body = IMG_RE.sub(lambda m: picture(m, info), body)

        jsonld = p.get("jsonld", "")
        if jsonld == "{{faq_jsonld}}":
            jsonld = faq_jsonld(body)
        preload = ""
        if p.get("preload"):
            n = p["preload"]
            w, h, widths = info[n]
            stem = n[:-4]
            preload = ('<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="%s" imagesizes="%s">\n'
                       % (", ".join("/images/r/%s-%d.webp %dw" % (stem, x, x) for x in widths), p.get("preload_sizes", "100vw")))

        cur = p.get("cur", "")
        h = (head.replace("{{title}}", p["title"])
             .replace("{{og_title}}", p["og_title"])
             .replace("{{description}}", p["description"])
             .replace("{{path}}", "" if p["path"] == "/" else p["path"])
             .replace("{{og_type}}", p.get("og_type", "website"))
             .replace("{{robots}}", '<meta name="robots" content="noindex">\n' if p.get("robots") else "")
             .replace("{{jsonld}}", jsonld)
             .replace("{{preload_image}}", preload)
             .replace("{{version}}", version))
        if p["path"] == "/":
            h = h.replace('href="https://coastalmerino.com"', 'href="https://coastalmerino.com/"')
        hd = header
        for key in ("polo", "story", "help", "progress"):
            hd = hd.replace("{{cur_%s}}" % key, ' aria-current="page"' if cur == key else "")
        html = h + "\n" + hd + body.rstrip("\n") + "\n" + footer.replace("{{version}}", version)

        leftover = re.findall(r"\{\{[^}]*\}\}", html)
        if leftover:
            sys.exit("Unfilled placeholders in %s: %s" % (p["out"], leftover))
        with open(os.path.join(ROOT, p["out"]), "w", encoding="utf-8") as f:
            f.write(html)

        tbd = len(re.findall(r'class="tbd', html))
        stock = html.count('data-stock="unsplash"')
        report.append((p["out"], tbd, stock))

    print("Built %d pages (asset version %s)" % (len(PAGES), version))
    print("\nPre-launch checklist (must all be 0 before going live):")
    print("  %-18s %5s %7s" % ("page", "TBDs", "stock"))
    for out, tbd, stock in report:
        print("  %-18s %5d %7d" % (out, tbd, stock))


if __name__ == "__main__":
    main()
