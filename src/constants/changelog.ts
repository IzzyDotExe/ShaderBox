const changelogs = [
    {
        version: "1.0.2",
        body: `
## What's New?

- New default shader with **cyberpunk vibes** — a glowing neon Tron grid, fresnel silhouette glow, animated glitch slices, and CRT scanlines. The palette shifts as you spin the mesh. Hit **Reset Shaders** in the Editor to load it.
- The shader editor now has **tabs** to switch between the vertex and fragment shaders, giving each editor the full height of the sidebar.

## Bug Fixes

- Fixed \`uDelta\` always reading as ~0 — frame delta time is now reported correctly to shaders and animated uniforms.
- \`sampler2D\` textures are no longer reloaded and leaked on every uniform change (e.g. while scrubbing a float). Textures now reload only when their source actually changes.
- Shader compile errors are no longer reported twice in the editor.
- Deleted custom uniforms are now properly removed instead of lingering, and changing a uniform's type no longer breaks live evaluation.
- Uploaded textures are now disposed on teardown to free GPU memory.
`
    },
    {
        version: "1.0.1",
        body: `
## What's New? 

- Added a new "Changelog" pop-up to keep you updated on the latest features and improvements.
`
    },
    {
        version: "1.0.0",
        body: `
## What's New?

- Initial release of ShaderBox.
`
    }
]


const latestChangeLog = changelogs[0];

export default latestChangeLog;