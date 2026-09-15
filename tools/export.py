from psd_tools import PSDImage
from PIL import Image
from pathlib import Path
import json, shutil
root=Path(__file__).resolve().parent.parent/'dist'
p=PSDImage.open('/Users/nickrealgod/Desktop/FREEDOM/Mokeev com/Source4png.psd')
s=3840/25000
out={'width':3840,'height':round(10800*s),'styles':[], 'letters':{}}
preview=Image.new('RGBA',(3840,round(10800*s)),'white')
for group in p:
 if not group.is_group(): continue
 style=group.name.lower(); out['styles'].append(style)
 folder=root/'assets'/'letters'/style; folder.mkdir(parents=True,exist_ok=True)
 for l in group:
  key=l.name.split()[0]; key='M2' if 'copy' in l.name else key
  slug={'€':'euro','*':'star'}.get(key,key.lower())
  im=l.topil().convert('RGBA'); im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS)
  im.save(folder/(slug+'.png'),optimize=True)
  im.save(folder/(slug+'.webp'),quality=90,method=6)
  x,y=round(l.left*s),round(l.top*s)
  out['letters'].setdefault(key,{})[style]={'src':f'assets/letters/{style}/{slug}.webp','x':x,'y':y,'w':im.width,'h':im.height}
  if style=='white': preview.alpha_composite(im,(x,y))
  print(style,key,flush=True)
(root/'letters.js').write_text('window.LETTERS = '+json.dumps(out)+';')
preview.resize((1600,691)).convert('RGB').save(root.parent/'preview.jpg')
shutil.copy2('/Users/nickrealgod/Desktop/FREEDOM/Mokeev com/Mokeev Designer.pdf',root/'assets'/'Mokeev Designer.pdf')
