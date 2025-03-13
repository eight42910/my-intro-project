// スクロール関連の設定値を一元管理
// 定数の集中管理
/**
 * スクロール関連の設定値を一元管理するオブジェクト
 *
 * @property {number} threshold - ヘッダーの透過度を変更する閾値(px)
 *   - スクロール量がこの値を超えるとヘッダーの透過度が変化し始める
 *   - 値が小さいほど早く透過度が変化する
 *
 * @property {number} headerOpacityMax - ヘッダーの最大透過度(0.0-1.0)
 *   - スクロール時のヘッダーの最も濃い状態を表す
 *   - 1.0に近いほど不透明になる
 *
 * @property {number} headerOpacityMin - ヘッダーの最小透過度(0.0-1.0)
 *   - スクロール時のヘッダーの最も薄い状態を表す
 *   - 0.0に近いほど透明になる
 *
 * @property {number} buttonShowThreshold - スクロールトップボタンを表示する閾値(px)
 *   - この値以上スクロールするとトップに戻るボタンが表示される
 *   - ユーザーの使い勝手を考慮して設定
 */
const SCROLL_CONFIG = {
  threshold: 100,
  headerOpacityMax: 0.9,
  headerOpacityMin: 0.6,
  buttonShowThreshold: 100,
};

/**
 * ヘッダーの透過処理を管理するクラス
 * スクロール量に応じてヘッダーの背景色と blur 効果を制御
 */
class HeaderController {
  #header;
  #scrollThreshold;

  /**
   * @param {string} headerSelector - ヘッダー要素のセレクター
   * @param {number} threshold - 透過度変更の閾値
   */
  constructor(headerSelector = ".header", threshold = SCROLL_CONFIG.threshold) {
    this.#header = document.querySelector(headerSelector);
    this.#scrollThreshold = threshold;
    this.#init();
  }

  // スクロールイベントの初期設定
  #init() {
    if (!this.#header) return;
    window.addEventListener("scroll", this.#handleScroll.bind(this));
  }

  // スクロール時のヘッダースタイル更新処理
  #handleScroll = () => {
    const scrollTop = window.scrollY;
    const opacity = this.#calculateOpacity(scrollTop);

    if (scrollTop > 0) {
      this.#updateHeaderStyle(opacity);
    } else {
      this.#resetHeaderStyle();
    }
  };

  // スクロール量に基づく透過度の計算
  #calculateOpacity = (scrollTop) => {
    return Math.min(
      SCROLL_CONFIG.headerOpacityMax,
      Math.max(
        SCROLL_CONFIG.headerOpacityMin,
        1 - scrollTop / this.#scrollThreshold
      )
    );
  };

  // ヘッダーのスタイルを更新
  #updateHeaderStyle = (opacity) => {
    this.#header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    this.#header.style.backdropFilter = `blur(${8 * (1 - opacity)}px)`;
    this.#header.style.webkitBackdropFilter = `blur(${8 * (1 - opacity)}px)`;
  };

  // ヘッダーのスタイルを初期状態にリセット
  #resetHeaderStyle = () => {
    this.#header.style.backgroundColor = "var(--color-background)";
    this.#header.style.backdropFilter = "none";
    this.#header.style.webkitBackdropFilter = "none";
  };
}

/**
 * スムーズスクロール機能を管理するクラス
 * アンカーリンクとトップへ戻るボタンの処理を実装
 */
class SmoothScroll {
  #headerHeight;

  constructor(headerSelector = ".header") {
    this.#headerHeight =
      document.querySelector(headerSelector)?.offsetHeight ?? 0;
    this.#init();
  }

  // 各機能の初期設定
  #init() {
    this.#setupAnchorLinks();
    this.#setupScrollTopButton();
  }

  // アンカーリンクのイベント設定
  #setupAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", this.#handleAnchorClick.bind(this));
    });
  }

  // アンカーリンククリック時の処理
  #handleAnchorClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const targetPosition = targetElement.offsetTop - this.#headerHeight;
      this.scrollToPosition(targetPosition);
    }
  };

  // 指定位置へのスムーズスクロール
  scrollToPosition(position) {
    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  }

  // トップへ戻るボタンの設定
  #setupScrollTopButton() {
    const button = this.#createScrollTopButton();
    this.#setupScrollTopButtonBehavior(button);
  }

  // トップへ戻るボタンの生成
  #createScrollTopButton() {
    const button = document.createElement("button");
    button.className = "scroll-top-button";
    button.setAttribute("aria-label", "トップへ戻る");
    button.innerHTML = "↑";
    document.body.appendChild(button);
    return button;
  }

  // トップへ戻るボタンの表示/非表示とクリック時の動作設定
  #setupScrollTopButtonBehavior(button) {
    const toggleButtonVisibility = () => {
      button.classList.toggle(
        "visible",
        window.scrollY > SCROLL_CONFIG.buttonShowThreshold
      );
    };

    window.addEventListener("scroll", toggleButtonVisibility);
    button.addEventListener("click", () => this.scrollToPosition(0));
  }
}

/**
 * アプリケーションの初期化処理
 * 各機能のインスタンス化とエラーハンドリング
 */
const initializeApp = () => {
  try {
    new HeaderController();
    new SmoothScroll();
    new MobileMenuController();
  } catch (error) {
    console.error("アプリケーションの初期化に失敗しました:", error);
  }
};

// DOMの読み込み完了時にアプリケーションを初期化
document.addEventListener("DOMContentLoaded", initializeApp);

// ハンバーガーメニューの制御
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");
  });
});

//シンプルブログ管理バージョン
class BlogPostManager {
  constructor() {
    this.posts = [];
    this.currentPost = null;
    this.init();
  }

  //初期化メソッド(データ取得、表示、検索機能の追加)
  async init() {
    try {
      await this.fetchPosts(); //データ取得を待つ
      this.renderPosts(); //データを取得後に表示
      this.addSearchFeature(); //検索機能を追加
    } catch (error) {
      console.error("初期化エラー:", error);
      this.handleError(error);
    }
  }

  // 投稿を取得するメソッド
  async fetchPosts() {
    try {
      // JSONファイルからデータを取得
      const response = await fetch("/data/posts.json");
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const data = await response.json();
      this.posts = data.posts;
    } catch (error) {
      console.error("データ取得エラー:", error);
      // エラー時のフォールバックデータ
      this.posts = [
        {
          id: 1,
          title: "エラーが発生しました",
          body: "申し訳ありません。データの読み込みに失敗しました。",
          date: new Date().toISOString(),
          author: "システム",
          category: "エラー",
        },
      ];
    }
  }

  // 投稿の表示
  renderPosts(posts = this.posts) {
    const blogContainer = document.querySelector(".blog-posts");
    if (!blogContainer) return;

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
          <time datetime="${post.date}">${new Date(
          post.date
        ).toLocaleDateString("ja-JP")}</time>
          <button class="read-more-btn" data-post-id="${
            post.id
          }">続きを読む</button>
        </div>
      </article>
    `
      )
      .join("");

    blogContainer.innerHTML = postsHTML;
  }

  // エラーハンドリング
  handleError(error) {
    const blogContainer = document.querySelector(".blog-posts");
    if (!blogContainer) return;

    blogContainer.innerHTML = `
      <div class="error-message">
        <p>データの読み込みに失敗しました。</p>
        <button onclick="location.reload()">再読み込み</button>
      </div>
    `;
  }

  //詳細表示機能追加
  setupDetailView() {
    document.querySelectorAll(".blog-posts").addEventListener("click", (e) => {
      const button = e.target.contains(".read-more-btn");
      if (!button) return;
      const postId = parseInt(e.target.dataset.postId);
      this.showPostDetail(postId);
    });
  }
  //投稿詳細表示
  async showPostDetail(postId) {
    try {
      //投稿の詳細データを取得（実際のAPIでは個別記事データを取得）
      const post = this.posts.find((p) => p.id === postId);
      if (!post) throw new Error("投稿が見つかりません");

      //コメント取得
      const commentsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${postId}/comments`
      );
      const comments = await commentsResponse.json();

      this.renderPostsDetail(post, comments);
    } catch (error) {
      console.error("詳細表示エラー", error);
    }
  }
  //詳細モーダルの表示
  renderPostsDetail(post, comments) {
    const modal = this.document.createElement("div");
    modal.className = "post-detail-modal";

    modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">閉じる</button>
      <article class="post-detail">
        <h2>${post.title}</h2>
        <div class="post-content">${post.body}</div>
        <div class="post-comments">
          <h3>コメント(${comments.length})</h3>
          ${this.renderComments(comments)}
        </div>
      </article>
    </div>
    `;

    document.body.appendChild(modal);
    this.setupModalEvents(modal);
  }
  // コメントの表示
  renderComments(comments) {
    return comments
      .map(
        (comment) => `
      <div class="comment">
        <h4>${comment.name}</h4>
        <p>${comment.body}</p>
        <small>${comment.email}</small>
      </div>
    `
      )
      .join("");
  }

  // モーダルのイベント設定
  setupModalEvents(modal) {
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // 検索機能の追加
  //要素の作成
  addSearchFeature() {
    const searchContainer = document.createElement("div");
    searchContainer.className = "blog-search";
    //HTML文字列の挿入
    searchContainer.innerHTML = `
      <input type="search" 
             id="blog-search" 
             placeholder="ブログ記事を検索..." 
             class="search-input"
      >
    `;
    //要素の挿入
    //指定した要素の前に新しい要素を追加
    const blogSection = document.querySelector("#blog");
    blogSection.insertBefore(searchContainer, blogSection.firstChild);

    // 検索イベントの設定
    //大文字小文字を区別しない実装
    const searchInput = document.getElementById("blog-search");
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.filterAndRenderPosts(searchTerm);
    });
  }

  // 投稿のフィルタリング
  filterAndRenderPosts(searchTerm) {
    const filteredPosts = this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.body.toLowerCase().includes(searchTerm)
    );

    this.renderFilteredPosts(filteredPosts);
  }

  // フィルタリングされた投稿の表示
  renderFilteredPosts(filteredPosts) {
    const blogContainer = document.querySelector(".blog-posts");
    if (!blogContainer) return;

    if (filteredPosts.length === 0) {
      blogContainer.innerHTML = `
        <div class="no-results">
          <p>検索結果が見つかりませんでした。</p>
        </div>
      `;
      return;
    }

    this.renderPosts(filteredPosts);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const blogManager = new BlogPostManager();
  blogManager.fetchPosts();
});

// お問い合わせフォームJS処理
class ContactForm {
  constructor(formId) {
    // フォーム要素を取得
    this.form = document.getElementById(formId);
    this.statusDiv = document.getElementById("submission-status");
    this.init();
  }

  // 初期化メソッド
  init() {
    // フォームの送信イベントを監視
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  //入力チェックのメソッドを追加
  validateForm() {
    //必須項目を取得
    const requiredFields = this.form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      //エラーメッセージ表示用の要素を取得
      const errorSpan = this.form.querySelector(`[data-error="${field.name}"]`);

      //入力チェック
      if (!field.value.trim()) {
        isValid = false;
        if (errorSpan) {
          errorSpan.textContent = "必須項目です";
          errorSpan.classList.add("show");
        }
      } else {
        if (errorSpan) {
          errorSpan.textContent = "";
          errorSpan.classList.remove("show");
        }
      }
    });
    return isValid;
  }

  // フォーム送信時の処理
  handleSubmit(e) {
    // デフォルトの送信動作を防ぐ
    e.preventDefault();

    //バリデーションチェック
    if (!this.validateForm()) {
      console.log("入力内容を確認してください", "error");
      return;
    }
    //フォームデータを取得
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    console.log("送信データ", data);

    //送信成功時のメッセージ
    this.showStatus("送信しました！", "success");
    this.form.reset(); //フォームをリセット
  }

  //ステータスメッセージの表示
  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `submission-status ${type}`;

    //3秒後にメッセージを消す
    setTimeout(() => {
      this.statusDiv.textContent = "";
      this.statusDiv.className = `submission-status`;
    }, 3000);
  }
}

// 使用例
document.addEventListener("DOMContentLoaded", () => {
  new ContactForm("contact-form");
});
