---
layout: page
title: Puzzles
permalink: /puzzles/
description: In-progress writeups of puzzles and whatnots for fun.
nav: true
nav_order: 7
---

{% assign puzzles = site.puzzles | sort: "date" | reverse %}
{% for puzzle in puzzles %}
<div class="cv-download-box mt-3">
  <strong><a href="{{ puzzle.url | relative_url }}">{{ puzzle.title }}</a></strong>
  {% if puzzle.date %}<span class="text-muted"> · {{ puzzle.date | date: "%b %Y" }}</span>{% endif %}
  {% if puzzle.description %}<br>{{ puzzle.description }}{% endif %}
</div>
{% endfor %}
