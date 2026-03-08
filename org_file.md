# Project Summary for Export

## What this repository is
This repository contains the personal website of Ivelina Mladenova, built with Jekyll on top of the al-folio academic theme and deployed to GitHub Pages.

Primary live URL:
- https://ivelina0.github.io

It is a content-driven static site focused on:
- About/profile information
- News announcements
- Blog posts
- Projects
- Publications/talks/CV-style content
- Extra custom pages (for example: Fractal Lab and Beyond Academia)

---

## Core stack
- Static site generator: Jekyll
- Theme base: al-folio
- Templating: Liquid + Markdown + HTML
- Styling: SCSS compiled into assets/css/main.css
- Client-side JS: custom scripts in assets/js
- Bibliography: jekyll-scholar with BibTeX files
- Deployment: GitHub Actions Pages workflow (+ legacy Docker/deploy workflows included)
- Local dev options: Bundler and Docker

---

## Repository structure (high level)
- _config.yml: central site configuration, features, collections, plugin config
- _pages/: main top-level pages (about, projects, cv, repositories, tutoring, fractal-lab, beyond-the-academia, etc.)
- _news/: short announcement items shown on homepage/news feed
- _posts/: blog posts
- _projects/: project entries rendered into project cards/pages
- _bibliography/ + assets/bibliography/: BibTeX sources for publications
- _data/: structured YAML data (coauthors, repositories, venues, cv)
- _layouts/: page/post/default layout templates
- _includes/: reusable template components (header, footer, news list, scripts, social, repository cards, CV components)
- _plugins/: custom Ruby plugins/filters
- _sass/: theme and custom SCSS partials
- assets/: static files (css, js, images, pdf, plotly)
- .github/workflows/: CI/CD workflows for build and deploy
- Dockerfile, docker-compose.yml, docker-local.yml: containerized local build support

---

## Content model and behavior
### Collections
Configured in _config.yml:
- news collection (output enabled, permalink /news/:path/)
- projects collection (output enabled, permalink /projects/:path/)

### Homepage behavior
The homepage comes from _pages/about.md using the about layout and can include:
- News block
- Latest posts block (currently disabled)
- Selected papers block (disabled)
- Optional social icons (disabled)

### Blog behavior
- Blog route: /blog/
- Permalink format: /blog/:year/:title/
- Pagination enabled
- Related blog posts enabled

### News behavior
- news.enabled: true
- Scrollable news list enabled
- Display limit set in _config.yml (currently 5)

---

## Notable customizations in this codebase
This repo is not a plain default theme copy; it has custom visual and interactive features:

1) Galaxy Math visual mode
- Dark-theme-first visual styling enabled in config
- Sparkle overlay animation
- Brownian motion background overlays
- Controlled by flags in _config.yml:
  - enable_galaxy_math_theme
  - enable_sparkle_overlay
  - enable_brownian_about

2) Fractal Lab page
- Page: _pages/fractal-lab.md
- Interactive Mandelbrot/Julia canvas explorer
- Script: assets/js/fractal_lab.js
- Feature flag: enable_fractal_lab

3) Custom plugin logic
- _plugins/details.rb: adds a custom Liquid details block tag
- _plugins/external-posts.rb: imports external RSS feed entries into posts collection
- _plugins/hideCustomBibtex.rb: strips internal BibTeX metadata keywords from displayed entries

4) Math rendering
- MathJax enabled by config and injected through include scripts

---

## Current content status snapshot
- About page is fully personalized with research bio and links
- News items include recent custom announcements (including Women in STEM Hackathon updates)
- Blog index currently shows a placeholder message for unpublished/pending posts
- Some sections remain theme-template defaults (for example sample projects and sample bibliography/CV data)

---

## Build and run options
### Local with Ruby/Bundler
1. Install Ruby + Bundler
2. Install gems from Gemfile
3. Run jekyll serve

### Local with Docker
- docker-compose.yml uses prebuilt image flow
- docker-local.yml builds from local Dockerfile
- Both expose port 8080 and mount repository into /srv/jekyll

---

## CI/CD and deployment
Primary modern deployment workflow:
- .github/workflows/pages.yml
- Trigger: push to master or manual dispatch
- Steps: checkout, setup Ruby, install ImageMagick, build Jekyll site, upload artifact, deploy to GitHub Pages

Additional legacy/manual workflows are also present:
- deploy_v1.yml
- deploy-image.yml
- deploy-docker-tag.yml

---

## Key configuration points to edit when maintaining this site
- Site identity and metadata: _config.yml
- Nav-visible page content: _pages/
- News ticker items: _news/
- Blog posts: _posts/
- Project cards/pages: _projects/
- Theme/style variables: _sass/
- Custom behavior and animations: assets/js/
- Publication records: _bibliography/papers.bib

---

## Practical export note
This document is designed as an export-ready architecture/content summary of the current repository. It can be shared with collaborators, supervisors, or future maintainers as a quick orientation file.
