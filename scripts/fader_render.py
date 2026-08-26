"""Blender headless script: renders the white fader caps as sprites, top-down
with the same studio lighting as the knob filmstrip.

Run:  blender -b -P fader_render.py -- <out_dir>
Outputs fader-cap-v.png (wide cap for vertical faders) and fader-cap-h.png.
"""

import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT_DIR = argv[0] if len(argv) > 0 else "/tmp/fader-frames"
os.makedirs(OUT_DIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

mat = bpy.data.materials.new("cap")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.82, 0.80, 0.74, 1.0)
bsdf.inputs["Roughness"].default_value = 0.38


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
area_light("fill", (2.8, -1.4, 3.0), (math.radians(18), math.radians(34), 0), 70, 4.0)

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
scene.render.resolution_x = 160
scene.render.resolution_y = 160
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

# cap: smooth white pill, like the hardware's oval fader caps
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.16))
cap = bpy.context.active_object
cap.scale = (0.62, 0.36, 0.16)
mod = cap.modifiers.new("bevel", "BEVEL")
mod.width = 0.14
mod.segments = 7
cap.data.materials.append(mat)
bpy.ops.object.shade_smooth()

for name, rot in (("fader-cap-v", 0.0), ("fader-cap-h", 90.0)):
    cap.rotation_euler = (0, 0, math.radians(rot))
    scene.render.filepath = os.path.join(OUT_DIR, f"{name}.png")
    bpy.ops.render.render(write_still=True)

print("rendered fader caps")
