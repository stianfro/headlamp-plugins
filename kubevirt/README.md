# KubeVirt Headlamp plugin

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/stianfro-headlamp-kubevirt)](https://artifacthub.io/packages/search?repo=stianfro-headlamp-kubevirt)

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

## Install from the Headlamp Plugin Catalog

The plugin is prepared for Artifact Hub indexing as a Headlamp plugin.

After the repository has been added to Artifact Hub, install it from the Headlamp Plugin Catalog by
searching for `KubeVirt plugin for Headlamp`.

If it is not visible, open the Plugin Catalog settings and disable `Only official plugins`. The
Headlamp Plugin Catalog filters to official or allow-listed packages by default.

## Manual install archive

The installable plugin archive is attached to the GitHub release:

```text
https://github.com/stianfro/headlamp-plugins/releases/download/kubevirt-0.1.0/headlamp-plugin-kubevirt-0.1.0.tar.gz
```

Checksum:

```text
SHA256:2e73c2d876ad1c961b8157f500bf0a3dbfef2fc07542ede58647481ce98ddfdd
```

Headlamp accepts plugin archives from GitHub, GitLab, and Bitbucket URLs.

## In-cluster image delivery

For in-cluster Headlamp deployments that load plugins from a shared plugin directory, use the public
payload image:

```text
ghcr.io/stianfro/headlamp-plugin-kubevirt:latest
```

The image stores the plugin under `/plugins/kubevirt`. Add it as an initContainer that copies
`/plugins/*` into Headlamp's configured plugin directory, for example `/headlamp/plugins`.

Example initContainer command:

```yaml
command:
  - /bin/sh
  - -c
  - |
    mkdir -p /headlamp/plugins
    cp -r /plugins/* /headlamp/plugins/
    chown -R 100:101 /headlamp/plugins
```

For local builds, create the payload image from the repository root:

```bash
just image-build
```

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
