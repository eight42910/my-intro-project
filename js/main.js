/**
 * アプリケーション全体の構成
 *
 * 1. CONFIG (設定): アプリケーション全体の設定値を管理
 * 2. utils (ユーティリティ): 共通で使用する汎用的な関数群
 * 3. UIController: UI/UXの制御を担当
 * 4. BlogPostManager: ブログ記事の管理と表示を担当
 * 5. ContactForm: お問い合わせフォームの制御を担当
 * 6. App: アプリケーション全体の初期化を担当
 *
 * 各クラスは単一責任の原則に従い、特定の機能に特化しています。
 * イベント駆動型のアーキテクチャを採用し、ユーザーの操作に応じて適切に動作します。
 */

/**
 * アプリケーション全体の定数オブジェクト
 * アプリケーション全体で使用する設定値を一元管理します
 *
 * @type {Object} CONFIG
 * @property {Object} scroll - スクロール関連の設定
 * @property {Object} blog - ブログ機能の設定
 */
const CONFIG = {
  // スクロール関連の設定 - ヘッダーの透明度やスクロールの挙動を制御
  scroll: {
    threshold: 100, // スクロール開始のしきい値(px)
    headerOpacityMax: 0.9, // ヘッダーの最大不透明度
    headerOpacityMin: 0.6, // ヘッダーの最小不透明度
    buttonShowThreshold: 100, // トップへ戻るボタンの表示しきい値(px)
  },
  // ブログ機能の設定 - 記事の表示方法や初期状態を定義
  blog: {
    defaultSortOrder: "newest", // デフォルトの並び順（新しい順）
    defaultFilter: "all", // デフォルトのフィルター（全カテゴリー）
    postsPerPage: 10, // 1ページあたりの表示件数
  },
};

/**
 * ユーティリティ関数群
 * アプリケーション全体で使用する汎用的な関数をまとめたオブジェクト
 *
 * @namespace utils
 * @property {Function} formatDate - 日付のフォーマット
 * @property {Function} handleError - エラー処理
 * @property {Function} createElement - DOM要素の作成
 */
const utils = {
  /**
   * 日付を日本語形式にフォーマットする
   * 例: "2023-12-25" → "2023年12月25日"
   *
   * @param {string} date - ISO形式の日付文字列
   * @returns {string} フォーマットされた日付文字列
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString("ja-JP");
  },

  /**
   * エラーハンドリングを統一的に処理
   * エラーログを出力し、フォールバック値を返す
   *
   * @param {Error} error - エラーオブジェクト
   * @param {*} fallback - エラー時の代替値
   * @returns {*} fallback値
   */
  handleError(error, fallback) {
    console.error("エラーが発生しました:", error);
    return fallback;
  },

  /**
   * DOM要素を効率的に作成
   * 要素の作成、クラス設定、内容の設定を一括で行う
   *
   * @param {string} tag - HTML要素名（div, span等）
   * @param {string} className - CSSクラス名
   * @param {string} innerHTML - 内部HTML
   * @returns {HTMLElement} 作成されたDOM要素
   */
  createElement(tag, className, innerHTML = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },
};

/**
 * UIの制御を行うクラス
 * ヘッダーの透明度制御やスムーズスクロールなど、
 * ユーザーインターフェースの動的な制御を担当
 *
 * @class UIController
 * @property {HTMLElement} #header - ヘッダー要素
 * @property {number} #scrollThreshold - スクロールのしきい値
 */
class UIController {
  #header;
  #scrollThreshold;

  /**
   * UIControllerのインスタンスを初期化
   * ヘッダー要素の取得と初期設定を行う
   *
   * @constructor
   * @param {string} headerSelector - ヘッダー要素のCSSセレクター
   */
  constructor(headerSelector = ".header") {
    this.#header = document.querySelector(headerSelector);
    this.#scrollThreshold = CONFIG.scroll.threshold;
    this.init();
  }

  /**
   * UIの初期化
   * スクロールイベントとスムーズスクロールの設定を行う
   *
   * @private
   */
  init() {
    if (!this.#header) return;
    this.setupScrollEvents();
    this.setupSmoothScroll();
  }

  /**
   * スクロールイベントの設定
   * スクロール位置に応じてヘッダーの透明度を動的に制御
   *
   * @private
   */
  setupScrollEvents() {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const opacity = this.calculateOpacity(scrollTop);
      this.updateHeaderStyle(opacity);
    });
  }

  /**
   * ヘッダーの不透明度を計算
   * スクロール位置に基づいて適切な不透明度を算出
   *
   * @private
   * @param {number} scrollTop - 現在のスクロール位置
   * @returns {number} 計算された不透明度（0-1）
   */
  calculateOpacity(scrollTop) {
    return Math.min(
      CONFIG.scroll.headerOpacityMax,
      Math.max(
        CONFIG.scroll.headerOpacityMin,
        1 - scrollTop / this.#scrollThreshold
      )
    );
  }

  /**
   * ヘッダーのスタイルを更新
   * 不透明度とブラー効果を動的に設定
   *
   * @private
   * @param {number} opacity - 設定する不透明度
   */
  updateHeaderStyle(opacity) {
    if (!this.#header) return;
    this.#header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    this.#header.style.backdropFilter = `blur(${8 * (1 - opacity)}px)`;
  }

  /**
   * スムーズスクロールの設定
   * ページ内リンクのクリック時に、目的地までスムーズにスクロール
   *
   * @private
   */
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
 * ブログ投稿を管理するクラス
 * 記事の取得、表示、フィルタリング、ソートなどの
 * ブログ機能全般を制御
 *
 * @class BlogPostManager
 * @property {Object} #state - ブログの状態を管理するオブジェクト
 */
class BlogPostManager {
  #state = {
    posts: [], // 全ての投稿データ
    categories: new Set(), // 利用可能なカテゴリー
    currentFilter: CONFIG.blog.defaultFilter, // 現在のフィルター設定
    sortOrder: CONFIG.blog.defaultSortOrder, // 現在のソート順
  };

  constructor() {
    this.init();
  }

  /**
   * ブログ機能の初期化
   * データの取得、カテゴリーの設定、UI要素の構築を行う
   *
   * @private
   */
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

  /**
   * UI要素のセットアップ
   * 検索、ソート、カテゴリーフィルターの機能を初期化
   *
   * @private
   */
  setupUI() {
    this.setupSearchFeature();
    this.setupSortingFeature();
    this.setupCategoryFilter();
  }

  /**
   * 投稿データの取得
   * サーバーからブログ記事データを非同期で取得
   *
   * @private
   */
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

  /**
   * 投稿の表示
   * 記事一覧をHTML形式で表示
   *
   * @private
   * @param {Array} posts - 表示する投稿の配列
   */
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

  /**
   * カテゴリーの初期化
   * 利用可能なカテゴリーを投稿から抽出
   *
   * @private
   */
  initializeCategories() {
    this.#state.categories = new Set(
      this.#state.posts.map((post) => post.category)
    );
    this.setupCategoryFilter();
  }

  /**
   * カテゴリーフィルターの設定
   * カテゴリー選択UIの構築と制御
   *
   * @private
   */
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
  }

  /**
   * カテゴリーによるフィルタリング
   * 選択されたカテゴリーの投稿のみを表示
   *
   * @private
   * @param {string} category - フィルタリングするカテゴリー
   */
  filterByCategory(category) {
    this.#state.currentFilter = category;
    const filteredPosts =
      category === "all"
        ? this.#state.posts
        : this.#state.posts.filter((post) => post.category === category);
    this.renderPosts(filteredPosts);
  }

  /**
   * 検索機能の設定
   * キーワードによる記事の検索機能を実装
   *
   * @private
   */
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

  /**
   * ソート機能の設定
   * 投稿の日付によるソート機能を実装
   *
   * @private
   */
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

  /**
   * 投稿のソート処理
   * 日付に基づいて投稿を並び替え
   *
   * @private
   */
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
 * お問い合わせフォームを管理するクラス
 * フォームの検証、送信、エラー表示を制御
 *
 * @class ContactForm
 * @property {HTMLFormElement} form - フォーム要素
 * @property {HTMLElement} statusDiv - 送信状態表示要素
 */
class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.statusDiv = document.getElementById("submission-status");
    if (this.form) this.init();
  }

  /**
   * フォームの初期化
   * イベントリスナーとバリデーションの設定
   *
   * @private
   */
  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupValidation();
  }

  /**
   * バリデーションの設定
   * 必須フィールドのチェックを実装
   *
   * @private
   */
  setupValidation() {
    this.form.querySelectorAll("[required]").forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
    });
  }

  /**
   * フィールドの検証
   * 個別フィールドのバリデーションを実行
   *
   * @private
   * @param {HTMLElement} field - 検証するフィールド要素
   * @returns {boolean} バリデーション結果
   */
  validateField(field) {
    const errorSpan = this.form.querySelector(`[data-error="${field.name}"]`);
    const isValid = field.value.trim() !== "";

    if (errorSpan) {
      errorSpan.textContent = isValid ? "" : "必須項目です";
      errorSpan.classList.toggle("show", !isValid);
    }

    return isValid;
  }

  /**
   * フォーム全体の検証
   * 全必須フィールドのバリデーションを実行
   *
   * @private
   * @returns {boolean} フォーム全体のバリデーション結果
   */
  validateForm() {
    const fields = this.form.querySelectorAll("[required]");
    return Array.from(fields).every((field) => this.validateField(field));
  }

  /**
   * フォーム送信の処理
   * バリデーション実行と送信処理を制御
   *
   * @private
   * @param {Event} e - イベントオブジェクト
   */
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

  /**
   * ステータスメッセージの表示
   * フォーム送信結果をユーザーに通知
   *
   * @private
   * @param {string} message - 表示するメッセージ
   * @param {string} type - メッセージのタイプ（success/error）
   */
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
 * アプリケーション全体の初期化を管理するクラス
 * 各コンポーネントの初期化を制御
 *
 * @class App
 */
class App {
  /**
   * アプリケーションの初期化
   * DOMの読み込み完了後に各コンポーネントを初期化
   *
   * @static
   */
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

// アプリケーションの初期化を実行
App.init();
