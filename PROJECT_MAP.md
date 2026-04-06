# Project Map: `Ivelina0.github.io`

Brief structural map of `/home/ubuntu/personal_website/Ivelina0.github.io` based on a selective inspection on 2026-04-06 (UTC).

This is deeper than the workspace-level map, but still intentionally selective. I sampled the structure, configuration, representative pages, custom scripts, and build/deploy files without reading every file in full.

## 1. Project Identity

```text
Ivelina0.github.io/
├── Jekyll site
├── based on al-folio theme
├── deployed to GitHub Pages
└── includes custom personal content + custom interactive fractal features
```

Confirmed from:
- `README.md`: personal academic website for Ivelina Mladenova.
- `Gemfile`: standard Jekyll/al-folio plugin set.
- `_config.yml`: site metadata, collections, blog/news/pages settings.

## 2. Top-Level Structure

```text
Ivelina0.github.io/
├── .github/
├── _bibliography/
├── _data/
├── _includes/
├── _layouts/
├── _news/
├── _pages/
├── _plugins/
├── _posts/
├── _projects/
├── _sass/
├── assets/
├── bin/
├── blog/
├── 404.html
├── Dockerfile
├── Gemfile
├── README.md
├── _config.yml
├── docker-compose.yml
├── docker-local.yml
├── news.html
├── org_file.md
├── robots.txt
└── PROJECT_MAP.md
```

Repo state:
- `git status --short` was clean at inspection time.

## 3. High-Level Architecture

The site follows normal Jekyll conventions:

- `_config.yml`
  - global site settings
  - feature toggles
  - collection definitions
  - plugin setup
- `_pages/`
  - manually authored top-level pages
- `_news/`
  - short update/announcement entries
- `_posts/`
  - blog posts
- `_projects/`
  - project collection items
- `_layouts/` and `_includes/`
  - page rendering structure
- `_data/`
  - structured YAML content used by pages/components
- `_sass/` and `assets/`
  - styling, JS behavior, media, PDFs
- `.github/` and `bin/`
  - deployment/automation/dev tooling

## 4. Content vs Theme Defaults

One important repo-level observation:

- Some parts are clearly customized and actively used.
- Some parts still look like inherited `al-folio` example/demo content.

### Clearly customized / personal

- `_pages/about.md`
- `_pages/beyond-the-academia.md`
- `_pages/fractal-lab.md`
- `_news/announcement_4.md`
- `_news/announcement_5.md`
- `_news/announcement_6.md`
- `_news/announcement_7.md`
- `assets/js/fractal_lab.js`
- `assets/js/galaxy_math.js`
- `assets/pdf/Ivelina_Mladenova_CV.pdf`
- `assets/pdf/Third_Year_Review_24thSept_2025.pdf`
- custom imagery in `assets/img/`

### Still mostly stock/demo placeholders

- `_data/cv.yml` still contains Albert Einstein example data.
- `_data/repositories.yml` still references stock example repos/users.
- `_data/coauthors.yml` and `_data/venues.yml` look inherited from the theme example set.
- `_projects/*.md` are example project pages.
- many `_posts/*.md` are standard al-folio sample posts.
- `.github/ISSUE_TEMPLATE/*` and several workflows still carry upstream template behavior/naming.

This matters because the repo is part personal site, part customized theme fork, part leftover scaffolding.

## 5. Core Config

### `_config.yml`

This is the main control file for the site.

Observed responsibilities:
- personal metadata:
  - first/last name
  - email
  - URL
- theme/display settings:
  - light/dark syntax highlighting
  - navbar behavior
  - RSS/blog/news options
- collections:
  - `news`
  - `projects`
- markdown/highlighter config
- plugin list
- archive config
- external source feed config

Behavioral notes:
- site title is left as `"blank"` so layouts render the full personal name instead.
- `news` collection is enabled and shown on the homepage.
- `projects` is configured as an output collection.
- the repo still includes `external_sources` configuration for Medium-style imported posts.
- dark mode support is enabled via included scripts.

## 6. Main Pages

```text
_pages/
├── about.md
├── beyond-the-academia.md
├── cv.md
├── fractal-lab.md
├── projects.md
├── publications.md
├── repositories.md
├── Tutoring.md
├── dropdown.md
└── Ivelina_Mladenova_CV.pdf
```

### `about.md`

Purpose:
- homepage (`permalink: /`)

Characteristics:
- primary custom landing page
- uses layout `about`
- enables homepage news
- disables latest posts and selected papers
- sets custom flags like `brownian_background: true` and `hide_footer: true`
- contains a long, personal academic introduction and interest sections

This is the main identity page of the site.

### `beyond-the-academia.md`

Purpose:
- personal/non-academic page

Characteristics:
- visible in nav
- custom prose on books, sports, and activities
- uses embedded images from `assets/img/`
- hides footer

### `fractal-lab.md`

Purpose:
- custom interactive page for fractals

Characteristics:
- visible in nav
- uses flags like `fractal_lab: true` and `magenta_starfield: true`
- contains multiple interactive sections:
  - Mandelbrot
  - Julia
  - Hilbert curve
  - Barnsley fern
  - Brownian motion

This is one of the most custom parts of the repo.

### `projects.md`

Purpose:
- collection listing page for `_projects`

Current state:
- structurally correct
- likely still showing example project content because `_projects/` remains demo-like
- `nav: false`, so not currently exposed in primary nav

### `publications.md`

Purpose:
- a talks/publications page scaffold using `jekyll-scholar`

Current state:
- `title: Talks`
- `published: false`
- hardcoded historical years from demo content
- almost certainly not active production content yet

### `repositories.md`

Purpose:
- GitHub profile/repo showcase page

Current state:
- still points to stock repository data from `_data/repositories.yml`
- `nav: false`

### `cv.md`, `Tutoring.md`, `dropdown.md`

State:
- present
- less central than homepage / fractal / beyond-academia pages
- some still look like theme scaffolding or low-detail placeholders

## 7. News and Posts

### `_news/`

```text
_news/
├── announcement_1.md
├── announcement_2.md
├── announcement_3.md
├── announcement_4.md
├── announcement_5.md
├── announcement_6.md
└── announcement_7.md
```

Interpretation:
- announcements `1` to `3` are unpublished demo examples.
- announcements `4` to `7` are real personal updates:
  - Women in STEM Hackathon organization
  - Blue Raven AI internship
  - PhD review milestone
  - hackathon website launch

### `_posts/`

This folder appears to be mostly al-folio sample blog content:
- formatting
- images
- code
- math
- diagrams
- comments/redirect examples

These look more like inherited examples than active personal blog writing.

### `blog/index.html`

Purpose:
- blog landing page route for Jekyll blog output

## 8. Projects Collection

### `_projects/`

```text
_projects/
├── 1_project.md
├── 2_project.md
├── 3_project.md
├── 4_project.md
├── 5_project.md
└── 6_project.md
```

Current state:
- these are still standard demo/example project entries
- they include theme showcase content, sample images, and tutorial-like copy
- they do not yet look like real portfolio entries for this site

## 9. Data Files

### `_data/`

```text
_data/
├── coauthors.yml
├── cv.yml
├── repositories.yml
└── venues.yml
```

What each file is for:

- `cv.yml`
  - powers the CV page layout
  - currently still example Einstein data

- `repositories.yml`
  - feeds GitHub user/repo showcase components
  - still example content

- `coauthors.yml`
  - lookup metadata for bibliography/coauthor rendering
  - example content

- `venues.yml`
  - publication venue metadata/colors
  - example content

Conclusion:
- `_data/` is structurally ready but not fully personalized.

## 10. Layouts and Includes

### `_layouts/`

Representative layouts:

```text
_layouts/
├── about.html
├── bib.html
├── cv.html
├── default.html
├── distill.html
├── page.html
├── post.html
└── archive-*.html
```

Notable file:
- `_layouts/about.html`
  - renders the homepage/about page
  - conditionally includes news, posts, selected papers, and social blocks
  - looks mostly theme-derived, but it supports the custom homepage content model

### `_includes/`

Representative includes:

```text
_includes/
├── head.html
├── header.html
├── footer.html
├── metadata.html
├── news.html
├── latest_posts.html
├── selected_papers.html
├── social.html
├── projects.html
├── projects_horizontal.html
├── repository/
├── cv/
└── scripts/
```

Notable behavior:
- `head.html`
  - loads Bootstrap, MDB, icons, fonts, syntax highlighting, main CSS, dark mode scripts
- `header.html`
  - renders nav items from page metadata
  - handles theme toggle button
- `footer.html`
  - respects page-level `hide_footer`

Customization level:
- these appear largely theme-based, with smaller local adjustments.

## 11. Styling and Frontend Behavior

### Sass

```text
assets/css/main.scss
_sass/
├── _variables.scss
├── _themes.scss
├── _layout.scss
├── _base.scss
└── _distill.scss
```

Observed structure:
- `assets/css/main.scss` is just the main import entrypoint.
- most real styling work lives in `_sass/`.
- `rg` shows substantial custom CSS in `_sass/_base.scss`, especially for:
  - galaxy-math theme styles
  - brownian overlay/background
  - fractal UI sections
  - custom cards/hero/layout blocks

So the styling customization is deeper than `main.scss` alone suggests.

### JavaScript

```text
assets/js/
├── common.js
├── copy_code.js
├── dark_mode.js
├── fractal_lab.js
├── galaxy_math.js
├── masonry.js
├── theme.js
└── zoom.js
```

Observed roles:
- `theme.js`
  - theme initialization and dark-mode switching
- `fractal_lab.js`
  - major custom interactive fractal rendering logic
- `galaxy_math.js`
  - custom starfield / animated background / brownian-style visual effects
- other files are standard site utility scripts

Interpretation:
- the custom JS footprint is significant and non-trivial.
- `fractal_lab.js` and `galaxy_math.js` are among the most bespoke files in the repo.

## 12. Media / Static Assets

### `assets/img/`

Contains:
- profile and personal imagery
- sports/life photos
- theme/sample screenshots
- project/sample images

Likely mixed-origin folder:
- some images are genuine personal site assets
- some are inherited theme/demo assets

### `assets/pdf/`

Contains:
- `Ivelina_Mladenova_CV.pdf`
- `2nd_year_Poster.pdf`
- `Third_Year_Review_24thSept_2025.pdf`
- `example_pdf.pdf`

Interpretation:
- mostly personalized academic materials, plus one theme example PDF

### `assets/plotly/demo.html`

Likely retained theme/demo support artifact.

## 13. Bibliography / Publications Support

```text
_bibliography/papers.bib
assets/bibliography/2018-12-22-distill.bib
```

Purpose:
- publication/talk rendering via `jekyll-scholar`
- bibliography data source

I did not inspect the full BibTeX contents, but the surrounding setup is in place.

## 14. Plugins

### `_plugins/`

```text
_plugins/
├── details.rb
├── external-posts.rb
└── hideCustomBibtex.rb
```

What they do:
- `details.rb`
  - custom Liquid block for HTML `<details>` support in markdown
- `external-posts.rb`
  - imports external posts from configured RSS feeds
- `hideCustomBibtex.rb`
  - strips configured BibTeX keywords from rendered bibliography output

These are relatively small, targeted extensions rather than a major plugin layer.

## 15. Build / Run / Deploy

### Local/dependency setup

- `Gemfile`
  - Jekyll + plugins
- `Dockerfile`
  - builds a Jekyll container image with Ruby, ImageMagick, Bundler
- `docker-compose.yml`
  - serves site at port `8080`

### `bin/`

```text
bin/
├── cibuild
├── deploy
├── docker_build_image.sh
├── docker_run.sh
└── dockerhub_run.sh
```

Roles:
- `cibuild`
  - simple Jekyll build command
- `deploy`
  - older shell-based deployment path to `gh-pages`
- docker scripts
  - local image build/run helpers

### GitHub Actions

```text
.github/workflows/
├── deploy-docker-tag.yml
├── deploy-image.yml
├── deploy_v1.yml
└── pages.yml
```

Interpretation:
- `pages.yml` looks like the current canonical GitHub Pages pipeline.
- older Docker/deploy workflows remain in repo, likely inherited or superseded.

## 16. Practical Map of What Matters Most

If you want to understand or edit the real site quickly, the highest-signal files are:

### Site identity / structure

- `_config.yml`
- `_pages/about.md`
- `_pages/beyond-the-academia.md`
- `_pages/fractal-lab.md`

### Styling / behavior

- `_sass/_base.scss`
- `assets/js/fractal_lab.js`
- `assets/js/galaxy_math.js`
- `assets/js/theme.js`

### Data-driven pages

- `_data/cv.yml`
- `_data/repositories.yml`
- `_bibliography/papers.bib`

### Deployment/runtime

- `Gemfile`
- `docker-compose.yml`
- `.github/workflows/pages.yml`

## 17. Current Shape in One Sentence

This repo is a customized `al-folio` Jekyll personal website where the homepage, personal pages, and interactive fractal experience are real custom work, while projects/blog/data/repository sections still retain a noticeable amount of upstream demo scaffolding.
