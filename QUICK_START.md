# Quick Start Guide

This guide will help you quickly customize your new academic website.

## 🚀 Immediate Customization Steps

### 1. Update Site Information (_config.yml)

Open `_config.yml` and update the following:

```yaml
# Personal Information
first_name: Your
last_name: Name
email: your.email@institution.edu
url: https://yourusername.github.io

# Social Media (add your usernames)
github_username: your-username
linkedin_username: your-username
scholar_userid: your-google-scholar-id
```

### 2. Customize Homepage (index.md)

Edit the subtitle, research interests, and introduction text.

### 3. Fill in Your Pages

Navigate to `_pages/` and customize each page:

- `about.md` - Your biography, education, and skills
- `research.md` - Research projects and publications
- `experience.md` - Work history and positions
- `presentations.md` - Conference talks
- `hackathons.md` - Competitions and events
- `contact.md` - Contact information
- `blog.md` - Update the external blog URL

### 4. Add Profile Picture

1. Save your photo in `assets/img/` (e.g., `prof_pic.jpg`)
2. Update `index.md`:
   ```yaml
   profile:
     image: prof_pic.jpg
   ```
3. Update `_pages/about.md` similarly

### 5. Deploy

1. Commit your changes
2. Push to the main branch
3. GitHub Pages will automatically build and deploy
4. View your site at `https://yourusername.github.io`

## 📝 Content Guidelines

- Keep text professional and academic
- Use clear, concise language
- Include links to papers, projects, and profiles
- Update regularly with new achievements

## 🎨 Customizing Colors

To change the accent color, edit `_sass/_variables.scss`:

```scss
$purple-color: #B509AC !default;  // Change this hex value
```

## 📚 Additional Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [al-folio Theme Docs](https://github.com/alshedivat/al-folio)

## 🆘 Troubleshooting

**Site not building?**
- Check the Actions tab in GitHub for build errors
- Verify YAML syntax in all .md files and _config.yml

**Navigation not showing?**
- Ensure `nav: true` is set in page front matter
- Check `nav_order` values are unique

**Images not displaying?**
- Verify image path in `assets/img/`
- Check filename matches exactly (case-sensitive)

## 🔄 Regular Updates

Update these sections regularly:
- Research publications
- New presentations
- Work experience
- Contact information

---

For detailed documentation, see the main [README.md](README.md)
