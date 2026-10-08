"""Export the top-level K new and V new PSD layers into the existing Alt set."""
import base64
import json
import sys
from pathlib import Path
from PIL import Image, ImageFilter
from psd_tools import PSDImage

root = Path(__file__).resolve().parent.parent / 'dist'
source = PSDImage.open(sys.argv[1])
manifest = root / 'letters.js'
data = json.loads(manifest.read_text().removeprefix('window.LETTERS = ').removesuffix(';'))
scale = data['width'] / source.width
layers = {layer.name: layer for layer in source}
for key in ('K', 'V'):
    layer = layers[key + ' new']
    image = layer.topil().convert('RGBA')
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.BICUBIC)
    alpha = image.getchannel('A')
    image = image.convert('RGB').filter(ImageFilter.UnsharpMask(radius=.5, percent=80, threshold=2)).convert('RGBA')
    image.putalpha(alpha)
    src = f'assets/letters/alt/{key.lower()}.webp'
    image.save(root / src, lossless=True, method=6)
    mask = alpha.resize((128, round(alpha.height * 128 / alpha.width)))
    bits = [value > 24 for value in mask.get_flattened_data()]
    packed = bytes(sum(int(bit) << j for j, bit in enumerate(bits[i:i+8])) for i in range(0, len(bits), 8))
    data['letters'][key]['alt'] = dict(src=src, x=round(layer.left * scale), y=round(layer.top * scale), w=image.width, h=image.height, maskH=mask.height, mask=base64.b64encode(packed).decode())
    print(key, image.size, data['letters'][key]['alt']['x'], data['letters'][key]['alt']['y'])
manifest.write_text('window.LETTERS = ' + json.dumps(data) + ';')
