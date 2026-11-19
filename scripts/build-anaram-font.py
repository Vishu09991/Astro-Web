"""Build the Unicode web font from the supplied AMS Anaram2 TTF (requires fontTools)."""

from pathlib import Path

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
source = TTFont(ROOT / 'assets/fonts/Ams Anaram.ttf')
legacy = source.getBestCmap()
outlines = source.getGlyphSet()
glyphs = {}
metrics = {}
cmap = {}


def draw_legacy(pen, character, x=0, y=0, scale=1):
    recording = DecomposingRecordingPen(outlines)
    outlines[legacy[ord(character)]].draw(recording)
    recording.replay(TransformPen(pen, (scale, 0, 0, scale, x, y)))


def save_glyph(name, pen, advance):
    glyph = pen.glyph()
    glyph.recalcBounds(glyphs)
    glyphs[name] = glyph
    metrics[name] = (advance, getattr(glyph, 'xMin', 0))
    return name


def sequence(name, keys, advance=None):
    """Join the original glyphs at their AMS keyboard advances."""
    pen = TTGlyphPen(None)
    width = 0
    for key in keys:
        draw_legacy(pen, key, width)
        width += source['hmtx'][legacy[ord(key)]][0]
    return save_glyph(name, pen, width if advance is None else advance)


def char_name(character):
    name = f'uni{ord(character):04X}'
    cmap[ord(character)] = name
    return name


def mark(name, key, mode, scale=1):
    """Put the attachment anchor at the outline centre, above or below the base."""
    bounds = source['glyf'][legacy[ord(key)]]
    x = -scale * (bounds.xMin + bounds.xMax) / 2
    y = -scale * (bounds.yMax if mode == 'below' else bounds.yMin)
    pen = TTGlyphPen(None)
    draw_legacy(pen, key, x, y, scale)
    return save_glyph(name, pen, 0)


save_glyph('.notdef', TTGlyphPen(None), 500)
sequence(char_name(' '), ' ')

# The source alphabet has full forms and forms that need the stem on the `a` key.
full = {
    'अ': 'A', 'आ': 'Aa', 'इ': 'q', 'ई': 'qQ', 'उ': 'w', 'ऊ': 'wU',
    'ऋ': 'R', 'ए': 'F', 'ऐ': 'Fe', 'ऑ': 'Aa`', 'ओ': 'Aae', 'औ': 'AaE',
    'क': 'k', 'छ': 'C', 'ट': 'o', 'ठ': 'O', 'ड': 'D', 'ढ': 'Z',
    'द': 'd', 'फ': 'f', 'र': 'r', 'ळ': 'L', 'ह': 'h', 'ॐ': '►', '॥': '☼',
}
half_keys = dict(zip('खगघचजझणतथधनपबभमयलवशषस', 'KgGcjJNtTYnpbBmylvSVs', strict=True))
for character, keys in (full | {character: key + 'a' for character, key in half_keys.items()}).items():
    sequence(char_name(character), keys)

# Ña is required before the browser can apply the legacy font's jña ligature.
# Build its standalone loop around the existing right-hand stem.
pen = TTGlyphPen(None)
draw_legacy(pen, 'a', 560)
pen.moveTo((0, 712))
pen.lineTo((650, 712))
pen.lineTo((650, 625))
pen.lineTo((0, 625))
pen.closePath()
pen.moveTo((44, 361))
pen.qCurveTo((121, 204), (270, 120), (403, 190), (479, 301), (578, 351))
pen.lineTo((578, 436))
pen.qCurveTo((494, 391), (458, 362))
pen.qCurveTo((445, 507), (321, 545), (194, 498), (160, 455))
pen.lineTo((224, 402))
pen.qCurveTo((294, 463), (371, 442), (374, 354))
pen.qCurveTo((377, 272), (292, 245), (186, 269), (109, 402))
pen.closePath()
save_glyph(char_name('ञ'), pen, 737)

for digit in range(10):
    sequence(char_name(chr(0x966 + digit)), str(digit))
for character, key in {'ा': 'a', 'ि': 'i', 'ी': 'I', 'ः': ':'}.items():
    sequence(char_name(character), key)

# The legacy double danda consists of two independent strokes.
double_danda = DecomposingRecordingPen(outlines)
outlines[legacy[ord('☼')]].draw(double_danda)
first_stroke = next(index for index, (operation, _) in enumerate(double_danda.value)
                    if operation == 'closePath')
double_danda.value = double_danda.value[:first_stroke + 1]
pen = TTGlyphPen(None)
double_danda.replay(TransformPen(pen, (1, 0, 0, 1, 26, 0)))
save_glyph(char_name('।'), pen, 355)

above = {}
below = {}
for character, key, height in [('ँ', '~', 740), ('ं', '/', 755), ('ॅ', '`', 730), ('े', 'e', 697), ('ै', 'E', 697)]:
    above[mark(char_name(character), key, 'above', .86)] = height
for character, key, scale, height in [('़', '.', .53, -54), ('्', 'x', .72, -22), ('ु', 'u', .83, 16),
                                      ('ू', 'U', .83, 16), ('ृ', '&', .8, -5)]:
    below[mark(char_name(character), key, 'below', scale)] = height
for character in '\u200c\u200d':
    save_glyph(char_name(character), TTGlyphPen(None), 0)

# Drawing the upper portion and the stem separately keeps the top accent anchored
# to the stem for the O, AU and candra O signs.
for character, key in {'ॉ': '`', 'ो': 'e', 'ौ': 'E'}.items():
    sequence(char_name(character), 'a' + key)

half = {}
for character, key in half_keys.items():
    half[cmap[ord(character)]] = sequence(cmap[ord(character)] + '.half', key)
half[cmap[ord('क')]] = sequence('uni0915.half', '|')

ligatures = {
    'त्र': ('taRa', 'Pa'), 'श्र': ('shaRa', 'Ma'),
    'क्ष': ('kaSsa', '♠'), 'ज्ञ': ('jaNya', '♂'), 'ह्म': ('haMa', '♀'),
    'ह्य': ('haYa', '♪'), 'ह्र': ('haRa', '♥'),
}
for pair, (name, keys) in ligatures.items():
    sequence(name, keys)
half['taRa'] = sequence('taRa.half', 'P')
half['shaRa'] = sequence('shaRa.half', 'M')
above[mark('reph', 'Q', 'above', .87)] = 724
below[mark('rakar', 'X', 'below', .85)] = 45

font = FontBuilder(source['head'].unitsPerEm, isTTF=True)
font.setupGlyphOrder(list(glyphs))
font.setupCharacterMap(cmap)
font.setupGlyf(glyphs)
font.setupHorizontalMetrics(metrics)
font.setupHorizontalHeader(ascent=930, descent=-625)
font.setupOS2(version=4, sTypoAscender=930, sTypoDescender=-625, usWinAscent=1280, usWinDescent=625,
              fsSelection=192, fsType=source['OS/2'].fsType)
font.setupNameTable({
    'copyright': source['name'].getDebugName(0),
    'familyName': 'AMS Anaram Unicode', 'styleName': 'Regular',
    'uniqueFontIdentifier': 'AMSAnaramUnicode-Regular', 'fullName': 'AMS Anaram Unicode Regular',
    'psName': 'AMSAnaramUnicode-Regular', 'trademark': source['name'].getDebugName(7),
    'manufacturer': source['name'].getDebugName(8), 'designer': source['name'].getDebugName(9),
})
font.setupPost(keepGlyphNames=False)


def glyph_name(character):
    return cmap[ord(character)]


virama = glyph_name('्')
combining = above | below | {glyph_name(character): 0 for character in 'ािीॉोौ'}
base_glyphs = [name for cp, name in cmap.items() if 0x905 <= cp <= 0x939]
base_glyphs += [name for name, _ in ligatures.values()]
features = ['languagesystem DFLT dflt;', 'languagesystem dev2 dflt;', 'languagesystem deva dflt;']
features += ['@Bases = [' + ' '.join(base_glyphs + list(half.values())) + '];',
             '@Marks = [' + ' '.join(combining) + '];',
             'table GDEF { GlyphClassDef @Bases, , @Marks, ; } GDEF;']
features += ['feature akhn {']
for pair, (name, _) in ligatures.items():
    features.append('sub ' + ' '.join(map(glyph_name, pair)) + f' by {name};')
features += ['} akhn;', f'feature rphf {{ sub {glyph_name("र")} {virama} by reph; }} rphf;',
             f'feature rkrf {{ sub {virama} {glyph_name("र")} by rakar; }} rkrf;', 'feature half {']
features += [f'sub {base} {virama} by {form};' for base, form in half.items()]
features += ['} half;']

for name in (*above, *below):
    features.append(f'markClass {name} <anchor 0 0> @attach_{name};')
features += ['feature mark {']
for name in base_glyphs + [glyph_name(character) for character in 'ािीॉोौ']:
    width = metrics[name][0]
    above_x = round(width * .70)
    below_x = round(width * .62)
    anchors = [f'<anchor {above_x} {height}> mark @attach_{glyph}' for glyph, height in above.items()]
    anchors += [f'<anchor {below_x} {height}> mark @attach_{glyph}' for glyph, height in below.items()]
    features.append(f'pos base {name} ' + ' '.join(anchors) + ';')
features += ['} mark;']

# Nasal marks follow the upper vowels in forms such as हैं and हों. Attach them
# to the right shoulder of the vowel rather than directly over its stroke.
features += ['feature mkmk {']
for character, x, y in [('ॅ', 150, 105), ('े', 150, 155), ('ै', 180, 155),
                          ('ॉ', 135, 860), ('ो', 131, 855), ('ौ', 170, 855)]:
    name = glyph_name(character)
    features.append(f'pos mark {name} <anchor {x} {y}> mark @attach_{glyph_name("ं")} '
                    f'<anchor {x} {y}> mark @attach_{glyph_name("ँ")};')
features += ['} mkmk;']

addOpenTypeFeaturesFromString(font.font, '\n'.join(features))
font.save(ROOT / 'public/fonts/ams-anaram-unicode.ttf')
