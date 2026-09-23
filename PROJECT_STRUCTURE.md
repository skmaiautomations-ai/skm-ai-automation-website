# SKM AI Automation — Website Structure

The website is separated into maintainable files:

- `index.html` — page structure/content
- `css/styles.css` — all page styling
- `js/projects.js` — project listing / project UI behavior
- `js/chatbot.js` — chatbot UI behavior and Netlify function integration
- `netlify/functions/chat.mjs` — Gemini chatbot backend
- `images/` — website images
- `projects.json`, `clients.json`, `reviews.json` — website data

The Careers section keeps the two Google Forms linked directly from the HTML so the application destinations remain simple and reliable.
