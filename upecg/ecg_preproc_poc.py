# ecg_preproc_poc.py
import cv2
import numpy as np
from skimage.morphology import skeletonize
from scipy.signal import find_peaks

def read_img(path):
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    return img

def to_gray(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def quick_deskew(gray):
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=200, minLineLength=gray.shape[1]//4, maxLineGap=20)
    if lines is None:
        return gray, 0.0
    angles = []
    for x1,y1,x2,y2 in lines[:,0]:
        ang = np.degrees(np.arctan2(y2-y1, x2-x1))
        if abs(ang) < 45:
            angles.append(ang)
    if len(angles)==0:
        return gray, 0.0
    angle = np.median(angles)
    M = cv2.getRotationMatrix2D((gray.shape[1]/2, gray.shape[0]/2), angle, 1.0)
    rotated = cv2.warpAffine(gray, M, (gray.shape[1], gray.shape[0]), flags=cv2.INTER_LINEAR)
    return rotated, angle

def estimate_grid_spacing(gray):
    # vertical projection
    proj = np.mean(255 - gray, axis=0)  # dark lines show as peaks
    # smooth
    kernel = np.ones(5)/5
    proj_s = np.convolve(proj, kernel, mode='same')
    # find peaks (they correspond to vertical grid lines)
    peaks, _ = find_peaks(proj_s, distance=5, height=np.percentile(proj_s,60))
    if len(peaks) < 4:
        return None
    diffs = np.diff(peaks)
    small_box = int(np.median(diffs))
    return small_box

def extract_trace_hint(img):
    # img: BGR
    b,g,r = cv2.split(img)
    red_score = cv2.subtract(r, cv2.add(g,b)//2)
    gray = to_gray(img)
    dark_score = cv2.subtract(255, gray)
    # normalize
    rs = cv2.normalize(red_score, None, 0, 255, cv2.NORM_MINMAX)
    ds = cv2.normalize(dark_score, None, 0, 255, cv2.NORM_MINMAX)
    trace_hint = cv2.max(rs, ds)
    trace_hint = cv2.GaussianBlur(trace_hint, (3,3), 0)
    return trace_hint

def get_trace_protection_mask(trace_hint, small_box_px):
    # adaptive threshold depending on small_box_px
    block = max(11, int(small_box_px*3)|1)  # ensure odd
    th = cv2.adaptiveThreshold(trace_hint, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                               cv2.THRESH_BINARY, block, -10)
    # morphological close to connect broken lines
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(1, small_box_px//6)))
    closed = cv2.morphologyEx(th, cv2.MORPH_CLOSE, k)
    # remove small components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(closed, connectivity=8)
    mask = np.zeros_like(closed)
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        w = stats[i, cv2.CC_STAT_WIDTH]
        h = stats[i, cv2.CC_STAT_HEIGHT]
        if area > max(20, small_box_px*2) or max(w,h) > small_box_px:  # heuristics
            mask[labels==i] = 255
    # dilate small amount to protect neighbors
    dil_r = max(1, int(round(small_box_px*0.02)))
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(dil_r*2+1,dil_r*2+1)))
    return mask

def detect_grid_mask(gray, small_box_px):
    # detect vertical and horizontal grid lines via morphological operations
    img_bin = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 51, 10)
    # vertical
    vert_k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(3, int(small_box_px*0.5))))
    vert = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, vert_k)
    # horizontal
    hor_k = cv2.getStructuringElement(cv2.MORPH_RECT, (max(3, int(small_box_px*0.5)), 1))
    hor = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, hor_k)
    grid_mask = cv2.bitwise_or(vert, hor)
    # optionally refine via thinning
    return grid_mask

def masked_inpaint_color(img_bgr, grid_mask, protect_mask):
    # inpaint only where grid_mask == 255 and protect_mask == 0
    mask = cv2.bitwise_and(grid_mask, cv2.bitwise_not(protect_mask))
    # convert to 8u single channel mask
    mask8 = (mask>0).astype('uint8')*255
    # inpaint on grayscale then blend? OpenCV inpaint supports 3-channel
    inpainted = cv2.inpaint(img_bgr, mask8, 3, cv2.INPAINT_TELEA)
    return inpainted

def final_trace_mask_from_processed(processed_img, small_box_px):
    gray = to_gray(processed_img)
    # adaptive threshold with smaller block to capture fine line
    block = max(9, int(small_box_px*2)|1)
    th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block, 5)
    # morphology to remove noise
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(1, small_box_px//6)))
    cleaned = cv2.morphologyEx(th, cv2.MORPH_OPEN, k)
    # skeletonize
    skeleton = skeletonize((cleaned>0).astype(np.uint8)).astype(np.uint8)*255
    return skeleton

def preproc_ecg_image(path):
    img = read_img(path)
    gray0 = to_gray(img)
    # deskew
    gray_ds, angle = quick_deskew(gray0)
    # attempt to estimate grid spacing
    small_box = estimate_grid_spacing(gray_ds)
    if small_box is None:
        # if cannot find, fallback guess based on image resolution
        small_box = max(4, int(min(img.shape[:2]) / 200))
    # color-based trace hint
    trace_hint = extract_trace_hint(img)
    protect_mask = get_trace_protection_mask(trace_hint, small_box)
    grid_mask = detect_grid_mask(gray_ds, small_box)
    inpainted = masked_inpaint_color(img, grid_mask, protect_mask)
    # further normalize contrast
    lab = cv2.cvtColor(inpainted, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l2 = clahe.apply(l)
    lab2 = cv2.merge([l2,a,b])
    img_norm = cv2.cvtColor(lab2, cv2.COLOR_LAB2BGR)
    # final mask
    skeleton = final_trace_mask_from_processed(img_norm, small_box)
    # assemble outputs
    grid_info = {'small_box_px': int(small_box), 'pixels_per_mm_est': float(small_box)}  # interpret small_box as px per mm
    return {'preproc_img': img_norm, 'trace_mask': skeleton, 'grid_info': grid_info, 'warnings': []}

if __name__ == "__main__":
    import sys
    path = sys.argv[1]
    out = preproc_ecg_image(path)
    cv2.imwrite('preproc.png', out['preproc_img'])
    cv2.imwrite('mask.png', out['trace_mask'])
    print("grid_info:", out['grid_info'])