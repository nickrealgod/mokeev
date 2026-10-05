from psd_tools import PSDImage
from PIL import Image,ImageFilter
from pathlib import Path
import json,base64,collections
root=Path('/Users/nickrealgod/Documents/GitHub/mokeev/dist')
d=json.loads((root/'letters.js').read_text().removeprefix('window.LETTERS = ').removesuffix(';'))
p=PSDImage.open('/Users/nickrealgod/Desktop/FREEDOM/Mokeev com/Source4png.psd')
for g in p:
 if not g.is_group():continue
 style=g.name.lower()
 for l in g:
  key=l.name.split()[0];key='M2' if 'copy' in l.name else key
  if key not in d['letters'] or style not in d['letters'][key]:continue
  v=d['letters'][key][style];im=l.topil().convert('RGBA');size=(v['w'],v['h'])
  if key=='€' and style=='black':
   im.save(root/'assets/letters/black/euro-psd.png',optimize=True)
  small=im.resize(size,Image.Resampling.BICUBIC)
  alpha=small.getchannel('A');small=small.convert('RGB').filter(ImageFilter.UnsharpMask(radius=.5,percent=80,threshold=2)).convert('RGBA');small.putalpha(alpha)
  slug={'€':'euro','*':'star'}.get(key,key.lower());dest=root/f'assets/letters/{style}/{slug}.webp';dest.parent.mkdir(exist_ok=True);small.save(dest,lossless=True,method=6)
  v['src']=str(dest.relative_to(root));a=alpha.resize((128,round(alpha.height*128/alpha.width)));v['maskH']=a.height
  bits=[x>24 for x in a.getdata()];v['mask']=base64.b64encode(bytes(sum(int(b)<<j for j,b in enumerate(bits[i:i+8])) for i in range(0,len(bits),8))).decode()
 print(style,flush=True)
(root/'letters.js').write_text('window.LETTERS = '+json.dumps(d)+';')
im=Image.open(root/'assets/Background.jpg').convert('RGB');border=[im.getpixel((x,y)) for x in range(im.width) for y in [0,im.height-1]]+[im.getpixel((x,y)) for y in range(im.height) for x in [0,im.width-1]]
key=collections.Counter(tuple(round(c/8)*8 for c in rgb) for rgb in border).most_common(1)[0][0];print('BORDER',key,flush=True)
