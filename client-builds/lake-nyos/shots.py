"""The 12 shots. Each build() makes its own set and returns update(t) (t = 0..4 s)."""
import math
import bpy
import numpy as np
from mathutils import Vector
from nyos import (Fog, Spheres, AMBER, FOG, MOON, aim_light, box, camera, cylinder, emission, exposure, fbm, handcart, heightfield,
                  house, lake_world, light, link, look, mats, mesh_obj, new_mat, oil_lantern, principled, rock, scatter,
                  sun_from, textured, tree_protos, world_gradient)


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def lerp(a, b, k):
    return tuple(a[i] + (b[i] - a[i]) * k for i in range(len(a)))


# ------------------------------------------------------------ shared camera path for the opening and the loop
P0, VEL, TGT = Vector((0, -1040, 470)), Vector((0, 62, -25)), (0, 70, -20)


def s01():
    """High-angle push-in over the calm crater lake; at 2 s the centre erupts."""
    M = mats()
    exposure(1.0)
    up = lake_world(M, eruption=True)
    cam = camera(30)

    def update(t):
        up(t)
        look(cam, P0 + VEL * t, TGT)
    return update


def s12():
    """The calm lake again, ending exactly where shot 1 begins (seamless loop)."""
    M = mats()
    exposure(1.0)
    up = lake_world(M, eruption=False)
    cam = camera(30)

    def update(t):
        up(t)
        look(cam, P0 + VEL * (t - 4.0), TGT)
    return update


# ------------------------------------------------------------ 2: the rim, mist spilling over like a liquid
def s02():
    M = mats()
    exposure(0.5)
    rng = np.random.default_rng(2)

    def fn(X, Y):
        z = -0.75 * np.log1p(np.exp(Y / 1.5)) * 1.5          # drop-off for y > 0 (soft knee at the lip)
        z += -0.5 * np.log1p(np.exp((-Y - 16) / 2.0)) * 2.0  # inner side falls toward the lake
        return z + 0.6 * fbm(X, Y, 0.12, 4, 2.0) + 0.15 * fbm(X, Y, 0.9, 2, 5.0)
    heightfield("rim", -45, 45, -60, 70, 180, 260, fn, M["basalt"])
    box("lakeplane", (0, -90, -16), (400, 60, 0.1), principled("lakew", (0.004, 0.02, 0.025), 0.04))
    for i in range(70):
        x, y = rng.uniform(-35, 35), rng.normal(-1, 3.5)
        z = float(fn(np.array([[x]]), np.array([[y]]))[0, 0])
        s = rng.uniform(0.4, 2.2) * (1.5 if abs(y) < 2 else 1)
        rock(f"r{i}", (x, y, z + s * 0.3), (s, s * rng.uniform(0.7, 1.3), s * 0.8), M["basalt"], seed=i, detail=1)
    world_gradient((0.002, 0.006, 0.016), (0.014, 0.034, 0.05), (0.003, 0.006, 0.01), stars=1.0)
    sun_from("moon", 190, 32, 2.2, MOON, angle=0.8)            # from behind the rim: back-lit mist
    light("AREA", "fill", 900, (0.4, 0.65, 0.8), (12, 14, 6), size=10).rotation_euler = (math.radians(60), 0, math.radians(140))
    fog = Fog("spill", ((-45, 45), (-60, 70), (-60, 10)), density=0.75, scale=0.16, thick=2.4, bill=0.55,
              slope=(0.0, -0.75, 0.0), axis="y", sign=1, flow=(0, 2.6, -1.95), wspeed=0.35, soft=5.0)
    cam = camera(24, dof=5.6)

    def update(t):
        fog.update(t, front=1.5 + 4.6 * t)
        loc = lerp((8.5, 10.0, -5.2), (7.6, 8.8, -4.6), ease(t / 4))
        look(cam, loc, (-1.5, -1.0, 0.2))
        cam.data.dof.focus_distance = (Vector(loc) - Vector((0, 1, -1))).length
    return update


# ------------------------------------------------------------ 3: wall of fog cascading down a jungle hillside
def s03():
    M = mats()
    exposure(0.8)
    rng = np.random.default_rng(3)
    SL = -0.62

    def fn(X, Y):
        return SL * Y + 5 * fbm(X, Y, 0.012, 4, 3.0) + 1.2 * fbm(X, Y, 0.08, 3, 6.0)
    heightfield("hill", -180, 180, -80, 340, 200, 240, fn, M["ground"])
    trees = tree_protos(M, seed=5)
    pts, sc = [], []
    for _ in range(1300):
        x, y = rng.uniform(-170, 170), rng.uniform(-70, 330)
        pts.append((x, y, float(fn(np.array([[x]]), np.array([[y]]))[0, 0]) - 0.4))
        sc.append(rng.uniform(0.9, 1.6))
    scatter(trees, pts, sc, rng)
    world_gradient((0.002, 0.006, 0.016), (0.014, 0.034, 0.05), (0.003, 0.006, 0.01), stars=1.0)
    sun_from("moon", 250, 30, 1.8, MOON, angle=0.8)
    fog = Fog("wall", ((-180, 180), (-80, 340), (-230, 60)), density=0.42, scale=0.022, thick=26, bill=0.7,
              slope=(SL, 0.0, 0.0), axis="y", sign=1, flow=(0, 20, 20 * SL), wspeed=0.7, soft=28)
    cam = camera(30)

    def update(t):
        front = 25 + 24 * t
        fog.update(t, front)
        cy = front - 34
        gz = SL * cy
        look(cam, (118, cy, gz + 34), (0, cy + 26, SL * (cy + 26) + 8))
    return update


# ------------------------------------------------------------ village (shots 4-7)
def village(M, mode="night", lantern=True):
    rng = np.random.default_rng(11)

    def fn(X, Y):
        ax = np.abs(X)
        z = np.where(ax > 34, (ax - 34) * 0.55, 0) + np.where(Y > 170, (Y - 170) * 0.4, 0)
        return z + 2.5 * fbm(X, Y, 0.02, 3, 8.0) * np.clip((ax - 12) / 20, 0, 1)
    yard = textured("yard", (0.11, 0.06, 0.035), (0.07, 0.085, 0.035), scale=0.12, rough=0.95, bump=0.3)
    heightfield("valley", -160, 160, -80, 320, 170, 220, fn, yard)
    road = heightfield("road", -3.2, 3.2, -80, 260, 8, 300, lambda X, Y: 0.03 + 0.04 * np.sin(X * 0.9) * 0 + 0.02 * fbm(X, Y, 0.5, 2, 1.0), M["dirt"])
    k = 0
    for side in (-1, 1):
        y = -30.0 + (6 if side > 0 else 0)
        while y < 200:
            if not (side > 0 and 8 < y < 20):
                w, d, h = rng.uniform(4.5, 6.5), rng.uniform(6, 9), rng.uniform(2.6, 3.2)
                x = side * (6.6 + w / 2 + rng.uniform(0, 3.0))
                house(M, x, y, w, d, h, rng.uniform(-0.09, 0.09), k)
                k += 1
            y += rng.uniform(11, 16)
    trees = tree_protos(M, seed=8)
    pts, sc = [], []
    for _ in range(140):
        x = rng.choice([-1, 1]) * rng.uniform(16, 70)
        y = rng.uniform(-60, 260)
        pts.append((x, y, float(fn(np.array([[x]]), np.array([[y]]))[0, 0]) - 0.3))
        sc.append(rng.uniform(0.7, 1.3))
    scatter(trees, pts, sc, rng)
    parts = handcart(M, 2.1, 14.0, lantern=lantern and mode == "night")
    return parts


def night_sky():
    world_gradient((0.002, 0.006, 0.016), (0.014, 0.034, 0.05), (0.003, 0.006, 0.01), stars=1.0)
    return sun_from("moon", 10, 34, 1.4, MOON, angle=0.7)


def dawn_sky(strength=3.2):
    world_gradient((0.05, 0.09, 0.17), (0.62, 0.4, 0.22), (0.05, 0.04, 0.035), strength=0.9)
    return sun_from("sun", 95, 8, strength, (1.0, 0.66, 0.38), angle=1.5)


class Smoke:
    """thin wisp rising from a snuffed wick"""

    def __init__(self, at):
        self.ob = cylinder("smoke", (at[0], at[1], at[2] + 0.7), 0.22, 1.4, None)
        self.ob.display_type = "BOUNDS"
        m, g = new_mat("smoke")
        g.n.remove(g.n["Principled BSDF"])
        geo = g.node("ShaderNodeNewGeometry")
        tc = g.node("ShaderNodeTexCoord")
        mp = g.node("ShaderNodeMapping")
        g.link(tc.outputs["Object"], mp.inputs["Vector"])
        mp.inputs["Scale"].default_value = (2.5, 2.5, 1.0)
        nz = g.node("ShaderNodeTexNoise", noise_dimensions="4D", i_Scale=3.0, i_Detail=4.0, i_Distortion=1.2)
        g.link(mp.outputs[0], nz.inputs["Vector"])
        sep = g.node("ShaderNodeSeparateXYZ")
        g.link(tc.outputs["Object"], sep.inputs[0])
        # thin column: radial falloff, wider + fainter higher up
        r = g.math("SQRT", g.math("ADD", g.math("POWER", sep.outputs["X"], 2.0), g.math("POWER", sep.outputs["Y"], 2.0)))
        width = g.math("MULTIPLY_ADD", sep.outputs["Z"], 0.25, 0.32)
        core = g.maprange(g.math("DIVIDE", r, width), 0.2, 1.0, 1.0, 0.0)
        wisp = g.maprange(nz.outputs["Fac"], 0.45, 0.7, 0.0, 1.0)
        d = g.math("MULTIPLY", core.outputs[0], wisp.outputs[0])
        self.k = g.node("ShaderNodeValue")
        d = g.math("MULTIPLY", d, self.k.outputs[0])
        vol = g.node("ShaderNodeVolumePrincipled")
        vol.inputs["Color"].default_value = (0.75, 0.78, 0.8, 1)
        g.link(d, vol.inputs["Density"])
        g.link(vol.outputs[0], g.n["Material Output"].inputs["Volume"])
        self.ob.data.materials.append(m)
        self.mp, self.nz = mp, nz

    def update(self, t, k):
        self.k.outputs[0].default_value = 6.0 * k
        self.mp.inputs["Location"].default_value = (0, 0, -0.9 * t)
        self.nz.inputs["W"].default_value = t * 0.8


def s04():
    """Low backward track down the road; the fog wall swallows the cart and its lantern."""
    M = mats()
    exposure(1.1)
    parts = village(M, "night", lantern=True)
    night_sky()
    fog = Fog("roadfog", ((-48, 48), (-30, 230), (-1, 30)), density=0.85, scale=0.05, thick=13, bill=0.7,
              axis="y", sign=-1, flow=(0, -13, 0), wspeed=0.55, soft=10)
    lx, ly, lz = parts["light"].location
    smoke = Smoke((lx, ly, lz + 0.25))
    cam = camera(24)
    T_SNUFF = 2.45

    def update(t):
        front = 47 - 13 * t
        fog.update(t, front)
        f = 1.0 + 0.08 * math.sin(t * 23) + 0.05 * math.sin(t * 37)
        k = 1.0 if t < T_SNUFF else max(0.0, 1 - (t - T_SNUFF) / 0.35) * (0.6 + 0.4 * math.sin(t * 60))
        parts["light"].data.energy = 18 * f * k
        parts["flame_em"].inputs["Strength"].default_value = 30 * f * k
        parts["flame"].scale = (max(0.05, k), max(0.05, k), 2.0 * max(0.05, k))
        smoke.update(t, ease((t - T_SNUFF - 0.2) / 0.4) * (1 - ease((t - 3.7) / 0.3)))
        look(cam, (0.7, -3.0 - 2.3 * t, 0.9), (1.4, 32, 3.6))
    return update


def s05():
    """Tight on the cart wheel in a fast, ground-hugging current of mist."""
    M = mats()
    exposure(0.6)
    village(M, "night", lantern=False)
    night_sky()
    light("AREA", "rim", 140, (0.45, 0.75, 0.9), (2.7, 19, 2.2), size=3).rotation_euler = (math.radians(-70), 0, 0)
    fog = Fog("current", ((-9, 9), (2, 30), (-0.5, 4)), density=2.4, scale=0.42, thick=1.25, bill=0.5,
              axis="y", sign=-1, flow=(0.6, -8.5, 0), wspeed=1.3, soft=2)
    cam = camera(35, dof=2.8)
    hub = Vector((2.78, 14.2, 0.55))

    def update(t):
        fog.update(t, -500)
        loc = Vector(lerp((4.6, 11.4, 0.42), (3.75, 12.9, 0.5), ease(t / 4)))
        look(cam, loc, hub)
        cam.data.dof.focus_distance = (loc - hub).length
    return update


def s06():
    """Dawn: a slow aerial glide over the silent village. No fog, no movement."""
    M = mats()
    village(M, "dawn", lantern=False)
    dawn_sky()
    cam = camera(28)

    def update(t):
        k = t / 4
        look(cam, lerp((-22, -48, 30), (-15, -12, 27), k), lerp((3, 40, 2), (4, 75, 2), k))
    return update


def s07():
    """Ground level: the dead lantern, an overturned basket, spilled grain; tilt up to the empty road."""
    M = mats()
    village(M, "dawn", lantern=False)
    dawn_sky()
    rng = np.random.default_rng(4)
    base = (1.25, 6.0, 0.03)
    oil_lantern(M, (base[0] + 0.55, base[1] + 0.35, base[2]), lit=False)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.34, location=(base[0], base[1], 0.27))
    bk = bpy.context.object
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    for v in bk.data.vertices:
        v.select = v.co.z > 0.02
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.delete(type="VERT")
    bpy.ops.object.mode_set(mode="OBJECT")
    sol = bk.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.025
    bk.rotation_euler = (math.radians(100), 0, math.radians(35))
    bk.data.materials.append(M["weave"])
    bpy.ops.object.shade_smooth()
    n = 900
    grains = Spheres("grain", n, M["grain"], sub=1, squash=0.6)
    a = rng.normal(math.radians(215), 0.45, n)
    r = np.abs(rng.normal(0, 0.32, n)) + 0.12
    C = np.stack([base[0] + np.cos(a) * r, base[1] + np.sin(a) * r, np.full(n, 0.045)], 1)
    grains.set(C, rng.uniform(0.006, 0.01, n))
    cam = camera(28, dof=4.0)

    def update(t):
        k = ease(t / 4)
        loc = lerp((1.75, 4.55, 0.48), (1.6, 4.1, 0.8), k)
        tgt = lerp((base[0] + 0.1, base[1] + 0.2, 0.08), (0.2, 70, 3.0), k)
        look(cam, loc, tgt)
        cam.data.dof.focus_distance = 1.3 + 40 * k ** 2
    return update


# ------------------------------------------------------------ 8: scientific cutaway of the lake
def s08():
    M = mats()
    world_gradient((0.003, 0.008, 0.018), (0.006, 0.014, 0.024), (0.002, 0.004, 0.008), strength=1.0)
    wm, g = new_mat("cutwater")
    g.n.remove(g.n["Principled BSDF"])
    tr = g.node("ShaderNodeBsdfTransparent")
    gl = g.node("ShaderNodeBsdfGlossy", i_Roughness=0.05)
    mx = g.node("ShaderNodeMixShader", i_Fac=0.12)
    g.link(tr.outputs[0], mx.inputs[1])
    g.link(gl.outputs[0], mx.inputs[2])
    g.link(mx.outputs[0], g.n["Material Output"].inputs["Surface"])
    vol = g.node("ShaderNodeVolumeAbsorption", i_Density=0.05)
    vol.inputs["Color"].default_value = (0.2, 0.7, 0.75, 1)
    sc_ = g.node("ShaderNodeVolumeScatter", i_Density=0.06, i_Anisotropy=0.4)
    sc_.inputs["Color"].default_value = (0.4, 0.8, 0.85, 1)
    add = g.node("ShaderNodeAddShader")
    g.link(vol.outputs[0], add.inputs[0])
    g.link(sc_.outputs[0], add.inputs[1])
    g.link(add.outputs[0], g.n["Material Output"].inputs["Volume"])
    box("water", (0, 12, -20), (70, 24, 40), wm)
    silt = textured("silt", (0.1, 0.09, 0.075), (0.16, 0.14, 0.11), scale=0.3, rough=0.95, bump=0.4)
    mud = textured("mud", (0.045, 0.04, 0.035), (0.08, 0.07, 0.06), scale=0.5, rough=0.95, bump=0.4)
    box("silt", (0, 12, -43), (70, 24, 6), silt)
    box("mud", (0, 12, -49), (70, 24, 6), mud)
    box("bedrock", (0, 12, -66), (70, 24, 28), M["basalt"])
    gm, g2 = new_mat("gas")
    g2.n.remove(g2.n["Principled BSDF"])
    lw = g2.node("ShaderNodeLayerWeight", i_Blend=0.45)
    ge = None
    k = g2.math("POWER", g2.math("SUBTRACT", 1.0, lw.outputs["Facing"]), 1.6)
    em2 = g2.node("ShaderNodeEmission")
    em2.inputs["Color"].default_value = (0.3, 0.82, 1.0, 1)
    g2.link(g2.math("MULTIPLY", k, 1.1), em2.inputs["Strength"])
    g2.link(em2.outputs[0], g2.n["Material Output"].inputs["Surface"])
    ge = em2
    rng = np.random.default_rng(8)
    pockets = []
    for i, (x, r) in enumerate([(-24, 2.4), (-12, 3.4), (-1, 2.2), (9, 3.8), (21, 2.6), (30, 1.8), (-31, 1.6)]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(x, rng.uniform(-0.6, 0.8), -47.5 + rng.uniform(-1.5, 1.0)))
        ob = bpy.context.object
        ob.scale = (r * 1.6, r, r * 0.75)
        ob.data.materials.append(gm)
        bpy.ops.object.shade_smooth()
        pockets.append(ob)
    specks = Spheres("dissolved", 500, gm, sub=1)
    SP = np.stack([rng.uniform(-34, 34, 500), rng.uniform(0.1, 23, 500), rng.uniform(-40, -30, 500) ** 1], 1)
    SR = rng.uniform(0.04, 0.12, 500)
    sun_from("moon", 180, 60, 4.0, MOON, angle=1.0)
    light("AREA", "face", 6000, (0.5, 0.8, 0.9), (0, -40, -20), size=40).rotation_euler = (math.radians(90), 0, 0)
    cam = camera(30)

    def update(t):
        k = ease(t / 4)
        look(cam, lerp((0, -42, 7), (0, -38, -44), k), lerp((0, 10, -4), (0, 10, -46), k))
        pass
        P = SP.copy()
        P[:, 2] += 0.4 * t + 0.3 * np.sin(t + SP[:, 0])
        specks.set(P, SR)
    return update


# ------------------------------------------------------------ underwater
def water_volume(bounds, density=0.03, color=(0.18, 0.5, 0.55)):
    (x0, x1), (y0, y1), (z0, z1) = bounds
    ob = box("watervol", ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), (x1 - x0, y1 - y0, z1 - z0))
    ob.display_type = "BOUNDS"
    m, g = new_mat("watervol")
    g.n.remove(g.n["Principled BSDF"])
    v = g.node("ShaderNodeVolumePrincipled", i_Density=density, i_Anisotropy=0.6)
    v.inputs["Color"].default_value = (*color, 1)
    v.inputs["Absorption Color"].default_value = (0.25, 0.65, 0.7, 1)
    g.link(v.outputs[0], g.n["Material Output"].inputs["Volume"])
    ob.data.materials.append(m)
    return ob


def bubble_mat():
    m, g = new_mat("bubble2")
    b = g.n["Principled BSDF"]
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["IOR"].default_value = 0.76
    b.inputs["Roughness"].default_value = 0.0
    b.inputs["Emission Color"].default_value = (0.6, 0.95, 1.0, 1)
    lw = g.node("ShaderNodeLayerWeight", i_Blend=0.25)
    k = g.math("MULTIPLY", lw.outputs["Facing"], 1.4)
    g.link(k, b.inputs["Emission Strength"])
    return m


class Puff:
    """a cloud of stirred-up sediment"""

    def __init__(self, at, seed):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=at)
        self.ob = bpy.context.object
        self.ob.display_type = "BOUNDS"
        m, g = new_mat(f"puff{seed}")
        g.n.remove(g.n["Principled BSDF"])
        tc = g.node("ShaderNodeTexCoord")
        nz = g.node("ShaderNodeTexNoise", noise_dimensions="4D", i_Scale=2.2, i_Detail=5.0, i_Distortion=0.5)
        g.link(tc.outputs["Object"], nz.inputs["Vector"])
        r = g.node("ShaderNodeVectorMath", operation="LENGTH")
        g.link(tc.outputs["Object"], r.inputs[0])
        fall = g.maprange(r.outputs["Value"], 0.3, 1.0, 1.0, 0.0)
        d = g.math("MULTIPLY", fall.outputs[0], g.maprange(nz.outputs["Fac"], 0.4, 0.7, 0.0, 1.0).outputs[0])
        self.k = g.node("ShaderNodeValue")
        d = g.math("MULTIPLY", d, self.k.outputs[0])
        v = g.node("ShaderNodeVolumePrincipled")
        v.inputs["Color"].default_value = (0.32, 0.3, 0.24, 1)
        g.link(d, v.inputs["Density"])
        g.link(v.outputs[0], g.n["Material Output"].inputs["Volume"])
        self.ob.data.materials.append(m)
        self.nz, self.at = nz, at

    def update(self, t, t0):
        if t < t0:
            self.ob.scale = (0.01, 0.01, 0.01)
            self.k.outputs[0].default_value = 0
            return
        a = t - t0
        s = 0.6 + 4.5 * (1 - math.exp(-a * 1.6))
        self.ob.scale = (s, s, s * 0.6)
        self.ob.location = (self.at[0], self.at[1], self.at[2] + s * 0.35)
        self.k.outputs[0].default_value = 3.0 * math.exp(-a * 0.7)
        self.nz.inputs["W"].default_value = a * 0.5


def s09():
    """Lake bottom: rocks crash into the sediment, triggering the gas burst."""
    M = mats()
    rng = np.random.default_rng(9)
    world_gradient((0.01, 0.03, 0.035), (0.004, 0.012, 0.015), (0.002, 0.004, 0.005))
    water_volume(((-60, 60), (-60, 60), (-2, 46)), density=0.045)
    silt = textured("silt", (0.04, 0.05, 0.045), (0.09, 0.1, 0.085), scale=0.25, rough=0.95, bump=0.6)
    heightfield("bed", -60, 60, -60, 60, 160, 160, lambda X, Y: 0.8 * fbm(X, Y, 0.05, 5, 1.0) + 0.2 * fbm(X, Y, 0.5, 3, 2.0), silt)
    for i in range(60):
        x, y = rng.uniform(-40, 40), rng.uniform(-30, 50)
        s = rng.uniform(0.2, 1.1)
        rock(f"br{i}", (x, y, s * 0.2), (s, s, s * 0.7), M["basalt"], seed=i)
    falls = []
    for i, (x, y, z0, tc, s) in enumerate([(-1.5, 9, 30, 1.25, 1.9), (2.5, 11, 34, 1.55, 1.5), (0.5, 6, 27, 1.85, 1.2)]):
        falls.append((rock(f"fall{i}", (x, y, z0), (s, s * 1.1, s * 0.8), M["basalt"], seed=90 + i), (x, y, z0, tc, s)))
    puffs = [Puff((x, y, 0.2), i) for i, (_, (x, y, z0, tc, s)) in enumerate(falls)]
    sun_from("surface", 150, 75, 3.0, (0.55, 0.9, 1.0), angle=4)
    light("SPOT", "shaft", 90000, (0.5, 0.88, 0.95), (6, 10, 44), size=3, spot=(30, 0.6)).rotation_euler = (0, 0, 0)
    light("POINT", "glow", 1500, (0.4, 0.8, 0.9), (-6, 2, 6), size=2)
    N = 2600
    bub = Spheres("bubbles", N, bubble_mat(), sub=1)
    B_x = rng.normal(0.5, 3.0, N)
    B_y = rng.normal(9, 3.0, N)
    B_t0 = 1.45 + rng.power(0.55, N) * 2.6          # emission accelerates
    B_v = rng.uniform(1.6, 4.5, N)
    B_r = rng.uniform(0.04, 0.16, N)
    B_ph = rng.uniform(0, 6.28, N)
    cam = camera(24)

    def update(t):
        for ob, (x, y, z0, tc, s) in falls:
            if t < tc:
                k = t / tc
                z = z0 - (z0 - s * 0.55) * (k ** 1.6)
                ob.location = (x, y, z)
                ob.rotation_euler = (t * 0.4, t * 0.25, 0)
            else:
                a = t - tc
                ob.location = (x, y, s * 0.55 - 0.35 * (1 - math.exp(-a * 4)))
        for p, (_, (x, y, z0, tc, s)) in zip(puffs, falls):
            p.update(t, tc)
        alive = t > B_t0
        a = np.where(alive, t - B_t0, 0)
        Z = 0.2 + B_v * a + 0.6 * a ** 2
        X = B_x + 0.25 * np.sin(a * 6 + B_ph) * (1 + Z * 0.05) + B_x * a * 0.08
        Y = B_y + 0.25 * np.cos(a * 5 + B_ph)
        C = np.stack([X, Y, Z], 1)[alive & (Z < 44)]
        R = (B_r * (1 + Z * 0.02))[alive & (Z < 44)]
        bub.set(C if len(C) else np.zeros((1, 3)), R if len(R) else np.zeros(1))
        look(cam, lerp((-15, -11, 2.6), (-12, -8, 3.3), ease(t / 4)), (0.5, 9, 5 + 3 * ease(t / 4)))
    return update


def s10():
    """Racing upward beside a roaring column of expanding bubbles toward the surface."""
    M = mats()
    rng = np.random.default_rng(10)
    world_gradient((0.25, 0.6, 0.62), (0.12, 0.35, 0.4), (0.01, 0.02, 0.025), strength=1.6)
    water_volume(((-60, 60), (-60, 60), (-6, 66)), density=0.022)
    # the surface seen from below
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 66))
    surf = bpy.context.object
    oc = surf.modifiers.new("ocean", "OCEAN")
    oc.geometry_mode = "GENERATE"
    oc.size = 2.0
    oc.spatial_size = 60
    oc.resolution = 10
    oc.repeat_x = oc.repeat_y = 3
    oc.wave_scale = 0.6
    surf.location = (-90, -90, 66)
    surf.data.materials.append(principled("under_surface", (0.6, 0.9, 0.92), 0.02, Transmission_Weight=1.0, IOR=1.33))
    sun_from("sky", 160, 80, 4.0, (0.6, 0.92, 1.0), angle=3)
    N = 3200
    bub = Spheres("column", N, bubble_mat(), sub=1)
    Z0 = rng.uniform(-4, 66, N)
    V = rng.uniform(9, 15, N)
    TH = rng.uniform(0, 6.28, N)
    RR = np.abs(rng.normal(0, 1.0, N))
    BR = rng.uniform(0.04, 0.14, N)
    cam = camera(24)

    def update(t):
        oc.time = t * 1.2
        Z = (Z0 + V * t + 4) % 70 - 4
        spread = 0.7 + Z * 0.05
        X = np.cos(TH + Z * 0.08) * RR * spread
        Y = np.sin(TH + Z * 0.08) * RR * spread
        R = BR * (1 + np.clip(Z, 0, 66) * 0.03)
        bub.set(np.stack([X, Y, Z], 1), R)
        cz = 3 + 11.5 * ease(t / 4) * 4 * 0.97
        cz = 3 + 46 * (t / 4)
        look(cam, (6.5, -3.0, cz), (0, 0, cz + 7))
    return update


def s11():
    """Twilight orbit around the degassing raft: a steady fountain under an amber beacon."""
    M = mats()
    exposure(1.0)
    up = lake_world(M, raft=True, twilight=True)
    cam = camera(32)

    def update(t):
        up(t)
        a = math.radians(205 + 24 * t)
        look(cam, (27 * math.sin(a), 27 * math.cos(a), 6.5), (0, 0, 9.5))
    return update


SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12]
