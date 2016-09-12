# marina-cli

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
When running `marina dock` pass the `--save` flag (ex: `marina dock --save`) to persist your settings.  This will enable Marina to save the domain/source host settings to a `.marina.json`.  The `dock`, `undock` and `share` commands will all read `.marina.json` from the current working directory if it exists, allow you to quickly run those commands without needing to specify a domain.
