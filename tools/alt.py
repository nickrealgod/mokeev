from psd_tools import PSDImage
from PIL import Image
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent/'dist'; p=PSDImage.open('/Users/nickrealgod/Desktop/FREEDOM/Mokeev com/Source4png.psd');s=3840/25000
out=json.loads((root/'letters.js').read_text().removeprefix('window.LETTERS = ').removesuffix(';'));out['styles'].append('alt');folder=root/'assets/letters/alt';folder.mkdir(exist_ok=True)
for l in next(g for g in p if g.name=='Alt'):
 key=l.name.split()[0];slug={'€':'euro','*':'star'}.get(key,key.lower());im=l.topil().convert('RGBA');im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS);im.save(folder/(slug+'.png'),optimize=True);im.save(folder/(slug+'.webp'),quality=90,method=6);out['letters'][key]['alt']={'src':f'assets/letters/alt/{slug}.webp','x':round(l.left*s),'y':round(l.top*s),'w':im.width,'h':im.height};print(key,flush=True)
(root/'letters.js').write_text('window.LETTERS = '+json.dumps(out)+';')
