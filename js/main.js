/**
 * 定数・設定の管理
 * アプリケーション全体で使用する設定値を一元管理
 */
const CONFIG = {
  // スクロール関連の設定
  scroll: {
    threshold: 100,
    headerOpacityMax: 0.9,
    headerOpacityMin: 0.6,
    buttonShowThreshold: 100,
  },
  // ブログ関連の設定
  blog: {
    defaultSortOrder: "newest",
    defaultFilter: "all",
    postsPerPage: 10,
  },
};

/**
 * ユーティリティ関数
 * 共通で使用する汎用的な関数群
 */
const utils = {
  // 日付フォーマット
  formatDate(date) {
    return new Date(date).toLocaleDateString("ja-JP");
  },

  // エラーハンドリング
  handleError(error, fallback) {
    console.error("エラーが発生しました:", error);
    return fallback;
  },

  // DOM要素の作成
  createElement(tag, className, innerHTML = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },
};

/**
 * UIコントロール関連のクラス
 * ヘッダーやスクロールなどのUI制御を担当
 */
class UIController {
  #header;
  #scrollThreshold;

  constructor(headerSelector = ".header") {
    this.#header = document.querySelector(headerSelector);
    this.#scrollThreshold = CONFIG.scroll.threshold;
    this.init();
  }

  init() {
    if (!this.#header) return;
    this.setupScrollEvents();
    this.setupSmoothScroll();
  }

  setupScrollEvents() {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const opacity = this.calculateOpacity(scrollTop);
      this.updateHeaderStyle(opacity);
    });
  }

  calculateOpacity(scrollTop) {
    return Math.min(
      CONFIG.scroll.headerOpacityMax,
      Math.max(
        CONFIG.scroll.headerOpacityMin,
        1 - scrollTop / this.#scrollThreshold
      )
    );
  }

  updateHeaderStyle(opacity) {
    if (!this.#header) return;
    this.#header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    this.#header.style.backdropFilter = `blur(${8 * (1 - opacity)}px)`;
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }
}

/**
 * ブログ管理クラス
 * ブログ投稿の表示、フィルタリング、検索機能を管理
 */
class BlogPostManager {
  #state = {
    posts: [],
    categories: new Set(),
    currentFilter: CONFIG.blog.defaultFilter,
    sortOrder: CONFIG.blog.defaultSortOrder,
  };

  constructor() {
    this.init();
  }

  async init() {
    try {
      await this.fetchPosts();
      this.initializeCategories();
      this.setupUI();
      this.renderPosts();
    } catch (error) {
      utils.handleError(error);
    }
  }

  setupUI() {
    this.setupSearchFeature();
    this.setupSortingFeature();
    this.setupCategoryFilter();
  }

  async fetchPosts() {
    try {
      const response = await fetch("/data/posts.json");
      if (!response.ok) throw new Error("データの取得に失敗しました");
      const data = await response.json();
      this.#state.posts = data.posts;
    } catch (error) {
      console.error("データ取得エラー:", error);
      this.#state.posts = [
        {
          id: 1,
          title: "エラーが発生しました",
          body: "データの読み込みに失敗しました。",
          date: new Date().toISOString(),
          author: "システム",
          category: "エラー",
        },
      ];
    }
  }

  renderPosts(posts = this.#state.posts) {
    const container = document.querySelector(".blog-posts");
    if (!container) return;

    const postsHTML = posts
      .map(
        (post) => `
      <article class="blog-post" data-post-id="${post.id}">
        <h3>${post.title}</h3>
        <div class="post-meta-header">
          <span class="category">${post.category}</span>
          <span class="author">投稿者: ${post.author}</span>
        </div>
        <p>${post.body}</p>
        <div class="post-meta">
          <time datetime="${post.date}">${utils.formatDate(post.date)}</time>
          <button class="read-more-btn" data-post-id="${
            post.id
          }">続きを読む</button>
        </div>
      </article>
    `
      )
      .join("");

    container.innerHTML = postsHTML || "<p>投稿がありません。</p>";
  }

  initializeCategories() {
    this.#state.categories = new Set(
      this.#state.posts.map((post) => post.category)
    );
    this.setupCategoryFilter();
  }

  setupCategoryFilter() {
    const filterContainer = utils.createElement("div", "category-filter");
    const select = utils.createElement("select", "category-select");

    select.innerHTML = `
      <option value="all">すべて表示</option>
      ${[...this.#state.categories]
        .map(
          (category) => `
          <option value="${category}">${category}</option>
        `
        )
        .join("")}
    `;

    select.addEventListener("change", (e) => {
      this.filterByCategory(e.target.value);
    });

    filterContainer.appendChild(select);

    // この部分は、カテゴリーフィルターをブログセクションの先頭に挿入する処理です。
    // 1. document.querySelector("#blog")でブログセクションの要素を取得
    // 2. ブログセクションが存在する場合(if (blogSection))、
    // 3. insertBeforeメソッドを使用して、filterContainerをブログセクションの最初の子要素として挿入
    // ただし、現在はコメントアウトされているため実行されません
    // const blogSection = document.querySelector("#blog");
    // if (blogSection) {
    //   blogSection.insertBefore(filterContainer, blogSection.firstChild);
    // }
  }

  filterByCategory(category) {
    this.#state.currentFilter = category;
    const filteredPosts =
      category === "all"
        ? this.#state.posts
        : this.#state.posts.filter((post) => post.category === category);
    this.renderPosts(filteredPosts);
  }

  setupSearchFeature() {
    const searchInput = utils.createElement("input", "search-input");
    searchInput.type = "search";
    searchInput.placeholder = "ブログ記事を検索...";
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = this.#state.posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.body.toLowerCase().includes(term)
      );
      this.renderPosts(filtered);
    });

    const blogSection = document.querySelector("#blog");
    if (blogSection) {
      blogSection.insertBefore(searchInput, blogSection.firstChild);
    }
  }

  setupSortingFeature() {
    const select = utils.createElement("select", "sort-select");
    select.innerHTML = `
      <option value="newest">新しい順</option>
      <option value="oldest">古い順</option>
    `;
    select.addEventListener("change", (e) => {
      this.#state.sortOrder = e.target.value;
      this.sortPosts();
    });

    const blogSection = document.querySelector("#blog");
    if (blogSection) {
      blogSection.insertBefore(select, blogSection.firstChild);
    }
  }

  sortPosts() {
    const sorted = [...this.#state.posts].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.#state.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    this.renderPosts(sorted);
  }
}

/**
 * フォーム管理クラス
 * お問い合わせフォームの処理を管理
 */
class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.statusDiv = document.getElementById("submission-status");
    if (this.form) this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupValidation();
  }

  setupValidation() {
    this.form.querySelectorAll("[required]").forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
    });
  }

  validateField(field) {
    const errorSpan = this.form.querySelector(`[data-error="${field.name}"]`);
    const isValid = field.value.trim() !== "";

    if (errorSpan) {
      errorSpan.textContent = isValid ? "" : "必須項目です";
      errorSpan.classList.toggle("show", !isValid);
    }

    return isValid;
  }

  validateForm() {
    const fields = this.form.querySelectorAll("[required]");
    return Array.from(fields).every((field) => this.validateField(field));
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.validateForm()) {
      this.showStatus("入力内容を確認してください", "error");
      return;
    }

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    console.log("送信データ:", data);

    this.showStatus("送信しました！", "success");
    this.form.reset();
  }

  showStatus(message, type) {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = message;
    this.statusDiv.className = `submission-status ${type}`;

    setTimeout(() => {
      this.statusDiv.textContent = "";
      this.statusDiv.className = "submission-status";
    }, 3000);
  }
}

/**
 * アプリケーションの初期化
 * 全体の初期化処理を管理
 */
class App {
  static init() {
    document.addEventListener("DOMContentLoaded", () => {
      try {
        new UIController();
        new BlogPostManager();
        new ContactForm("contact-form");
      } catch (error) {
        utils.handleError(error);
      }
    });
  }
}

App.init();
