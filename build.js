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

<meta name="description" content="${escapeHtml(description)}">

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
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      return dateB - dateA;
    })
    .map(article => ({
      title: article.title || "",
      description: article.description || "",
      image: article.image || "",
      category: article.category || "Tech",
      date: article.date || "",
      url: `/articles/${article.slug}.html`
    }));


  const directory = path.join(site, "articles");

  fs.mkdirSync(directory, { recursive: true });


  for (const article of articles) {

    const html = pageTemplate(
      article.title || "Vireonis Article",

      article.description || "",

      `
      ${
        article.image
          ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}">`
          : ""
      }

      <p>
        <strong>
          ${escapeHtml(article.category || "Tech")}
        </strong>
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


  fs.mkdirSync(
    path.join(site, "data"),
    { recursive: true }
  );


  fs.writeFileSync(
    path.join(site, "data", "articles.json"),
    JSON.stringify(data, null, 2)
  );


  return articles;
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


  const directory = path.join(site, "products");

  fs.mkdirSync(directory, { recursive: true });


  for (const product of products) {

    const button = product.affiliate_link

      ? `<p>
          <a
            href="${escapeHtml(product.affiliate_link)}"
            target="_blank"
            rel="nofollow sponsored noopener">
            Check Price
          </a>
        </p>`

      : "";


    const html = pageTemplate(

      product.name || "Vireonis Product",

      product.description || "",

      `
      ${
        product.image
          ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`
          : ""
      }

      <p>
        <strong>
          ${escapeHtml(product.category || "Tech")}
        </strong>
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
      path.join(directory, `${product.slug}.html`),
      html
    );
  }


  fs.mkdirSync(
    path.join(site, "data"),
    { recursive: true }
  );


  fs.writeFileSync(
    path.join(site, "data", "products.json"),
    JSON.stringify(data, null, 2)
  );


  return products;
}


/* =========================
   BUILD LATEST ARTICLES
========================= */

function buildLatestArticles(articles) {

  const homepage = path.join(root, "index.html");

  if (!fs.existsSync(homepage)) {
    console.log("index.html not found.");
    return;
  }

  let html = fs.readFileSync(homepage, "utf8");


  const startMarker = "<!-- LATEST ARTICLES -->";
  const endMarker = "<!-- END LATEST ARTICLES -->";


  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);


  if (startIndex === -1 || endIndex === -1) {

    console.log(
      "Latest Articles markers were not found in index.html."
    );

    return;
  }


  const sortedArticles = [...articles]
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      return dateB - dateA;
    })
    .slice(0, 6);


  let cards = "";


  if (sortedArticles.length === 0) {

    cards = `
      <div class="card">

        <div class="card-icon">📰</div>

        <h3>No Articles Yet</h3>

        <p>
          New Vireonis articles will appear here automatically.
        </p>

      </div>
    `;

  } else {

    cards = sortedArticles
      .map(article => {

        const image = article.image

          ? `
            <img
              src="${escapeHtml(article.image)}"
              alt="${escapeHtml(article.title || "Vireonis Article")}"
              style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;">
            `

          : `
            <div class="card-icon">📰</div>
            `;


        return `
          <div class="card">

            ${image}

            <h3>
              ${escapeHtml(article.title || "Vireonis Article")}
            </h3>

            <p>
              ${escapeHtml(article.description || "")}
            </p>

            <a href="/articles/${encodeURIComponent(article.slug)}.html">
              Read Article →
            </a>

          </div>
        `;

      })
      .join("");
  }


  const latestArticlesSection = `

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


  html =
    html.substring(0, startIndex) +
    latestArticlesSection +
    html.substring(endIndex + endMarker.length);


  fs.writeFileSync(homepage, html);

  console.log(
    `Latest Articles section generated with ${sortedArticles.length} article(s).`
  );
}


/* =========================
   COPY STATIC FILES
========================= */

copyIfExists(
  path.join(root, "index.html"),
  path.join(site, "index.html")
);

copyIfExists(
  path.join(root, "admin"),
  path.join(site, "admin")
);

copyIfExists(
  path.join(root, "images"),
  path.join(site, "images")
);


/* =========================
   BUILD CONTENT
========================= */

const articles = buildArticles();

buildProducts();


/* =========================
   UPDATE HOMEPAGE
========================= */

buildLatestArticles(articles);


/* =========================
   COPY UPDATED HOMEPAGE
========================= */

copyIfExists(
  path.join(root, "index.html"),
  path.join(site, "index.html")
);


console.log("Vireonis build completed successfully.");