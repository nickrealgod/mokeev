from psd_tools import PSDImage
from pathlib import Path
import json
p=PSDImage.open('/Users/nickrealgod/Desktop/FREEDOM/Mokeev com/Source4png.psd');out={}
for g in p:
 if g.name not in ['Color','Irridicent']:continue
 gradients=[]
 for l in g:
  for e in l.effects:
   if type(e).__name__!='GradientOverlay':continue
   d=e.descriptor;grad=d[b'Grad'];stops=[]
   for stop in grad[b'Clrs']:
    c=stop[b'Clr '];stops.append({'offset':int(stop[b'Lctn'])/4096,'color':'#'+''.join(f'{round(float(c[k])):02x}' for k in [b'Rd  ',b'Grn ',b'Bl  '])})
   entry={'name':str(grad[b'Nm  ']).rstrip('\x00'),'stops':stops,'angle':float(d[b'Angl']),'scale':float(d[b'Scl '])/100}
   print(g.name,l.name,entry,'mode',d[b'Md  '].enum)
   if entry not in gradients:gradients.append(entry)
 out[g.name.lower()]=gradients
Path('/Users/nickrealgod/Documents/Codex/mokeev-local/dist/gradients.js').write_text('window.GRADIENTS = '+json.dumps(out)+';')
