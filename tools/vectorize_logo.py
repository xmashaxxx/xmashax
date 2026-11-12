import numpy as np, cv2, json, math
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure

im = Image.open('/mnt/user-data/uploads/c09a4e98-image.png').convert('RGBA')
a = np.array(im).astype(np.float32)
alpha = a[...,3]/255.0
lum = (0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2])/255.0
soft = np.clip((1.0-lum)*alpha, 0, 1)          # 1 = ink, 0 = paper/transparent
mask = soft > 0.5
lab, n = ndi.label(mask, structure=np.ones((3,3)))
areas = ndi.sum(mask, lab, range(1,n+1))
cents = ndi.center_of_mass(mask, lab, range(1,n+1))
moon_i = int(np.argmax(areas))+1

# sun center: minimum enclosing circle of the moon outline
mcnt,_ = cv2.findContours((lab==moon_i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
(cx,cy),R = cv2.minEnclosingCircle(max(mcnt,key=len))
print('moon outer circle', round(cx,1), round(cy,1), round(R,1))

# opening: biggest empty circle near the center that avoids moon and spike
dt = cv2.distanceTransform((~mask).astype(np.uint8), cv2.DIST_L2, 5)
yy,xx = np.mgrid[0:mask.shape[0],0:mask.shape[1]]
near = (xx-cx)**2+(yy-cy)**2 < (R*0.75)**2
dtn = np.where(near, dt, 0)
hy,hx = np.unravel_index(np.argmax(dtn), dtn.shape)
hr = float(dtn[hy,hx])
print('hole', hx, hy, round(hr,1))

def smooth_path(pts):
    # closed quadratic smoothing through edge midpoints
    n=len(pts)
    if n<3: return ''
    mid=lambda p,q:((p[0]+q[0])/2,(p[1]+q[1])/2)
    s=mid(pts[-1],pts[0])
    d=f"M{s[0]:.1f} {s[1]:.1f}"
    for i in range(n):
        p=pts[i]; q=pts[(i+1)%n]; m=mid(p,q)
        d+=f"Q{p[0]:.1f} {p[1]:.1f} {m[0]:.1f} {m[1]:.1f}"
    return d+"Z"

def comp_path(i, tol=0.7):
    region = ndi.binary_dilation(lab==i, iterations=4)
    s = np.where(region, soft, 0.0)
    s = np.pad(s,1)
    d=''
    for c in measure.find_contours(s, 0.5):
        if len(c)<8: continue
        c = measure.approximate_polygon(c, tol)
        pts=[(p[1]-1,p[0]-1) for p in c[:-1]]
        d+=smooth_path(pts)
    return d

pieces=[]
for i in range(1,n+1):
    ys,xs = np.where(lab==i)
    pieces.append(dict(i=i, area=float(areas[i-1]), cx=float(cents[i-1][1]), cy=float(cents[i-1][0]),
        x0=int(xs.min()),x1=int(xs.max()),y0=int(ys.min()),y1=int(ys.max())))
moon = [p for p in pieces if p['i']==moon_i][0]
# spike = tall thin comp whose x is near center; dot = smallest
spike = max([p for p in pieces if p['i']!=moon_i], key=lambda p:(p['y1']-p['y0']) if abs(p['cx']-cx)<80 and (p['x1']-p['x0'])<120 else 0)
dot = min(pieces,key=lambda p:p['area'])
rays=[p for p in pieces if p['i'] not in (moon_i,spike['i'],dot['i'])]
for r in rays:
    r['ang']=math.degrees(math.atan2(r['cx']-cx, -(r['cy']-cy)))%360   # 0 = top, clockwise
    r['dist']=math.hypot(r['cx']-cx, r['cy']-cy)
rays.sort(key=lambda r:r['ang'])
print('spike', spike['i'], 'dot', dot['i'], 'rays', len(rays))
print('ray angles', [round(r['ang']) for r in rays])

allx0=min(p['x0'] for p in pieces); allx1=max(p['x1'] for p in pieces)
ally0=min(p['y0'] for p in pieces); ally1=max(p['y1'] for p in pieces)
out=dict(cx=cx,cy=cy,R=R,hole=dict(x=float(hx),y=float(hy),r=hr),
    bbox=[allx0,ally0,allx1,ally1],
    moon=comp_path(moon_i), spike=comp_path(spike['i']), dot=comp_path(dot['i']),
    rays=[dict(id=f"ray-{k+1:02d}",d=comp_path(r['i']),cx=r['cx'],cy=r['cy'],ang=r['ang'],dist=r['dist'],
               x0=r['x0'],x1=r['x1'],y0=r['y0'],y1=r['y1']) for k,r in enumerate(rays)])
dtm=cv2.distanceTransform((lab==moon_i).astype(np.uint8),cv2.DIST_L2,5)
ty,tx=np.unravel_index(np.argmax(dtm),dtm.shape)
out['thick']=dict(x=float(tx),y=float(ty),r=float(dtm[ty,tx]))
print('thickest moon point',tx,ty,round(float(dtm[ty,tx]),1))
out['mono']=''.join(comp_path(p['i'],2.2) for p in pieces)
json.dump(out,open('/home/claude/work/logo_data.json','w'))
tot=len(out['moon'])+len(out['spike'])+len(out['dot'])+sum(len(r['d']) for r in out['rays'])
print('mono chars',len(out['mono'])); print('bbox',out['bbox'],' path chars total', tot)
