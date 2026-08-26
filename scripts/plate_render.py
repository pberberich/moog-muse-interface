"""Blender headless script: bakes the entire faceplate as a 3D-rendered
plate (the Softube technique) — panel surface with grain, raised silkscreen
frames and text, tick rings, and branding — using the exact element
coordinates measured from the live DOM (scripts/stage-map.json, produced by
scripts/measure_stage.mjs). Live controls composite on top at runtime.

Run:  blender -b -P scripts/plate_render.py -- scripts/stage-map.json <out.png> [supersample]
"""

import json
import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
MAP_PATH = argv[0] if len(argv) > 0 else "scripts/stage-map.json"
OUT_PATH = argv[1] if len(argv) > 1 else "/tmp/panel-plate.png"
SS = int(argv[2]) if len(argv) > 2 else 2  # rendered pixels per stage unit

with open(MAP_PATH) as f:
    MAP = json.load(f)

W = MAP["stage"]["w"]
H = MAP["stage"]["h"]
U = 0.01  # blender units per stage px

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

FONT = bpy.data.fonts.load("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")

# ---------- materials ----------

def principled(name, base, rough, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


panel_mat = bpy.data.materials.new("panel")
panel_mat.use_nodes = True
nodes = panel_mat.node_tree.nodes
links = panel_mat.node_tree.links
bsdf = nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.0055, 0.0055, 0.0062, 1.0)
bsdf.inputs["Roughness"].default_value = 0.62
# matte panel: no specular, so the area lights never mirror into the shot
for key_name in ("Specular IOR Level", "Specular"):
    if key_name in bsdf.inputs:
        bsdf.inputs[key_name].default_value = 0.0
        break
noise = nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 900.0
noise.inputs["Detail"].default_value = 3.0
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.03
links.new(noise.outputs["Fac"], bump.inputs["Height"])
links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

silk = principled("silk", (0.62, 0.60, 0.53), 0.6)
silk_dim = principled("silk_dim", (0.44, 0.43, 0.38), 0.6)

Z_PANEL = 0.0
Z_PRINT = 0.004  # raised silkscreen


def to_xy(x_px, y_px):
    """Stage px (origin top-left, y down) -> blender XY (origin center)."""
    return ((x_px - W / 2) * U, (H / 2 - y_px) * U)


# ---------- panel base ----------
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, Z_PANEL))
panel = bpy.context.active_object
panel.scale = (W * U * 1.02, H * U * 1.02, 1)
panel.data.materials.append(panel_mat)


def add_box(cx_px, cy_px, w_px, h_px, z, depth, mat):
    x, y = to_xy(cx_px, cy_px)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    obj = bpy.context.active_object
    obj.scale = (w_px * U, h_px * U, depth)
    obj.data.materials.append(mat)
    return obj


# ---------- section frames: printed border lines ----------
LINE = 1.4  # px line weight
titles = [t for t in MAP["texts"] if t["kind"] == "title"]

for fr in MAP["frames"]:
    x, y, w, h = fr["x"], fr["y"], fr["w"], fr["h"]
    # the title text sits in a gap in the top border, like real silkscreen
    title = next(
        (
            t
            for t in titles
            if abs((t["y"] + t["h"] / 2) - y) < 10 and x < t["x"] + t["w"] / 2 < x + w
        ),
        None,
    )
    if title:
        pad = 5
        left_w = max(title["x"] - pad - x, 0)
        right_x = title["x"] + title["w"] + pad
        right_w = max(x + w - right_x, 0)
        if left_w > 0:
            add_box(x + left_w / 2, y + LINE / 2, left_w, LINE, Z_PRINT, 0.004, silk_dim)
        if right_w > 0:
            add_box(right_x + right_w / 2, y + LINE / 2, right_w, LINE, Z_PRINT, 0.004, silk_dim)
    else:
        add_box(x + w / 2, y + LINE / 2, w, LINE, Z_PRINT, 0.004, silk_dim)
    add_box(x + w / 2, y + h - LINE / 2, w, LINE, Z_PRINT, 0.004, silk_dim)  # bottom
    add_box(x + LINE / 2, y + h / 2, LINE, h, Z_PRINT, 0.004, silk_dim)  # left
    add_box(x + w - LINE / 2, y + h / 2, LINE, h, Z_PRINT, 0.004, silk_dim)  # right

if MAP.get("badgeFrame"):
    fr = MAP["badgeFrame"]
    x, y, w, h = fr["x"], fr["y"], fr["w"], fr["h"]
    for seg in (
        (x + w / 2, y + 1.5, w, 3),
        (x + w / 2, y + h - 1.5, w, 3),
        (x + 1.5, y + h / 2, 3, h),
        (x + w - 1.5, y + h / 2, 3, h),
    ):
        add_box(seg[0], seg[1], seg[2], seg[3], Z_PRINT, 0.004, silk)


# ---------- text ----------

def add_text(entry):
    body = entry["text"]
    if not body:
        return
    size_px = entry["fontSize"]
    # crude two-line balance when the box is clearly taller than one line
    if entry["h"] > size_px * 2.1 and " " in body:
        words = body.split()
        best, diff = 1, 1e9
        for i in range(1, len(words)):
            d = abs(len(" ".join(words[:i])) - len(" ".join(words[i:])))
            if d < diff:
                best, diff = i, d
        body = " ".join(words[:best]) + "\n" + " ".join(words[best:])

    curve = bpy.data.curves.new("t", type="FONT")
    curve.body = body.upper() if entry["kind"] != "badge" else body
    curve.font = FONT
    curve.size = size_px * U * 1.05
    curve.space_character = 1.0 + (entry["letterSpacing"] / max(size_px, 1)) * 1.6
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.space_line = 1.25
    curve.extrude = 0.0015
    obj = bpy.data.objects.new("t", curve)
    x, y = to_xy(entry["x"] + entry["w"] / 2, entry["y"] + entry["h"] / 2)
    obj.location = (x, y, Z_PRINT)
    kind = entry["kind"]
    obj.data.materials.append(silk if kind in ("title", "brandName", "badge") else silk_dim)
    scene.collection.objects.link(obj)


for entry in MAP["texts"]:
    add_text(entry)

# ---------- knob tick rings ----------
TICKS = 11
SWEEP = 270.0
START = -135.0
for knob in MAP["knobs"]:
    scale = knob["size"] / 64.0
    for i in range(TICKS):
        ang = START + SWEEP * i / (TICKS - 1)
        major = i in (0, TICKS - 1, (TICKS - 1) // 2)
        r0 = (26.5 if major else 27.5) * scale
        r1 = 30.5 * scale
        rad = math.radians(ang - 90)
        mx = knob["cx"] + math.cos(rad) * (r0 + r1) / 2
        my = knob["cy"] + math.sin(rad) * (r0 + r1) / 2
        length = r1 - r0
        box = add_box(mx, my, length, 1.3 * scale + (0.4 if major else 0), Z_PRINT, 0.003, silk_dim)
        box.rotation_euler = (0, 0, math.radians(-(ang - 90)))

# ---------- lighting: broad soft studio wash ----------

def area_light(name, loc, rot, energy, size):
    light = bpy.data.lights.new(name, "AREA")
    light.energy = energy
    light.size = size
    obj = bpy.data.objects.new(name, light)
    obj.location = loc
    obj.rotation_euler = rot
    scene.collection.objects.link(obj)
    return obj


key = area_light("key", (-6, 5, 14), (math.radians(-16), math.radians(-14), 0), 2600, 22)
fill = area_light("fill", (7, -4, 12), (math.radians(12), math.radians(18), 0), 900, 24)
# keep the wash but kill the mirror-like reflection of the light panels
key.visible_glossy = False
fill.visible_glossy = False

world = bpy.data.worlds.new("world")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.02, 0.022, 1)
scene.world = world

# ---------- camera ----------
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = W * U
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (0, 0, 10)
scene.collection.objects.link(cam)
scene.camera = cam

scene.render.engine = "CYCLES"
scene.cycles.samples = 96
scene.cycles.sample_clamp_indirect = 3.0
scene.cycles.use_denoising = False
scene.cycles.device = "CPU"
scene.render.resolution_x = W * SS
scene.render.resolution_y = H * SS
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUT_PATH

bpy.ops.render.render(write_still=True)
print(f"plate rendered to {OUT_PATH} at {W * SS}x{H * SS}")
