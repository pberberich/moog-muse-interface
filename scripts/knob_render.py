"""Blender headless script: renders a Moog-style skirted knob as a rotation
filmstrip — the same technique commercial plugin GUIs use (PBR materials,
studio lighting, shadow catcher, one frame per rotation step).

Run:  blender -b -P knob_render.py -- <out_dir> <frames> <res>
"""

import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT_DIR = argv[0] if len(argv) > 0 else "/tmp/knob-frames"
FRAMES = int(argv[1]) if len(argv) > 1 else 64
RES = int(argv[2]) if len(argv) > 2 else 256
# KNOB_POINTER=0 renders a pointer-less base for runtime pointer compositing
POINTER = os.environ.get("KNOB_POINTER", "1") != "0"

os.makedirs(OUT_DIR, exist_ok=True)

# ---------- clean scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------- materials ----------

def principled(name, base, rough, clearcoat=0.0, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    # blender 3.x uses "Clearcoat", 4.x "Coat Weight"
    for key in ("Coat Weight", "Clearcoat"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = clearcoat
            break
    return mat


rubber = principled("skirt", (0.012, 0.012, 0.013), 0.55)
plastic = principled("cap", (0.016, 0.016, 0.018), 0.32, clearcoat=0.45)
white = principled("pointer", (0.85, 0.83, 0.78), 0.35)

# ---------- knob geometry (parented to a rotator empty) ----------

rotator = bpy.data.objects.new("rotator", None)
scene.collection.objects.link(rotator)


def add_cyl(name, r, depth, z, mat, bevel=0.04):
    bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=r, depth=depth, location=(0, 0, z))
    obj = bpy.context.active_object
    obj.name = name
    mod = obj.modifiers.new("bevel", "BEVEL")
    mod.width = bevel
    mod.segments = 5
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    obj.parent = rotator
    return obj


# skirt: slightly tapered drum
skirt = add_cyl("skirt", 1.0, 0.42, 0.21, rubber, bevel=0.06)
skirt.scale = (1.0, 1.0, 1.0)

# cap: taller drum with generous bevel so it reads as a domed top
cap = add_cyl("cap", 0.64, 0.5, 0.55, plastic, bevel=0.16)

# pointer: thin white bar inset across the cap top, running to its edge
if POINTER:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.29, 0.815))
    ptr = bpy.context.active_object
    ptr.name = "pointer"
    ptr.scale = (0.055, 0.33, 0.012)
    ptr.data.materials.append(white)
    ptr.parent = rotator

    # skirt pointer notch: short bar on the skirt top surface
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.82, 0.435))
    notch = bpy.context.active_object
    notch.name = "notch"
    notch.scale = (0.055, 0.16, 0.012)
    notch.data.materials.append(white)
    notch.parent = rotator

# No shadow catcher: the UI composites a clean CSS drop shadow instead,
# avoiding Cycles alpha noise in the soft shadow.

# ---------- lights: key top-left, fill right, rim top ----------

def area_light(name, loc, rot, energy, size):
    light = bpy.data.lights.new(name, "AREA")
    light.energy = energy
    light.size = size
    obj = bpy.data.objects.new(name, light)
    obj.location = loc
    obj.rotation_euler = rot
    scene.collection.objects.link(obj)
    return obj


area_light("key", (-2.2, 2.6, 4.0), (math.radians(-28), math.radians(-24), 0), 320, 3.2)
area_light("fill", (2.8, -1.4, 3.0), (math.radians(18), math.radians(34), 0), 70, 4.0)
area_light("rim", (0.4, -3.0, 1.4), (math.radians(68), 0, 0), 45, 2.0)

world = bpy.data.worlds.new("world")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.045, 0.045, 0.05, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
scene.world = world

# ---------- camera: orthographic, straight top-down ----------
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 2.95
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (0, 0, 6)
cam.rotation_euler = (0, 0, 0)
scene.collection.objects.link(cam)
scene.camera = cam

# ---------- render settings ----------
scene.render.engine = "CYCLES"
scene.cycles.samples = 160
scene.cycles.use_denoising = False  # this blender build ships without OIDN
scene.cycles.device = "CPU"
scene.render.resolution_x = RES
scene.render.resolution_y = RES
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

# ---------- render the sweep: -135deg (min) to +135deg (max) ----------
for i in range(FRAMES):
    angle = -135.0 + 270.0 * i / max(FRAMES - 1, 1)
    # screen-clockwise pointer motion = negative z rotation in blender
    rotator.rotation_euler = (0, 0, math.radians(-angle))
    scene.render.filepath = os.path.join(OUT_DIR, f"frame_{i:03d}.png")
    bpy.ops.render.render(write_still=True)

print(f"rendered {FRAMES} frames at {RES}px to {OUT_DIR}")
