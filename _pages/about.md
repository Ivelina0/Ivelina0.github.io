---
layout: about
title: ""
permalink: /
subtitle: 

news: true  # includes a list of news items
latest_posts: false  # includes a list of the newest posts
selected_papers: false # includes a list of papers marked as "selected={true}"
social: false  # includes social icons at the bottom of the page
brownian_background: true
hide_footer: true
---

Hi you! I’m **Ivelina**, but most people call me **Eve**.  

<div class="about-intro-box mt-3 mb-3">
I’m a final-year PhD student at Queen Mary University of London (QMUL), using deep learning to compute arbitrage-free option prices. I am not experimenting with Black–Scholes all day, I promise!
</div>

---
### Research

My PhD sits where stochastic modelling meets machine learning. I work with correlated, high-dimensional volatility models such as **Heston** and **Wishart processes**, where the covariance structure itself evolves over time. Pricing under these models leads to high-dimensional **PDEs** and **Fourier-based pricing operators**, which classical tools (**Monte Carlo**, **Fourier pricing**, numerical PDE solvers) struggle to scale to. So I build neural approaches instead: [Physics-Informed Neural Networks (PINNs)](https://www.sciencedirect.com/science/article/abs/pii/S0021999118307125) and [Deep Galerkin Methods (DGM)](https://arxiv.org/abs/2305.06000). Underneath it all is [functional analysis](https://en.wikipedia.org/wiki/Functional_analysis), the framework for the operators and function spaces these problems live in.

### Industry experience
<small class="text-muted">(in ML, during the PhD)</small>

- **Blue Raven AI** (Oct 2025 – Jun 2026: a 6-month internship, extended by 2 months)  
  Researched systematic equity trading strategies on 1-minute data (2015–2024). There was no existing infrastructure, so I built it from scratch: data pipelines (including SQL to load the data), feature engineering and a historical simulation framework, then researched and backtested strategies on top of it. *(Proprietary work, so no public code.)*

<small class="text-muted">Outside ML: at 18 I completed an apprenticeship as an accountant at a startup, where I built a discounted cash flow (DCF) model for my apprenticeship provider. During my BSc sandwich year I then did a 1-year data placement at Sainsbury's, using statistical methods such as hypothesis testing to measure how promotions shifted customer behaviour and which customer characteristics drove the response.</small>

### Before the PhD

Projects and coursework from my BSc, MSc and Earth-i internship. All written before ChatGPT existed: just me, the documentation and a lot of forum threads, and I enjoyed every bit of it.

- **MSc thesis (Imperial): network time series**  
  Tested the **[Generalised Network Autoregressive (GNAR) model](https://cran.r-project.org/web/packages/GNAR/index.html)** on a network of macroeconomic variables to forecast inflation, in R. [Code](https://github.com/Ivelina0/MSc-Imperial-Courseworks)

- **MSc coursework: particle filtering for stochastic volatility**  
  [Notebook](https://github.com/Ivelina0/MSc-Imperial-Courseworks/blob/main/ASM_CW_code.ipynb). This is where I met the **curse of dimensionality**: as the state dimension grows, particle weights collapse onto a single particle (**particle degeneracy**). I’m still curious about work combining **probabilistic modelling with machine learning** to fix this.

- **Earth-i internship (2021): earth observation**  
  Gathered, cleaned and analysed Sentinel SAR radar images of copper smelters, trying my own clustering approaches (k-means) to detect changes in activity. [Code](https://github.com/Ivelina0/EarthI-Internship-Earth-Observation-Project)

- **BSc dissertation: optimisation & parameter inference**  
  MM and EM algorithms, including simulating a **[Hawkes process](https://en.wikipedia.org/wiki/Hawkes_process)** and estimating its parameters with the **[Expectation–Maximisation (EM) algorithm](https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm)**. [Code](https://github.com/Ivelina0/BSc-Dissertation-Numerical-Experiments)

- **BSc coursework: time series analysis in R**  
  [Code](https://github.com/Ivelina0/R-projects/tree/main)


---
<div class="about-groups-box mt-3 mb-3">
  <p><strong>Groups I take part in:</strong></p>
  <ul>
    <li><a href="https://maths4dl.ac.uk/">Maths4DL</a></li>
    <li><a href="https://www.qmul.ac.uk/deri/">DERI</a></li>
    <li><a href="https://www.turing.ac.uk/events/phi-ml-meets-engineering">Phi-ML meets Engineering</a></li>
    <li><a href="https://www.londonmathfinance.org.uk/">London Mathematical Finance Group</a></li>
    <li>QMUL internal groups: Probability and Applications &amp; Stats &amp; Data Science.</li>
  </ul>
</div>


### Leadership
- Founded and ran the [Women in STEM Hackathon 2026](https://ivelina0.github.io/women-in-stem-hackathon/) with Piscopia: came up with the idea and projects, secured funding, and ran the two-day event. ([repo](https://github.com/Ivelina0/women-in-stem-hackathon))
- Part of [Piscopia's](https://piscopia.co.uk/queen-mary-university-of-london-committee/) Local Committee.
- QMUL PhD Rep since Nov 2022.
- Contributed to the [History of Maths QMUL](https://www.seresearch.qmul.ac.uk/content/pce/schoolsedi/files/History_of_Maths_QMUL_2026.pdf): led Chapter 4, *Laws, Limits, and Randomness*, and solely wrote Chapter 7, *The Theory that would not die: Bayesian Probability*.
- Other: organise Christmas dinners, social sec of rowing, help organise the [QMUL Undergraduate Research Seminars](https://www.qmul.ac.uk/maths/undergraduate/ugresearchseminar/ugresearchseminar).

---

<div class="cv-download-box mt-4">
  <strong>Download my CV here</strong> —
  <a class="cv-download-link" href="{{ '/assets/pdf/Ivelina_Mladenova_CV.pdf' | relative_url }}" target="_blank" rel="noopener">Ivelina Mladenova CV (PDF)</a>
</div>

<div class="cv-download-box mt-3">
  <strong>View My Poster</strong> —
  <a class="cv-download-link" href="{{ '/assets/pdf/2nd_year_Poster.pdf' | relative_url }}" target="_blank" rel="noopener">2nd Year Poster (PDF)</a>
</div>

