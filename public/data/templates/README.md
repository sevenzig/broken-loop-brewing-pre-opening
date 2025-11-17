# Content Management SOP: Adding Beers, Menu Items, and Events

This document is the **Standard Operating Procedure (SOP)** for adding, uploading, and creating new beers, food menu items, and events for the Broken Loop Brewing website. Follow these steps precisely to ensure content is consistent, discoverable, and visually appealing.

---

## Table of Contents
1. [General Principles](#general-principles)
2. [Preparation Checklist](#preparation-checklist)
3. [Adding a New Beer](#adding-a-new-beer)
4. [Adding a New Menu Item](#adding-a-new-menu-item)
5. [Adding a New Event](#adding-a-new-event)
6. [Image Handling & Optimization](#image-handling--optimization)
7. [Review & Quality Assurance](#review--quality-assurance)
8. [Troubleshooting & FAQ](#troubleshooting--faq)
9. [Contact & Support](#contact--support)

---

## General Principles
- **Consistency is key:** Always follow naming, formatting, and image guidelines.
- **Accuracy:** Double-check all required fields and spelling.
- **Performance:** Use optimized images and concise Markdown.
- **Accessibility:** Use descriptive alt text for all images.
- **Version Control:** All changes must be committed to git with a clear message.

---

## Preparation Checklist
Before you start, ensure you have:
- [ ] The full details for the new beer, menu item, or event (name, description, status, etc.)
- [ ] At least one high-quality, optimized image (see [Image Handling](#image-handling--optimization))
- [ ] The correct template file for the content type
- [ ] Access to the project repository and ability to commit changes

---

## Adding a New Beer

### 1. Copy the Beer Template
```bash
cp src/data/templates/beer-template.md src/data/beers/your-beer-name.md
```
- Replace `your-beer-name` with a lowercase, hyphen-separated version of the beer name (e.g., `golden-wheat-ale`).

### 2. Edit the New File
- Open the new file in your editor.
- Fill in **all required fields** in the frontmatter (top section between `---`).
- Update the `slug` field to match the filename (without `.md`).
- Remove or update optional fields as needed.
- Delete all template comments before publishing.

### 3. Add/Update Images
- Place the beer image in `/public/images/beers/`.
- Image must be **400x600px portrait**, optimized for web (WebP preferred).
- Name the image file to match the beer slug (e.g., `golden-wheat-ale.jpg`).
- Add descriptive alt text in the Markdown or frontmatter.

### 4. Review & Commit
- Preview the beer entry locally.
- Check for typos, formatting, and image display.
- Commit with a message: `feat: add [beer name] beer entry`

---

## Adding a New Menu Item

### 1. Copy the Food Template
```bash
cp src/data/templates/food-template.md src/data/food/[category]/your-food-item.md
```
- Replace `[category]` with one of: `appetizers`, `mains`, `sides`, `drinks`, `desserts`.
- Use a lowercase, hyphen-separated name for the file.

### 2. Edit the New File
- Fill in all required and relevant optional fields.
- Set `slug` to match the filename (no `.md`).
- Remove template comments.

### 3. Add/Update Images
- Place the image in `/public/images/food/[category]/`.
- Image must be **400x400px square**, optimized for web.
- Name the image file to match the food slug.
- Add descriptive alt text.

### 4. Review & Commit
- Preview the menu item locally.
- Commit with a message: `feat: add [food name] menu item`

---

## Adding a New Event

### 1. Copy the Event Template
```bash
cp src/data/templates/event-template.md src/data/events/your-event-name.md
```
- Use a lowercase, hyphen-separated name for the file.

### 2. Edit the New File
- Fill in all required and relevant optional fields.
- Set `slug` to match the filename (no `.md`).
- Remove template comments.

### 3. Add/Update Images
- Place the image in `/public/images/events/`.
- Image must be **800x400px landscape**, optimized for web.
- Name the image file to match the event slug.
- Add descriptive alt text.

### 4. Review & Commit
- Preview the event locally.
- Commit with a message: `feat: add [event name] event`

---

## Image Handling & Optimization
- **Format:** WebP preferred, JPG/PNG acceptable.
- **Compression:** Use tools like TinyPNG, Squoosh, or ImageOptim.
- **Naming:** Match the slug, use lowercase and hyphens.
- **Alt Text:** Always provide descriptive alt text for accessibility.
- **Placement:**
  - Beers: `/public/images/beers/`
  - Food: `/public/images/food/[category]/`
  - Events: `/public/images/events/`
- **Dimensions:**
  - Beer: 400x600px (portrait)
  - Food: 400x400px (square)
  - Event: 800x400px (landscape)

---

## Review & Quality Assurance
- [ ] Preview the new content in the local dev environment
- [ ] Check for typos, formatting, and broken links
- [ ] Ensure images display correctly and are optimized
- [ ] Confirm all required fields are present and accurate
- [ ] Remove all template comments
- [ ] Commit with a clear, descriptive message

---

## Troubleshooting & FAQ
- **Q: My content isn’t showing up?**
  - Check the `slug` and filename match
  - Ensure all required fields are filled
  - Look for YAML syntax errors in the frontmatter
  - Make sure the image is in the correct folder and named properly
- **Q: Image isn’t displaying?**
  - Check the image path and filename
  - Confirm the image is optimized and in the right format
- **Q: How do I add a new category?**
  - Update the relevant template and folder structure
  - Inform the development team if new UI changes are needed
- **Q: How do I feature content?**
  - Set `featured: true` in the frontmatter

---

## Contact & Support
- For technical issues, contact the development team
- For content questions, refer to existing files and template comments
- Always review your changes before publishing

---

## Quick Reference: Required Fields by Content Type

### Beer
- `name`, `slug`, `status`, `description`, `srm`, `ibu`, `abv`, `image`

### Food
- `name`, `slug`, `category`, `description`, `price`, `available`, `image`

### Event
- `name`, `slug`, `date`, `status`, `description`, `category`, `image`

---

**Always follow this SOP for every new beer, menu item, or event. Consistency and attention to detail keep the Broken Loop Brewing website professional and user-friendly.**
