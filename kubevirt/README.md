# KubeVirt Headlamp plugin

This plugin adds KubeVirt operations views to Headlamp. It targets upstream KubeVirt v1.6.3 and the
`@kinvolk/headlamp-plugin` SDK `^0.13.1`.

## Scope

Version 1 covers these resources:

- `VirtualMachine` from `kubevirt.io/v1`
- `VirtualMachineInstance` from `kubevirt.io/v1`
- `VirtualMachineInstanceMigration` from `kubevirt.io/v1`
- `DataVolume` from `cdi.kubevirt.io/v1beta1`

The plugin provides list and detail views, status chips, resource links, lifecycle actions, guest OS
information when the guest agent is connected, and an embedded serial console. It does not add create
or edit forms. Use Headlamp's built-in YAML editor for object edits.

Graphical VNC, snapshots, clones, instancetypes, preferences, VM pools, volume hotplug UI, and cross
resource changes to stock Headlamp views are out of scope for this version.

## KubeVirt detection

The sidebar entries stay visible on all clusters. Each view checks for the
`virtualmachines.kubevirt.io` CRD on the active cluster. If the CRD is missing, the view shows a clear
"KubeVirt is not installed on this cluster" message instead of a broken table or an error toast.

## Development

From the repository root:

```bash
just install
just lint
just tsc
just test
just build
```

To run the plugin against a local Headlamp process:

```bash
cd kubevirt
npx headlamp-plugin start
```

To make an installable tarball:

```bash
just package
```

## In-cluster image bake

For private in-cluster Headlamp deployments, build the plugin payload image from the repository root:

```bash
just image-build
```

`Dockerfile.plugins` packages the plugin and extracts it to `/plugins/kubevirt`. The Headlamp
deployment can then use the image as an initContainer that copies `/plugins/*` into the configured
Headlamp plugin directory. This matches the plugin delivery pattern used by the lab Headlamp
deployment.

This repository is private and does not publish the plugin to Artifact Hub.
