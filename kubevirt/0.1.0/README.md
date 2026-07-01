# KubeVirt plugin for Headlamp 0.1.0

This Headlamp plugin adds operations views for upstream KubeVirt clusters. It covers VirtualMachine,
VirtualMachineInstance, VirtualMachineInstanceMigration, and CDI DataVolume resources.

## Features

- List and detail views for the supported resources
- VM start, stop, restart, migrate, and force actions through KubeVirt subresources
- VMI pause, unpause, freeze, unfreeze, and guest reboot actions
- Serial console for running VMs and VMIs
- Guest OS information when the guest agent is connected
- Clear not-installed state on clusters without KubeVirt CRDs

## Install

Install from the Headlamp Plugin Catalog by searching for `KubeVirt plugin for Headlamp`.

If the package is not visible, open the Plugin Catalog settings and disable `Only official plugins`.

Manual install archive:

```text
https://github.com/stianfro/headlamp-plugins/releases/download/kubevirt-0.1.0/headlamp-plugin-kubevirt-0.1.0.tar.gz
```

Checksum:

```text
SHA256:2e73c2d876ad1c961b8157f500bf0a3dbfef2fc07542ede58647481ce98ddfdd
```

## In-cluster Headlamp

The release archive is the Artifact Hub install target. For in-cluster Headlamp deployments that load
plugins from an initContainer, use the payload image:

```text
ghcr.io/stianfro/headlamp-plugin-kubevirt:latest
```

The image stores the plugin under `/plugins/kubevirt`. Copy `/plugins/*` into Headlamp's configured
plugins directory, for example `/headlamp/plugins`.
