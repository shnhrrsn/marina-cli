# marina-cli

Marina is a CLI tool for Docker to provide simple, shareable domains. Marina was inspired by [Laravel Valet](http://github.com/laravel/valet), however running Marina and Valet side by side is not supported.

## Installation

```bash
npm install -g marina-cli
sudo marina install
```

## Usage

* `marina dock`: Register the a project with Marina
* `marina undock`: Unregister the a project with Marina
* `marina list`: Lists all registered domains.
* `marina share`: Generate a shareable URL for a project.
* `marina install`:  Install the Marina toolchain
* `marina uninstall`: Uninstall the Marina toolchain

### --save
When running `marina dock` pass the `--save` flag (ex: `marina dock --save`) to persist your settings.  This will enable Marina to save the domain/source host settings to a `.marina.json` file in the current directory.

The `dock`, `undock` and `share` commands will read from `.marina.json` if it exists, allowing you to quickly run those commands without needing to specify a domain.
