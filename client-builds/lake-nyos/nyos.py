"""Lake Nyos, 1986: a 12-shot stylized cinematic 3D documentary (Blender Cycles, 9:16, 30 fps).

Everything is built procedurally with bpy: terrain, water, block houses, a
handcart with an oil lantern, a woven basket, the degassing raft. Motion is
simulated per frame in numpy (eruption ripples, fog fronts, falling rocks,
CO2 bubbles, fountain droplets) and written into the scene before each frame
is rendered. No people or animals appear anywhere: the aftermath is told
through stillness.

    blender -b -P client-builds/lake-nyos/render.py -- SHOT [first last] [--preview]
"""
import math
import bpy
import numpy as np
from mathutils import Vector, noise as mnoise

FPS = 30
SHOT_LEN = 4.0
RES = (432, 768)

# palette
MOON = (0.55, 0.86, 0.95)
AMBER = (1.0, 0.56, 0.18)
FOG = (0.80, 0.93, 0.96)


# ============================================================ scene + render
def reset(res=RES, samples=10, step_rate=8.0):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.fps = FPS
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.045
    sc.render.use_persistent_data = True
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 2
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 6
    sc.cycles.volume_bounces = 1
    sc.cycles.transparent_max_bounces = 8
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.cycles.volume_step_rate = step_rate
    sc.cycles.volume_max_steps = 128
    sc.cycles.tile_size = 512
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.exposure = 0.0
    return sc


def exposure(ev):
    bpy.context.scene.view_settings.exposure = ev


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def mesh_obj(name, verts, faces, smooth=True, mat=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    me.update()
    if smooth:
        me.shade_smooth()
    ob = link(bpy.data.objects.new(name, me))
    if mat:
        ob.data.materials.append(mat)
    return ob


def grid_faces(nx, ny):
    i = np.arange(nx - 1)[None, :] + np.arange(ny - 1)[:, None] * nx
    i = i.ravel()
    return np.stack([i, i + 1, i + nx + 1, i + nx], 1)


def heightfield(name, x0, x1, y0, y1, nx, ny, fn, mat=None):
    xs, ys = np.linspace(x0, x1, nx), np.linspace(y0, y1, ny)
    X, Y = np.meshgrid(xs, ys)
    Z = fn(X, Y)
    v = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    return mesh_obj(name, v, grid_faces(nx, ny), mat=mat)


def fbm(X, Y, scale=1.0, octaves=4, seed=0.0):
    """multi-octave Perlin noise over arrays (mathutils), roughly -1..1"""
    out = np.zeros_like(X, dtype=float)
    fx, fy = X.ravel() * scale, Y.ravel() * scale
    vals = np.array([mnoise.fractal(Vector((a, b, seed)), 1.0, 2.0, octaves) for a, b in zip(fx, fy)])
    out.flat[:] = vals
    return out


def box(name, center, size, mat=None, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center, rotation=rot)
    ob = bpy.context.object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = ob.modifiers.new("bev", "BEVEL")
        m.width = bevel
        m.segments = 2
    if mat:
        ob.data.materials.append(mat)
    return ob


def cylinder(name, center, r, depth, mat=None, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=center, rotation=rot)
    ob = bpy.context.object
    ob.name = name
    if mat:
        ob.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return ob


def rock(name, center, size, mat, seed=0, detail=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=detail + 2, radius=1, location=center)
    ob = bpy.context.object
    ob.name = name
    me = ob.data
    co = np.zeros(len(me.vertices) * 3)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    n = np.array([mnoise.fractal(Vector(p * 0.9 + seed * 7.3), 0.8, 2.0, 4) for p in co])
    co *= (1 + 0.32 * n)[:, None]
    co[:, 2] *= 0.7
    me.vertices.foreach_set("co", co.ravel())
    me.update()
    ob.scale = size
    ob.rotation_euler = (seed * 1.3, seed * 0.7, seed * 2.1)
    ob.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return ob


def look(cam, loc, target):
    cam.location = loc
    d = Vector(target) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(lens=30, dof=None):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_fit = "AUTO"
    cd.clip_start, cd.clip_end = 0.05, 20000
    if dof:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = dof
    cam = link(bpy.data.objects.new("cam", cd))
    bpy.context.scene.camera = cam
    return cam


def light(kind, name, energy, color, loc=(0, 0, 0), rot=(0, 0, 0), size=None, angle=None, spot=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if size is not None:
        ld.shadow_soft_size = size
    if angle is not None:
        ld.angle = math.radians(angle)
    if spot is not None:
        ld.spot_size = math.radians(spot[0])
        ld.spot_blend = spot[1]
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def sun_from(name, az_deg, el_deg, energy, color, angle=0.6):
    """sun light arriving FROM azimuth (0 = +y, 90 = +x) at elevation (degrees)"""
    ob = light("SUN", name, energy, color, angle=angle)
    a, e = math.radians(az_deg), math.radians(el_deg)
    ob.location = (math.sin(a) * math.cos(e) * 100, math.cos(a) * math.cos(e) * 100, math.sin(e) * 100)
    aim_light(ob, (0, 0, 0))
    return ob


def aim_light(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


# ============================================================ node helpers
class NT:
    """tiny node-graph builder"""

    def __init__(self, tree):
        self.t = tree
        self.n = tree.nodes
        self.l = tree.links

    def node(self, kind, **props):
        nd = self.n.new(kind)
        for k, v in props.items():
            if k.startswith("i_"):
                key = k[2:].replace("_", " ")
                nd.inputs[key].default_value = v
            else:
                setattr(nd, k, v)
        return nd

    def link(self, a, b):
        self.l.new(a, b)

    def math(self, op, a, b=None, c=None):
        nd = self.n.new("ShaderNodeMath")
        nd.operation = op
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                nd.inputs[i].default_value = v
            else:
                self.l.new(v, nd.inputs[i])
        return nd.outputs[0]

    def maprange(self, v, a, b, c, d, smooth=True):
        nd = self.n.new("ShaderNodeMapRange")
        nd.data_type = "FLOAT"
        nd.interpolation_type = "SMOOTHSTEP" if smooth else "LINEAR"
        nd.clamp = True
        if isinstance(v, (int, float)):
            nd.inputs["Value"].default_value = v
        else:
            self.l.new(v, nd.inputs["Value"])
        for name, val in (("From Min", a), ("From Max", b), ("To Min", c), ("To Max", d)):
            if isinstance(val, (int, float)):
                nd.inputs[name].default_value = val
            else:
                self.l.new(val, nd.inputs[name])
        return nd


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, NT(m.node_tree)


def principled(name, color, rough=0.5, metal=0.0, **kw):
    m, g = new_mat(name)
    b = g.n["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    for k, v in kw.items():
        b.inputs[k.replace("_", " ")].default_value = v
    return m


def textured(name, c1, c2, scale=3.0, rough=0.8, bump=0.3, kind="noise", metal=0.0, extra=None):
    """two-tone procedural surface with bump"""
    m, g = new_mat(name)
    b = g.n["Principled BSDF"]
    tc = g.node("ShaderNodeTexCoord")
    if kind == "voronoi":
        tx = g.node("ShaderNodeTexVoronoi", i_Scale=scale)
        fac = tx.outputs["Distance"]
    else:
        tx = g.node("ShaderNodeTexNoise", i_Scale=scale, i_Detail=8.0, i_Roughness=0.62)
        fac = tx.outputs["Fac"]
    g.link(tc.outputs["Object"], tx.inputs["Vector"])
    ramp = g.node("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*c1, 1)
    ramp.color_ramp.elements[1].color = (*c2, 1)
    g.link(fac, ramp.inputs["Fac"])
    g.link(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    bp = g.node("ShaderNodeBump", i_Strength=bump)
    g.link(fac, bp.inputs["Height"])
    g.link(bp.outputs["Normal"], b.inputs["Normal"])
    if extra:
        extra(g, b, tc)
    return m


def emission(name, color, strength):
    m, g = new_mat(name)
    g.n.remove(g.n["Principled BSDF"])
    e = g.node("ShaderNodeEmission", i_Strength=strength)
    e.inputs["Color"].default_value = (*color, 1)
    g.link(e.outputs[0], g.n["Material Output"].inputs["Surface"])
    return m, e


def glass(name, color=(1, 1, 1), ior=1.45, rough=0.02):
    return principled(name, color, rough, Transmission_Weight=1.0, IOR=ior)


def world_gradient(top, horizon, below=None, strength=1.0, stars=0.0):
    w = bpy.data.worlds.new("world")
    bpy.context.scene.world = w
    w.use_nodes = True
    g = NT(w.node_tree)
    bg = g.n["Background"]
    bg.inputs["Strength"].default_value = strength
    tc = g.node("ShaderNodeTexCoord")
    sep = g.node("ShaderNodeSeparateXYZ")
    g.link(tc.outputs["Generated"], sep.inputs[0])
    ramp = g.node("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.5, (*(below or horizon), 1)
    els[1].position, els[1].color = 1.0, (*top, 1)
    mid = els.new(0.56)
    mid.color = (*horizon, 1)
    zr = g.maprange(sep.outputs["Z"], -1, 1, 0, 1, smooth=False)
    g.link(zr.outputs[0], ramp.inputs["Fac"])
    col = ramp.outputs["Color"]
    if stars:
        vor = g.node("ShaderNodeTexVoronoi", i_Scale=420.0)
        g.link(tc.outputs["Generated"], vor.inputs["Vector"])
        st = g.maprange(vor.outputs["Distance"], 0.0, 0.05, stars, 0.0)
        up = g.maprange(sep.outputs["Z"], 0.15, 0.5, 0.0, 1.0)
        k = g.math("MULTIPLY", st.outputs[0], up.outputs[0])
        add = g.node("ShaderNodeMix", data_type="RGBA", blend_type="ADD")
        add.inputs["Factor"].default_value = 1.0
        g.link(col, add.inputs[6])
        g.link(k, add.inputs[7])
        col = add.outputs[2]
    g.link(col, bg.inputs["Color"])
    return w


# ============================================================ fog
class Fog:
    """Ground-hugging CO2 cloud: a volume whose density is billowing 4D noise,
    limited to a layer `thick` metres above a (possibly sloped) ground plane and
    to one side of an animated front. update(t) moves the flow + front."""

    def __init__(self, name, bounds, density=0.5, scale=0.06, thick=6.0, bill=0.6, slope=(0.0, 0.0, 0.0),
                 axis="y", sign=1, flow=(0, 0, 0), wspeed=0.25, color=FOG, aniso=0.35, soft=8.0, emit=0.0):
        (x0, x1), (y0, y1), (z0, z1) = bounds
        self.ob = box(name, ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), (x1 - x0, y1 - y0, z1 - z0))
        self.ob.display_type = "BOUNDS"
        m, g = new_mat(name)
        g.n.remove(g.n["Principled BSDF"])
        geo = g.node("ShaderNodeNewGeometry")
        mp = g.node("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (scale, scale, scale * 1.4)
        g.link(geo.outputs["Position"], mp.inputs["Vector"])
        na = g.node("ShaderNodeTexNoise", noise_dimensions="4D", i_Scale=1.0, i_Detail=7.0, i_Roughness=0.58, i_Distortion=0.35)
        nb = g.node("ShaderNodeTexNoise", noise_dimensions="4D", i_Scale=2.7, i_Detail=3.0, i_Roughness=0.5)
        g.link(mp.outputs[0], na.inputs["Vector"])
        g.link(mp.outputs[0], nb.inputs["Vector"])
        dn = g.maprange(na.outputs["Fac"], 0.36, 0.72, 0.0, 1.0)
        sep = g.node("ShaderNodeSeparateXYZ")
        g.link(geo.outputs["Position"], sep.inputs[0])
        # height above ground: z - (a*y + b*max(0, y - y0))
        a, b, yb = slope
        gy = g.math("MULTIPLY", sep.outputs["Y"], a)
        over = g.math("MAXIMUM", g.math("SUBTRACT", sep.outputs["Y"], yb), 0.0)
        ground = g.math("ADD", gy, g.math("MULTIPLY", over, b))
        h = g.math("SUBTRACT", sep.outputs["Z"], ground)
        wob = g.math("MULTIPLY", g.math("SUBTRACT", nb.outputs["Fac"], 0.5), bill * thick * 2.0)
        hm = g.maprange(g.math("ADD", h, wob), thick * 0.35, thick, 1.0, 0.0)
        floor_ = g.maprange(h, -2.0, 0.0, 0.0, 1.0)
        ax = sep.outputs[{"x": "X", "y": "Y", "z": "Z"}[axis]]
        self.front = g.maprange(ax, 0.0, soft, 1.0, 0.0) if sign > 0 else g.maprange(ax, 0.0, soft, 0.0, 1.0)
        self.soft, self.sign = soft, sign
        d = g.math("MULTIPLY", dn.outputs[0], hm.outputs[0])
        d = g.math("MULTIPLY", d, floor_.outputs[0])
        d = g.math("MULTIPLY", d, self.front.outputs[0])
        d = g.math("MULTIPLY", d, g.math("MULTIPLY_ADD", nb.outputs["Fac"], 0.8, 0.6))
        d = g.math("MULTIPLY", d, density)
        vol = g.node("ShaderNodeVolumePrincipled", i_Anisotropy=aniso)
        vol.inputs["Color"].default_value = (*color, 1)
        vol.inputs["Absorption Color"].default_value = (0.7, 0.85, 0.9, 1)
        if emit:
            vol.inputs["Emission Strength"].default_value = emit
            vol.inputs["Emission Color"].default_value = (*color, 1)
        g.link(d, vol.inputs["Density"])
        g.link(vol.outputs[0], g.n["Material Output"].inputs["Volume"])
        self.ob.data.materials.append(m)
        self.mp, self.na, self.nb = mp, na, nb
        self.flow, self.wspeed, self.scale = Vector(flow), wspeed, scale

    def update(self, t, front):
        off = -self.flow * t
        self.mp.inputs["Location"].default_value = (off.x * self.scale, off.y * self.scale, off.z * self.scale * 1.4)
        self.na.inputs["W"].default_value = t * self.wspeed
        self.nb.inputs["W"].default_value = 3.0 + t * self.wspeed * 1.3
        f = self.front
        if self.sign > 0:
            f.inputs["From Min"].default_value, f.inputs["From Max"].default_value = front - self.soft, front
        else:
            f.inputs["From Min"].default_value, f.inputs["From Max"].default_value = front, front + self.soft


# ============================================================ point clouds (bubbles, droplets, grain)
class Spheres:
    """many small spheres in ONE mesh; positions/radii set per frame"""

    def __init__(self, name, n, mat, sub=1, squash=1.0):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1)
        proto = bpy.context.object
        P = np.zeros(len(proto.data.vertices) * 3)
        proto.data.vertices.foreach_get("co", P)
        P = P.reshape(-1, 3)
        P[:, 2] *= squash
        F = np.array([list(p.vertices) for p in proto.data.polygons])
        bpy.data.objects.remove(proto)
        self.P, self.n = P, n
        faces = (F[None, :, :] + (np.arange(n) * len(P))[:, None, None]).reshape(-1, 3)
        verts = np.zeros((n * len(P), 3))
        self.ob = mesh_obj(name, verts, faces, smooth=True, mat=mat)

    def set(self, C, R):
        n = len(C)
        V = np.zeros((self.n, len(self.P), 3))
        V[:n] = C[:, None, :] + R[:, None, None] * self.P[None]
        V[n:] = C[0] if n else 0.0  # unused spheres collapse to a point
        self.ob.data.vertices.foreach_set("co", V.ravel())
        self.ob.data.update()


# ============================================================ shared materials
def mats():
    M = {}
    M["basalt"] = textured("basalt", (0.025, 0.024, 0.026), (0.07, 0.065, 0.06), scale=2.5, rough=0.9, bump=0.6, kind="voronoi")
    M["ground"] = textured("ground", (0.035, 0.06, 0.03), (0.09, 0.08, 0.05), scale=0.04, rough=0.95, bump=0.3)
    M["leaf"] = textured("leaf", (0.012, 0.035, 0.014), (0.03, 0.07, 0.025), scale=6.0, rough=0.7, bump=0.4)
    M["trunk"] = principled("trunk", (0.05, 0.035, 0.025), 0.85)
    M["dirt"] = textured("dirt", (0.16, 0.055, 0.03), (0.3, 0.12, 0.06), scale=1.8, rough=0.95, bump=0.5)
    M["plaster"] = textured("plaster", (0.36, 0.33, 0.28), (0.52, 0.47, 0.4), scale=1.2, rough=0.9, bump=0.25)
    M["plaster2"] = textured("plaster2", (0.42, 0.3, 0.22), (0.55, 0.42, 0.32), scale=1.2, rough=0.9, bump=0.25)

    def corrugate(g, b, tc):
        wv = g.node("ShaderNodeTexWave", wave_type="BANDS", bands_direction="X", i_Scale=14.0, i_Distortion=0.0)
        g.link(tc.outputs["Object"], wv.inputs["Vector"])
        bp2 = g.node("ShaderNodeBump", i_Strength=0.8)
        g.link(wv.outputs["Fac"], bp2.inputs["Height"])
        g.link(bp2.outputs["Normal"], b.inputs["Normal"])
    M["tin"] = textured("tin", (0.5, 0.47, 0.43), (0.36, 0.17, 0.08), scale=0.45, rough=0.38, bump=0.1, metal=0.8, extra=corrugate)
    M["wood"] = textured("wood", (0.12, 0.07, 0.035), (0.24, 0.15, 0.08), scale=4.0, rough=0.8, bump=0.4)
    M["darkwood"] = textured("darkwood", (0.04, 0.025, 0.015), (0.09, 0.055, 0.03), scale=4.0, rough=0.85, bump=0.4)
    M["iron"] = principled("iron", (0.05, 0.05, 0.055), 0.45, metal=0.9)
    M["rust"] = textured("rust", (0.08, 0.06, 0.05), (0.25, 0.1, 0.04), scale=3.0, rough=0.6, bump=0.2, metal=0.6)
    M["void"] = principled("void", (0.008, 0.008, 0.01), 0.9)
    M["glass"] = glass("glass", (0.95, 0.97, 0.95), 1.45, 0.03)
    M["soot"] = principled("soot", (0.15, 0.13, 0.11), 0.3, Transmission_Weight=0.6, IOR=1.45)
    M["weave"] = textured("weave", (0.32, 0.2, 0.09), (0.55, 0.38, 0.18), scale=22.0, rough=0.85, bump=0.6, kind="voronoi")
    M["grain"] = textured("grain", (0.55, 0.42, 0.2), (0.78, 0.64, 0.36), scale=40.0, rough=0.6, bump=0.1)
    M["bubble"] = principled("bubble", (1, 1, 1), 0.0, Transmission_Weight=1.0, IOR=0.75)
    M["drop"] = principled("drop", (0.9, 0.97, 1.0), 0.05, Transmission_Weight=1.0, IOR=1.33)
    return M


def water_material(name="water", deep=(0.004, 0.018, 0.022), ripple=0.15, foam=True):
    m, g = new_mat(name)
    b = g.n["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*deep, 1)
    b.inputs["Roughness"].default_value = 0.06
    b.inputs["IOR"].default_value = 1.33
    b.inputs["Specular IOR Level"].default_value = 0.6
    tc = g.node("ShaderNodeTexCoord")
    nz = g.node("ShaderNodeTexNoise", i_Scale=0.35, i_Detail=6.0, i_Roughness=0.6)
    g.link(tc.outputs["Object"], nz.inputs["Vector"])
    bp = g.node("ShaderNodeBump", i_Strength=ripple, i_Distance=0.4)
    g.link(nz.outputs["Fac"], bp.inputs["Height"])
    g.link(bp.outputs["Normal"], b.inputs["Normal"])
    if foam:
        at = g.node("ShaderNodeAttribute", attribute_name="foam")
        fb = g.node("ShaderNodeBsdfPrincipled")
        fb.inputs["Base Color"].default_value = (0.82, 0.92, 0.92, 1)
        fb.inputs["Roughness"].default_value = 0.65
        mix = g.node("ShaderNodeMixShader")
        fz = g.node("ShaderNodeTexNoise", i_Scale=2.5, i_Detail=4.0)
        g.link(tc.outputs["Object"], fz.inputs["Vector"])
        k = g.math("MULTIPLY", at.outputs["Fac"], g.math("MULTIPLY_ADD", fz.outputs["Fac"], 1.6, -0.2))
        g.link(g.maprange(k, 0.35, 0.75, 0.0, 1.0).outputs[0], mix.inputs[0])
        g.link(b.outputs[0], mix.inputs[1])
        g.link(fb.outputs[0], mix.inputs[2])
        g.link(mix.outputs[0], g.n["Material Output"].inputs["Surface"])
    return m


# ============================================================ props
def tree_protos(M, seed=1):
    """three stylized tropical tree shapes (trunk + clustered canopy)"""
    out = []
    rng = np.random.default_rng(seed)
    for k in range(3):
        parts = []
        tr = cylinder(f"trunk{k}", (0, 0, 4), 0.35, 8 + k * 2, M["trunk"], verts=10)
        parts.append(tr)
        for j in range(5 + k):
            c = (rng.uniform(-2.2, 2.2), rng.uniform(-2.2, 2.2), 8.5 + k * 2 + rng.uniform(-1, 2))
            parts.append(rock(f"can{k}_{j}", c, (rng.uniform(2.2, 3.6),) * 2 + (rng.uniform(1.6, 2.6),), M["leaf"], seed=k * 10 + j, detail=1))
        bpy.ops.object.select_all(action="DESELECT")
        for p in parts:
            p.select_set(True)
        bpy.context.view_layer.objects.active = parts[0]
        bpy.ops.object.join()
        ob = bpy.context.object
        ob.name = f"tree{k}"
        ob.location = (0, 0, -1000 - k * 50)
        out.append(ob)
    return out


def scatter(protos, pts, scales, rng):
    obs = []
    for i, (p, s) in enumerate(zip(pts, scales)):
        src = protos[i % len(protos)]
        ob = link(bpy.data.objects.new(f"inst{i}", src.data))
        ob.location = p
        ob.scale = (s, s, s * rng.uniform(0.85, 1.2))
        ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
        obs.append(ob)
    return obs


def house(M, x, y, w, d, h, rot, idx):
    walls = box(f"house{idx}", (x, y, h / 2), (w, d, h), M["plaster" if idx % 3 else "plaster2"], bevel=0.04, rot=(0, 0, rot))
    # mono-pitch corrugated tin roof with overhang
    tilt = 0.12 if idx % 2 else -0.12
    roof = box(f"roof{idx}", (x, y, h + 0.25), (w + 0.7, d + 0.9, 0.06), M["tin"], rot=(tilt, 0, rot))
    ca, sa = math.cos(rot), math.sin(rot)
    # door + two shuttered windows on the road side (-x local -> facing road)
    side = -1 if x > 0 else 1
    fx = x + side * (w / 2 + 0.02) * ca
    fy = y + side * (w / 2 + 0.02) * sa
    box(f"door{idx}", (fx, fy, 1.0), (0.06, 0.95, 2.0), M["darkwood"], rot=(0, 0, rot))
    for k in (-1, 1):
        box(f"win{idx}{k}", (fx, fy + k * d * 0.3, 1.5), (0.07, 0.8, 0.8), M["wood"], rot=(0, 0, rot))
    return walls, roof


def handcart(M, x, y, rot=0.0, lantern=True):
    parts = {}
    box("cartbed", (x, y, 0.85), (1.1, 1.8, 0.12), M["wood"], bevel=0.02, rot=(0, 0, rot))
    for s in (-1, 1):
        box(f"cartside{s}", (x + s * 0.55, y, 1.05), (0.06, 1.8, 0.35), M["wood"], rot=(0, 0, rot))
        box(f"handle{s}", (x + s * 0.35, y - 1.6, 0.95), (0.06, 1.6, 0.06), M["darkwood"], rot=(-0.12, 0, rot))
    for s in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.5, minor_radius=0.05, major_segments=40, minor_segments=10,
                                         location=(x + s * 0.68, y + 0.2, 0.55), rotation=(0, math.pi / 2, 0))
        bpy.context.object.scale = (1.0, 1.0, 1.0)
        bpy.context.object.data.materials.append(M["darkwood"])
        bpy.ops.object.shade_smooth()
        cylinder(f"hub{s}", (x + s * 0.7, y + 0.2, 0.55), 0.09, 0.16, M["iron"], rot=(0, math.pi / 2, rot))
        for k in range(8):
            a = k * math.pi / 4
            box(f"spoke{s}{k}", (x + s * 0.68, y + 0.2 - math.sin(a) * 0.25, 0.55 + math.cos(a) * 0.25), (0.035, 0.045, 0.46), M["darkwood"], rot=(a, 0, 0))
        bpy.ops.mesh.primitive_torus_add(major_radius=0.55, minor_radius=0.022, major_segments=48, minor_segments=8, location=(x + s * 0.68, y + 0.2, 0.55), rotation=(0, math.pi / 2, 0))
        bpy.context.object.data.materials.append(M["iron"])
    box("axle", (x, y + 0.2, 0.55), (1.45, 0.07, 0.07), M["iron"])
    # a few sacks on the cart
    for k, (dx, dy) in enumerate([(-0.2, 0.3), (0.22, -0.2), (0.0, 0.55)]):
        rock(f"sack{k}", (x + dx, y + dy, 1.15), (0.3, 0.42, 0.22), M["weave"], seed=40 + k, detail=1)
    if lantern:
        parts.update(oil_lantern(M, (x + 0.35, y - 0.65, 0.92)))
    return parts


def oil_lantern(M, base, lit=True):
    x, y, z = base
    cylinder("lantern_base", (x, y, z + 0.04), 0.09, 0.08, M["rust"])
    gl = cylinder("lantern_glass", (x, y, z + 0.2), 0.075, 0.24, M["glass"] if lit else M["soot"])
    bpy.ops.mesh.primitive_cone_add(radius1=0.1, radius2=0.03, depth=0.09, location=(x, y, z + 0.36))
    bpy.context.object.data.materials.append(M["rust"])
    for a in (0.6, 2.2, 3.8, 5.4):
        box("guard", (x + 0.085 * math.cos(a), y + 0.085 * math.sin(a), z + 0.2), (0.012, 0.012, 0.26), M["rust"])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.06, minor_radius=0.008, location=(x, y, z + 0.44), rotation=(math.pi / 2, 0, 0))
    bpy.context.object.data.materials.append(M["rust"])
    out = {"glass": gl}
    if lit:
        fm, fe = emission("flame", (1.0, 0.62, 0.22), 30.0)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, location=(x, y, z + 0.17))
        fl = bpy.context.object
        fl.scale = (1, 1, 2.0)
        fl.data.materials.append(fm)
        L = light("POINT", "lantern_light", 18.0, AMBER, (x, y, z + 0.2), size=0.04)
        out.update(flame=fl, flame_em=fe, light=L)
    return out


# ============================================================ terrain: the crater
def crater_height(X, Y):
    r = np.sqrt(X ** 2 + (Y * 1.15) ** 2)
    bowl = -45 + 45 * (r / 430) ** 2
    rim = 62 * np.exp(-((r - 540) / 120) ** 2)
    outer = np.where(r > 540, -0.1 * (r - 540), 0)
    z = np.where(r < 430, bowl, 0) + rim + outer + np.where((r >= 430) & (r < 540), 14 * (r - 430) / 110, 0)
    # a valley notch to the north where the gas poured out
    ang = np.arctan2(X, Y)
    notch = 70 * np.exp(-(ang / 0.22) ** 2) * np.exp(-((r - 560) / 160) ** 2)
    return z - notch


def lake_world(M, night=True, eruption=False, raft=False, twilight=False):
    """the crater lake set; returns update(t)"""
    rng = np.random.default_rng(7)
    def fn(X, Y):
        return crater_height(X, Y) + 18 * fbm(X, Y, 0.0045, 5, 1.0) + 3.5 * fbm(X, Y, 0.03, 3, 4.0)
    terr = heightfield("crater", -1400, 1400, -1400, 1400, 260, 260, fn, M["ground"])
    # rocky rim band
    trees = tree_protos(M)
    pts, sc = [], []
    for _ in range(900):
        a, r = rng.uniform(0, 6.283), rng.uniform(480, 1300)
        x, y = r * math.sin(a), r * math.cos(a) / 1.15
        z = float(fn(np.array([[x]]), np.array([[y]]))[0, 0])
        if z < 2:
            continue
        pts.append((x, y, z - 0.5))
        sc.append(rng.uniform(1.2, 2.2))
    scatter(trees, pts, sc, rng)
    # water
    n = 230
    xs = np.linspace(-520, 520, n)
    X, Y = np.meshgrid(xs, xs)
    W0 = np.stack([X.ravel(), Y.ravel(), np.zeros(X.size)], 1)
    wm = water_material(foam=eruption)
    water = mesh_obj("lake", W0, grid_faces(n, n), mat=wm)
    if eruption:
        foam = water.data.attributes.new("foam", "FLOAT", "POINT")
    R = np.sqrt(X.ravel() ** 2 + Y.ravel() ** 2)
    noise2 = fbm(X * 0.05, Y * 0.05, 1.0, 3, 9.0).ravel()
    # sky + light
    if twilight:
        world_gradient((0.01, 0.025, 0.07), (0.07, 0.11, 0.16), (0.006, 0.01, 0.016), strength=1.4, stars=0.4)
        sun_from("moon", 30, 25, 1.6, MOON, angle=2.0)
    else:
        world_gradient((0.002, 0.006, 0.016), (0.012, 0.03, 0.045), (0.003, 0.006, 0.01), strength=1.0, stars=1.2)
        sun_from("moon", 20, 32, 3.2, MOON, angle=2.5)
    # moon disc reflection source (out of frame, high)
    mm, _ = emission("moondisc", (0.75, 0.95, 1.0), 6.0)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=40, location=(-2400, 5200, 2600))
    bpy.context.object.data.materials.append(mm)
    raft_parts = build_raft(M) if raft else None
    drops = Spheres("drops", 2600, M["drop"], sub=1) if raft else None
    drng = np.random.default_rng(3)
    D_t0 = drng.uniform(0, 1.6, 2600)            # emission phase
    D_v = np.stack([drng.normal(0, 1.2, 2600), drng.normal(0, 1.2, 2600), drng.uniform(17, 22, 2600)], 1)

    def update(t):
        Z = np.zeros_like(R)
        if eruption and t > 1.9:
            te = t - 1.9
            dome = 38 * (1 - math.exp(-te * 2.6)) * np.exp(-(R / 62) ** 2) * (1 + 0.6 * noise2 * np.sin(te * 9 + R * 0.08))
            front = 95 * te
            env = np.clip((front - R) / 25, 0, 1) * np.exp(-R / 320)
            rings = 5.0 * np.sin(0.055 * R - 6.5 * te) * env
            Z = dome + rings + 3.0 * noise2 * np.exp(-(R / 110) ** 2) * min(1, te * 2)
            crest = np.clip((np.sin(0.055 * R - 6.5 * te) - 0.5) / 0.5, 0, 1) * env
            fo = np.clip(np.exp(-(R / 85) ** 2) * 1.4 * min(1, te * 3) * (0.6 + 0.6 * noise2) + crest * 0.9, 0, 1)
            foam.data.foreach_set("value", fo)
        elif eruption:
            foam.data.foreach_set("value", np.zeros_like(R))
        if raft:
            # gentle rings where the fountain rains back down
            Z = 0.12 * np.sin(0.9 * R - 4 * t) * np.exp(-((R - 14) / 10) ** 2)
        W = W0.copy()
        W[:, 2] = Z
        water.data.vertices.foreach_set("co", W.ravel())
        water.data.update()
        if raft:
            # ballistic droplets from the pipe mouth (0, 0, 7.5)
            age = (t + D_t0) % 1.6 + 0.0
            g = 9.81
            P = np.zeros((2600, 3))
            P[:, 0] = D_v[:, 0] * age
            P[:, 1] = D_v[:, 1] * age
            P[:, 2] = 7.5 + D_v[:, 2] * age - 0.5 * g * age ** 2 * 1.6
            P[:, 2] = np.maximum(P[:, 2], 0.05)
            rad = np.full(2600, 0.06) * (1 + age * 0.4)
            drops.set(P, rad)
    return update


def build_raft(M):
    box("raft_deck", (0, 0, 0.55), (7, 7, 0.2), M["wood"], bevel=0.05)
    for s in (-1, 1):
        cylinder(f"pontoon{s}", (s * 2.6, 0, 0.25), 0.6, 7.6, M["rust"], rot=(math.pi / 2, 0, 0))
    for x in (-3.4, 3.4):
        for y in (-3.4, 3.4):
            cylinder("post", (x, y, 1.15), 0.05, 1.1, M["iron"])
    for s in (-1, 1):
        box("rail", (s * 3.4, 0, 1.7), (0.06, 6.9, 0.06), M["iron"])
        box("rail", (0, s * 3.4, 1.7), (6.9, 0.06, 0.06), M["iron"])
    cylinder("pipe", (0, 0, 3.5), 0.22, 8.0, M["iron"])
    cylinder("pipe_flange", (0, 0, 0.75), 0.4, 0.15, M["iron"])
    box("pump_box", (1.8, 1.6, 1.1), (1.6, 1.2, 0.9), M["rust"], bevel=0.03)
    cylinder("mast", (-2.6, -2.6, 2.8), 0.06, 4.4, M["iron"])
    bm, _ = emission("beacon", AMBER, 40.0)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(-2.6, -2.6, 5.1))
    bpy.context.object.data.materials.append(bm)
    light("POINT", "beacon_light", 1800.0, AMBER, (-2.6, -2.6, 5.15), size=0.15)
    return True
