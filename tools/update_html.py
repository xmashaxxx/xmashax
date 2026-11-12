"""Update all 8 HTML pages: add SVG symbol, swap logo img to svg, rename brand, swap loader in index.html."""
import os, re

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIT  = "C:/Users/jacob/Downloads/loader-kit"

with open(os.path.join(KIT, "nav-symbol.html"), encoding="utf-8") as f:
    SYMBOL = f.read().strip()

with open(os.path.join(KIT, "loader-markup.html"), encoding="utf-8") as f:
    LOADER_NEW = f.read().strip()

SVG_BLOCK = '<svg width="0" height="0" style="position:absolute">' + SYMBOL + '</svg>'

FAILSAFE = ('<script>setTimeout(function(){var l=document.getElementById(\'loader\');'
            'if(l&&l.style.display!==\'none\'){l.style.display=\'none\';'
            'document.body.style.overflow=\'\'}},8000);</script>')

PAGES = ["index.html","about.html","work.html","contact.html",
         "studio.html","aerial.html","fire.html","character.html"]

OLD_NAV_IMG  = '<img class="nav-logo" src="assets/logo.png" alt="" width="30" height="30">'
NEW_NAV_SVG  = '<svg class="mk" width="40" height="45"><use href="#mk"/></svg>'
OLD_FOOT_IMG = '<img class="foot-mark" src="assets/logo.png" alt="" width="44" height="44">'
NEW_FOOT_SVG = '<svg class="mk foot-mark" width="62" height="70" aria-hidden="true"><use href="#mk"/></svg>'

OLD_LOADER_BLOCK = (
    '<!-- LOADER: greetings cycle on the first visit to Home, then the curtain lifts -->\n'
    '<div class="loader" id="loader">\n'
    '  <div class="word"><i class="dot"></i>Hello</div>\n'
    '  <div class="word"><i class="dot"></i>Hola</div>\n'
    '  <div class="word"><i class="dot"></i>Привет</div>\n'
    '  <div class="word"><i class="dot"></i>Bonjour</div>\n'
    '  <div class="word"><i class="dot"></i>Ciao</div>\n'
    '</div>'
)

for fname in PAGES:
    path = os.path.join(SITE, fname)
    with open(path, encoding="utf-8") as f:
        html = f.read()

    # 1. Insert SVG symbol block right after the opening <body...> tag
    html = re.sub(r'(<body[^>]*>)', r'\1\n' + SVG_BLOCK, html)

    # 2. Swap nav logo img → svg
    html = html.replace(OLD_NAV_IMG, NEW_NAV_SVG)

    # 3. Swap footer mark img → svg
    html = html.replace(OLD_FOOT_IMG, NEW_FOOT_SVG)

    # 4. Replace old loader markup in index.html with new loader + failsafe
    if fname == "index.html":
        html = html.replace(OLD_LOADER_BLOCK, LOADER_NEW + "\n" + FAILSAFE)

    # 5. Rename brand: XmashaX → xmasha (email mashamariakrasnova@gmail.com is unaffected)
    html = html.replace("XmashaX", "xmasha")

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Updated {fname}")

print("All done.")
