from PIL import Image
from pathlib import Path
import json,base64
root=Path(__file__).resolve().parent.parent/'dist';p=root/'letters.js';d=json.loads(p.read_text().removeprefix('window.LETTERS = ').removesuffix(';'))
for styles in d['letters'].values():
 for v in styles.values():
  im=Image.open(root/v['src']).getchannel('A'); im=im.resize((128,round(im.height*128/im.width)));v['maskH']=im.height
  bits=[a>24 for a in im.getdata()];packed=bytes(sum((int(b)<<j) for j,b in enumerate(bits[i:i+8])) for i in range(0,len(bits),8));v['mask']=base64.b64encode(packed).decode()
p.write_text('window.LETTERS = '+json.dumps(d)+';')
print('Assets:',sum(len(v) for v in d['letters'].values()))
print('WebP bytes:',sum(p.stat().st_size for p in (root/'assets/letters').rglob('*.webp')))
print('White bytes:',sum(p.stat().st_size for p in (root/'assets/letters/white').glob('*.webp')))
