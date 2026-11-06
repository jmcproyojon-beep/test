# Awesome OSINT: Local Search

[jivoi/awesome-osint](https://github.com/jivoi/awesome-osint) is a curated list
of about 1,400 open-source-intelligence tools and resources in 72 categories.
It is a link directory, not software: nothing in it runs. This repo makes it
searchable from the terminal and from an offline web page.

The clone lives in `awesome-osint/` (git-ignored). The list is licensed under
CC BY-SA 4.0.

## Install / update

```bash
scripts/setup_awesome_osint.sh
```

This clones the list (or pulls the latest), parses it, and builds
`awesome-osint/osint.html`.

## Search from the terminal

```bash
scripts/osint.py categories
```

```bash
scripts/osint.py search email
```

```bash
scripts/osint.py search "reverse image" -c image
```

```bash
scripts/osint.py show "Username Check"
```

```bash
scripts/osint.py export osint.json
```

- `search` matches every word against name, category and description, and
  ranks name and category hits first. Use `-c` to limit it to categories whose
  name contains that text, and `-n` to change the result limit (default 50).
- `show` lists a whole category. Subcategories work too, e.g. `show telegram`.
- Add `--json` to `categories`, `search` or `show` for machine-readable output.

## Search in a browser

Open `awesome-osint/osint.html`. It is a single offline file with live search
and a category filter, and it works on phones.

## Where to start

| Goal | Category |
|---|---|
| Find accounts for a username | Username Check |
| Check an email or see if it was in a breach | Email Search / Email Check, Data Breach Search Engines |
| Look up a phone number | Phone Number Research |
| Research a company | Company Research |
| Investigate a domain or IP | Domain and IP Research, DNS |
| Find where a photo came from | Image Search, Image Analysis |
| Geolocate an image or place | Geospatial Research and Mapping Tools |
| See old versions of a site | Web History and Website Capture |
| Social platforms | Social Media Tools / Twitter, Telegram, Reddit, ... |
| Threats and indicators | Threat Intelligence, Threat Actor Search |
| Verify a claim | Fact Checking |

## Use responsibly

These tools reach public data, but how you use them still matters. Follow
each site's terms and your local privacy and anti-stalking laws. Stick to
legitimate purposes: your own exposure, due diligence, journalism, security
work in scope, or research. Many links are third-party sites that can change
or vanish, so check a tool before you trust its output.
