import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const root = process.cwd();
const site = path.join(root, "_site");

fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(site, { recursive: true });


function copyIfExists(source, destination) {
  if (fs.existsSync(source)) {
    fs.cpSync(source, destination, { recursive: true });
  }
}


function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function readContent(folder) {

  const directory = path.join(root, "content", folder);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter(file => file.endsWith(".md"))
    .map(file => {

      const filePath = path.join(directory, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);

      return {
        ...parsed.data,
        body: parsed.content,
        slug: path.basename(file, ".md")
      };

    });
}


function pageTemplate(title, description, content) {

  return `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(title)} | Vireonis</title>

<meta
name="description"
content="${escapeHtml(description)}"
>

<style>

body{
margin:0;
font-family:Arial,sans-serif;
background:#f7f8fa;
color:#111827;
}

header{
background:#111827;
color:white;
padding:22px;
}

header a{
color:white;
text-decoration:none;
font-size:24px;
font-weight:bold;
}

main{
max-width:850px;
margin:40px auto;
padding:25px;
background:white;
border-radius:16px;
box-shadow:0 5px 25px rgba(0,0,0,.06);
}

img{
max-width:100%;
border-radius:14px;
}

h1{
font-size:38px;
}

h2{
margin-top:35px;
}

p,li{
line-height:1.8;
}

.back{
display:inline-block;
margin-bottom:25px;
text-decoration:none;
}

footer{
text-align:center;
padding:30px;
color:#6b7280;
}

.button{
display:inline-block;
padding:12px 18px;
background:#111827;
color:white;
text-decoration:none;
border-radius:8px;
}

</style>

</head>

<body>

<header>

<a href="/">Vireonis</a>

</header>

<main>

<a class="back" href="/">← Back to Vireonis</a>

<h1>${escapeHtml(title)}</h1>

${content}

</main>

<footer>

© ${new Date().getFullYear()} Vireonis

</footer>

</body>

</html>`;
}


/* =========================
   BUILD ARTICLES
========================= */

function buildArticles() {

  const articles = readContent("articles");

  const data = articles
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))
    .map(article => ({

      title: article.title || "",
      description: article.description || "",
      image: article.image || "",
      category: article.category || "Tech",
      date: article.date || "",
      url: `/articles/${article.slug}.html`

    }));

  const directory = path.join(site, "articles");

  fs.mkdirSync(directory, { recursive:true });

  for (const article of articles) {

    const html = pageTemplate(

      article.title || "Vireonis Article",

      article.description || "",

      `

      ${
        article.image
        ? `<img src="${escapeHtml(article.image)}"
          alt="${escapeHtml(article.title)}">`
        : ""
      }

      <p>
      <strong>${escapeHtml(article.category || "Tech")}</strong>
      </p>

      <div>
      ${marked.parse(article.body || "")}
      </div>

      `

    );

    fs.writeFileSync(
      path.join(directory, `${article.slug}.html`),
      html
    );

  }

  fs.mkdirSync(path.join(site,"data"),{recursive:true});

  fs.writeFileSync(
    path.join(site,"data","articles.json"),
    JSON.stringify(data,null,2)
  );

  return articles;
}


/* =========================
   BUILD REVIEWS
========================= */

function buildReviews() {

  const reviews = readContent("reviews");

  const data = reviews.map(review => ({

    title: review.title || "",
    description: review.description || "",
    image: review.image || "",
    product: review.product || "",
    category: review.category || "Reviews",
    date: review.date || "",
    url: `/reviews/${review.slug}.html`

  }));

  const directory = path.join(site,"reviews");

  fs.mkdirSync(directory,{recursive:true});

  for (const review of reviews) {

    const html = pageTemplate(

      review.title || "Vireonis Review",

      review.description || "",

      `

      ${
        review.image
        ? `<img src="${escapeHtml(review.image)}"
          alt="${escapeHtml(review.title)}">`
        : ""
      }

      <p>
      <strong>Review</strong>
      </p>

      ${
        review.product
        ? `<p><strong>Product:</strong>
        ${escapeHtml(review.product)}</p>`
        : ""
      }

      <div>
      ${marked.parse(review.body || "")}
      </div>

      `

    );

    fs.writeFileSync(
      path.join(directory,`${review.slug}.html`),
      html
    );

  }

  fs.mkdirSync(path.join(site,"data"),{recursive:true});

  fs.writeFileSync(
    path.join(site,"data","reviews.json"),
    JSON.stringify(data,null,2)
  );

  return reviews;
}


/* =========================
   BUILD GUIDES
========================= */

function buildGuides() {

  const guides = readContent("guides");

  const data = guides.map(guide => ({

    title: guide.title || "",
    description: guide.description || "",
    image: guide.image || "",
    category: guide.category || "Buying Guides",
    date: guide.date || "",
    url: `/guides/${guide.slug}.html`

  }));

  const directory = path.join(site,"guides");

  fs.mkdirSync(directory,{recursive:true});

  for (const guide of guides) {

    const html = pageTemplate(

      guide.title || "Vireonis Buying Guide",

      guide.description || "",

      `

      ${
        guide.image
        ? `<img src="${escapeHtml(guide.image)}"
          alt="${escapeHtml(guide.title)}">`
        : ""
      }

      <p>
      <strong>Buying Guide</strong>
      </p>

      <div>
      ${marked.parse(guide.body || "")}
      </div>

      `

    );

    fs.writeFileSync(
      path.join(directory,`${guide.slug}.html`),
      html
    );

  }

  fs.mkdirSync(path.join(site,"data"),{recursive:true});

  fs.writeFileSync(
    path.join(site,"data","guides.json"),
    JSON.stringify(data,null,2)
  );

  return guides;
}


/* =========================
   BUILD COMPARISONS
========================= */

function buildComparisons() {

  const comparisons = readContent("comparisons");

  const data = comparisons.map(comparison => ({

    title: comparison.title || "",
    description: comparison.description || "",
    image: comparison.image || "",
    product_a: comparison.product_a || "",
    product_b: comparison.product_b || "",
    date: comparison.date || "",
    url: `/comparisons/${comparison.slug}.html`

  }));

  const directory = path.join(site,"comparisons");

  fs.mkdirSync(directory,{recursive:true});

  for (const comparison of comparisons) {

    const html = pageTemplate(

      comparison.title || "Vireonis Comparison",

      comparison.description || "",

      `

      ${
        comparison.image
        ? `<img src="${escapeHtml(comparison.image)}"
          alt="${escapeHtml(comparison.title)}">`
        : ""
      }

      <p>
      <strong>Comparison</strong>
      </p>

      <p>
      ${
        comparison.product_a
        ? `<strong>Product A:</strong>
        ${escapeHtml(comparison.product_a)}`
        : ""
      }
      </p>

      <p>
      ${
        comparison.product_b
        ? `<strong>Product B:</strong>
        ${escapeHtml(comparison.product_b)}`
        : ""
      }
      </p>

      <div>
      ${marked.parse(comparison.body || "")}
      </div>

      `

    );

    fs.writeFileSync(
      path.join(directory,`${comparison.slug}.html`),
      html
    );

  }

  fs.mkdirSync(path.join(site,"data"),{recursive:true});

  fs.writeFileSync(
    path.join(site,"data","comparisons.json"),
    JSON.stringify(data,null,2)
  );

  return comparisons;
}


/* =========================
   BUILD PRODUCTS
========================= */

function buildProducts() {

  const products = readContent("products");

  const data = products.map(product => ({

    name: product.name || product.title || "",
    description: product.description || "",
    image: product.image || "",
    category: product.category || "Tech",
    price: product.price || "",
    url: `/products/${product.slug}.html`,
    affiliate_link: product.affiliate_link || ""

  }));

  const directory = path.join(site,"products");

  fs.mkdirSync(directory,{recursive:true});

  for (const product of products) {

    const button = product.affiliate_link

      ? `
      <p>
      <a
      class="button"
      href="${escapeHtml(product.affiliate_link)}"
      target="_blank"
      rel="nofollow sponsored noopener">
      Check Price
      </a>
      </p>
      `

      : "";

    const html = pageTemplate(

      product.name || "Vireonis Product",

      product.description || "",

      `

      ${
        product.image
        ? `<img src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}">`
        : ""
      }

      <p>
      <strong>${escapeHtml(product.category || "Tech")}</strong>
      </p>

      ${
        product.price
        ? `<h2>${escapeHtml(product.price)}</h2>`
        : ""
      }

      <div>
      ${marked.parse(product.body || "")}
      </div>

      ${button}

      <hr>

      <p>
      <small>
      Vireonis may earn a commission from qualifying purchases.
      </small>
      </p>

      `

    );

    fs.writeFileSync(
      path.join(directory,`${product.slug}.html`),
      html
    );

  }

  fs.mkdirSync(path.join(site,"data"),{recursive:true});

  fs.writeFileSync(
    path.join(site,"data","products.json"),
    JSON.stringify(data,null,2)
  );

  return products;
}


/* =========================
   HOMEPAGE SECTION BUILDER
========================= */

function replaceSection(
  html,
  startMarker,
  endMarker,
  section
) {

  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  if (start === -1 || end === -1) {

    console.log(
      `Markers not found: ${startMarker}`
    );

    return html;
  }

  return (
    html.substring(0,start) +
    section +
    html.substring(end + endMarker.length)
  );
}


/* =========================
   REVIEWS HOMEPAGE
========================= */

function homepageReviews(reviews) {

  const items = reviews
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0,6);

  const cards = items.length

    ? items.map(review => `

      <div class="card">

      ${
        review.image
        ? `<img
          src="${escapeHtml(review.image)}"
          alt="${escapeHtml(review.title)}"
          style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;">`
        : `<div class="card-icon">⭐</div>`
      }

      <h3>${escapeHtml(review.title || "Review")}</h3>

      <p>${escapeHtml(review.description || "")}</p>

      <a href="/reviews/${encodeURIComponent(review.slug)}.html">
      Read Review →
      </a>

      </div>

    `).join("")

    : `

      <div class="card">

      <div class="card-icon">⭐</div>

      <h3>No Reviews Yet</h3>

      <p>
      New Vireonis reviews will appear here automatically.
      </p>

      </div>

    `;

  return `

  <!-- REVIEWS -->

  <section id="reviews">

  <div class="section-heading">

  <h2>Featured Reviews</h2>

  <p>
  Explore Vireonis reviews of consumer electronics and technology products.
  </p>

  </div>

  <div class="cards">

  ${cards}

  </div>

  </section>

  <!-- END REVIEWS -->

  `;
}


/* =========================
   GUIDES HOMEPAGE
========================= */

function homepageGuides(guides) {

  const items = guides
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0,6);

  const cards = items.length

    ? items.map(guide => `

      <div class="card">

      ${
        guide.image
        ? `<img
          src="${escapeHtml(guide.image)}"
          alt="${escapeHtml(guide.title)}"
          style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;">`
        : `<div class="card-icon">📘</div>`
      }

      <h3>${escapeHtml(guide.title || "Buying Guide")}</h3>

      <p>${escapeHtml(guide.description || "")}</p>

      <a href="/guides/${encodeURIComponent(guide.slug)}.html">
      Read Guide →
      </a>

      </div>

    `).join("")

    : `

      <div class="card">

      <div class="card-icon">📘</div>

      <h3>No Guides Yet</h3>

      <p>
      New Vireonis buying guides will appear here automatically.
      </p>

      </div>

    `;

  return `

  <!-- GUIDES -->

  <section class="guides" id="guides">

  <div class="section-heading">

  <h2>Buying Guides</h2>

  <p>
  Helpful guides to make smarter technology buying decisions.
  </p>

  </div>

  <div class="cards">

  ${cards}

  </div>

  </section>

  <!-- END GUIDES -->

  `;
}


/* =========================
   ARTICLES HOMEPAGE
========================= */

function homepageArticles(articles) {

  const items = articles
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0,6);

  const cards = items.length

    ? items.map(article => `

      <div class="card">

      ${
        article.image
        ? `<img
          src="${escapeHtml(article.image)}"
          alt="${escapeHtml(article.title)}"
          style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;">`
        : `<div class="card-icon">📰</div>`
      }

      <h3>${escapeHtml(article.title || "Article")}</h3>

      <p>${escapeHtml(article.description || "")}</p>

      <a href="/articles/${encodeURIComponent(article.slug)}.html">
      Read Article →
      </a>

      </div>

    `).join("")

    : `

      <div class="card">

      <div class="card-icon">📰</div>

      <h3>No Articles Yet</h3>

      <p>
      New Vireonis articles will appear here automatically.
      </p>

      </div>

    `;

  return `

  <!-- LATEST ARTICLES -->

  <section id="latest-articles">

  <div class="section-heading">

  <h2>Latest Articles</h2>

  <p>
  Explore the latest reviews, buying guides,
  comparisons and technology news from Vireonis.
  </p>

  </div>

  <div class="cards">

  ${cards}

  </div>

  </section>

  <!-- END LATEST ARTICLES -->

  `;
}


/* =========================
   COMPARISONS HOMEPAGE
========================= */

function homepageComparisons(comparisons) {

  const items = comparisons
    .sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0,6);

  const cards = items.length

    ? items.map(comparison => `

      <div class="card">

      ${
        comparison.image
        ? `<img
          src="${escapeHtml(comparison.image)}"
          alt="${escapeHtml(comparison.title)}"
          style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;">`
        : `<div class="card-icon">⚖️</div>`
      }

      <h3>${escapeHtml(comparison.title || "Comparison")}</h3>

      <p>${escapeHtml(comparison.description || "")}</p>

      <a href="/comparisons/${encodeURIComponent(comparison.slug)}.html">
      Read Comparison →
      </a>

      </div>

    `).join("")

    : `

      <div class="card">

      <div class="card-icon">⚖️</div>

      <h3>No Comparisons Yet</h3>

      <p>
      New Vireonis comparisons will appear here automatically.
      </p>

      </div>

    `;

  return `

  <!-- COMPARISONS -->

  <section id="comparisons">

  <div class="section-heading">

  <h2>Product Comparisons</h2>

  <p>
  Compare technology products and understand the differences before buying.
  </p>

  </div>

  <div class="cards">

  ${cards}

  </div>

  </section>

  <!-- END COMPARISONS -->

  `;
}


/* =========================
   COPY STATIC FILES
========================= */

copyIfExists(
  path.join(root,"images"),
  path.join(site,"images")
);

copyIfExists(
  path.join(root,"admin"),
  path.join(site,"admin")
);


/* =========================
   BUILD ALL CONTENT
========================= */

const articles = buildArticles();

const reviews = buildReviews();

const guides = buildGuides();

const comparisons = buildComparisons();

buildProducts();


/* =========================
   HOMEPAGE
========================= */

const homepage = path.join(root,"index.html");

if (fs.existsSync(homepage)) {

  let html = fs.readFileSync(homepage,"utf8");

  html = replaceSection(
    html,
    "<!-- REVIEWS -->",
    "<!-- END REVIEWS -->",
    homepageReviews(reviews)
  );

  html = replaceSection(
    html,
    "<!-- GUIDES -->",
    "<!-- END GUIDES -->",
    homepageGuides(guides)
  );

  html = replaceSection(
    html,
    "<!-- LATEST ARTICLES -->",
    "<!-- END LATEST ARTICLES -->",
    homepageArticles(articles)
  );

  html = replaceSection(
    html,
    "<!-- COMPARISONS -->",
    "<!-- END COMPARISONS -->",
    homepageComparisons(comparisons)
  );

  fs.writeFileSync(
    homepage,
    html
  );

}


/* =========================
   COPY FINAL HOMEPAGE
========================= */

copyIfExists(
  path.join(root,"index.html"),
  path.join(site,"index.html")
);


console.log("Vireonis build completed successfully.");