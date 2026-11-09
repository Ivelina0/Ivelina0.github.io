---
layout: page
title: Puzzles
permalink: /puzzles/
description: Write-ups of logic puzzles I've solved, and how I approached them.
nav: true
nav_order: 7
---

I enjoy logic puzzles, and these are my write-ups of the ones I've worked through. I add more whenever I get the time.

{% assign puzzles = site.puzzles | sort: "date" | reverse %}
{% for puzzle in puzzles %}
<div class="cv-download-box mt-3">
  <strong><a href="{{ puzzle.url | relative_url }}">{{ puzzle.title }}</a></strong>
  {% if puzzle.date %}<span class="text-muted"> · {{ puzzle.date | date: "%b %Y" }}</span>{% endif %}
  {% if puzzle.description %}<br>{{ puzzle.description }}{% endif %}
</div>
{% endfor %}
