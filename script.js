const API_KEY = "066d5bf537574d25866e7d5c358bb845";

const newsContainer = document.getElementById("newsContainer");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category-section button");

async function fetchTopHeadlines(category = "general") {
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;
  await fetchNews(url);
}

async function searchNews(keyword) {
  const url = `https://newsapi.org/v2/everything?q=${keyword}&apiKey=${API_KEY}`;
  await fetchNews(url);
}

async function fetchNews(url) {
  try {
    showLoader();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error(data.message || "Something went wrong");
    }

    if (!data.articles || data.articles.length === 0) {
      showError("No articles found. Try another keyword or category.");
      return;
    }

    localStorage.setItem("lastNews", JSON.stringify(data.articles));
    renderArticles(data.articles);

  } catch (error) {
    const cachedNews = localStorage.getItem("lastNews");

    if (cachedNews) {
      renderArticles(JSON.parse(cachedNews));
      showError("Showing cached news because live news could not load.");
    } else {
      showError(error.message);
    }

  } finally {
    hideLoader();
  }
}

function renderArticles(articles) {
  errorMessage.textContent = "";
  newsContainer.innerHTML = "";

  articles.forEach(article => {
    const image = article.urlToImage || "https://via.placeholder.com/800x450?text=News+Image";
    const title = article.title || "No title available";
    const description = article.description || "No description available for this article.";
    const source = article.source?.name || "Unknown Source";
    const publishedDate = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString()
      : "Unknown Date";
    const articleUrl = article.url || "#";

    const card = document.createElement("article");
    card.className = "article-card";

    card.innerHTML = `
      <img src="${image}" alt="News article image">

      <div class="card-content">
        <div class="source-row">
          <span class="source-name">${source}</span>
          <span>${publishedDate}</span>
        </div>

        <h3>${title}</h3>
        <p>${description}</p>

        <a class="read-more" href="${articleUrl}" target="_blank">
          Read Full Story
        </a>
      </div>
    `;

    newsContainer.appendChild(card);
  });
}

function showLoader() {
  loader.classList.remove("hidden");
  errorMessage.textContent = "";
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const category = button.dataset.category;
    fetchTopHeadlines(category);
  });
});

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const keyword = searchInput.value.trim();

  if (keyword === "") {
    showError("Please enter a keyword to search.");
    return;
  }

  categoryButtons.forEach(btn => btn.classList.remove("active"));
  searchNews(keyword);
});

window.addEventListener("load", () => {
  const cachedNews = localStorage.getItem("lastNews");

  if (cachedNews) {
    renderArticles(JSON.parse(cachedNews));
  }

  fetchTopHeadlines();
});