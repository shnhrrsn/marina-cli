# marina-cli

<a href="https://travis-ci.org/shnhrrsn/marina-cli"><img src="https://img.shields.io/travis/shnhrrsn/marina-cli.svg" alt="Build Status"></a>
<a href="https://www.npmjs.com/package/marina-cli"><img src="https://img.shields.io/npm/dt/marina-cli.svg" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/marina-cli"><img src="https://img.shields.io/npm/v/marina-cli.svg" alt="Latest Version"></a>
<a href="https://www.npmjs.com/package/marina-cli"><img src="https://img.shields.io/npm/l/marina-cli.svg" alt="License"></a>

Marina is a CLI tool to provide simple, shareable domains by creating a reverse proxy with [Caddy](https://caddyserver.com) and serving `*.localhost` via Dnsmasq.  No need to mess with hosts files, quickly and easily turn `http://localhost:3000` into `http://domain.localhost`.

Marina also integrates with [ngrok](https://ngrok.com) allowing you to create a publicly shareable link with a simple `marina share` command.

Marina was inspired by [Laravel Valet](http://github.com/laravel/valet), however running Marina and Valet side by side is not supported.

## Installation

```bash
npm install -g marina-cli
sudo marina install
```

## Usage

### Managing Settings
* `domain`: Change the default domain TLD from `.localhost`
* `ssl on`: Turn support for ssl on
* `ssl off`: Turn support for ssl off

#### Managing Projects
* `dock`: Register a project with Marina
* `list`: Lists all registered domains.
* `open`: Opens a Marina project in the browser.
* `share`: Generate a shareable URL for a project.
* `undock`: Unregister a project with Marina

#### Managing the Toolchain
* `install`: Install the Marina toolchain
* `uninstall`: Uninstall the Marina toolchain
* `update`: Update the Marina toolchain

#### Manage Services
* `start`: Start Caddy & Dnsmasq
* `stop`: Stop Caddy & Dnsmasq
* `restart`: Restart Caddy & Dnsmasq

### --save
When running `marina dock` pass the `--save` flag (ex: `marina dock --save`) to persist your settings.  This will enable Marina to save the domain/source host settings to a `.marina.json` file in the current directory.

The `dock`, `undock`, `open` and `share` commands will read from `.marina.json` if it exists, allowing you to quickly run those commands without needing to specify a domain.
