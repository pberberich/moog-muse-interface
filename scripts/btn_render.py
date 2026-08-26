"""Blender headless script: renders the panel push-button caps as sprites —
chunky beveled rectangular caps in the hardware's gray and accent colors,
lit with the same studio setup as the knob and fader renders.

Run:  blender -b -P btn_render.py -- <out_dir>
Outputs btn-gray.png, btn-yellow.png, btn-orange.png, btn-cyan.png.
"""

import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT_DIR = argv[0] if len(argv) > 0 else "/tmp/btn-frames"
os.makedirs(OUT_DIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

CAPS = {
    "btn-gray": (0.055, 0.055, 0.060),
    "btn-yellow": (0.750, 0.520, 0.030),
    "btn-orange": (0.780, 0.190, 0.028),
    "btn-cyan": (0.030, 0.420, 0.480),
}


def cap_material(name, base):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.34
    for key in ("Coat Weight", "Clearcoat"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = 0.45
            break
    return mat


def area_light(name, loc, rot, energy, size):
    light = bpy.data.lights.new(name, "AREA")
    light.energy = energy
    light.size = size
    obj = bpy.data.objects.new(name, light)
    obj.location = loc
    obj.rotation_euler = rot
    scene.collection.objects.link(obj)
    return obj


area_light("key", (-2.2, 2.6, 4.0), (math.radians(-28), math.radians(-24), 0), 300, 3.2)
area_light("fill", (2.8, -1.4, 3.0), (math.radians(18), math.radians(34), 0), 80, 4.0)

world = bpy.data.worlds.new("world")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.045, 0.045, 0.05, 1)
scene.world = world

cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 1.7
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (0, 0, 6)
scene.collection.objects.link(cam)
scene.camera = cam

scene.render.engine = "CYCLES"
scene.cycles.samples = 200
scene.cycles.use_denoising = False
scene.cycles.device = "CPU"
scene.render.resolution_x = 200
scene.render.resolution_y = 160
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

# cap: chunky beveled block whose rounded top reads as a molded button face
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.16))
cap = bpy.context.active_object
cap.scale = (0.62, 0.40, 0.16)
mod = cap.modifiers.new("bevel", "BEVEL")
mod.width = 0.10
mod.segments = 6
bpy.ops.object.shade_smooth()

for name, base in CAPS.items():
    cap.data.materials.clear()
    cap.data.materials.append(cap_material(name, base))
    scene.render.filepath = os.path.join(OUT_DIR, f"{name}.png")
    bpy.ops.render.render(write_still=True)

print("rendered button caps")
