---
layout: page
title: news
permalink: /news/
nav: true
nav_order: 4
---

<div class="news">
  {%- assign filtered_news = site.news | where_exp: 'item', 'item.published != false' | reverse -%}
  {%- if filtered_news.size > 0 %}
  <div class="table-responsive">
    <table class="table table-sm table-borderless">
    {%- for item in filtered_news %}
      <tr>
        <th scope="row">{{ item.date | date: "%b %-d, %Y" }}</th>
        <td>
          {% if item.inline -%}
            {{ item.content | remove: '<p>' | remove: '</p>' | emojify }}
          {%- else -%}
            <a class="news-title" href="{{ item.url | relative_url }}">{{ item.title }}</a>
          {%- endif %}
        </td>
      </tr>
    {%- endfor %}
    </table>
  </div>
  {%- else %}
  <p>No news so far...</p>
  {%- endif %}
</div>
