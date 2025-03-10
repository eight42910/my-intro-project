// アロー関数と配列メソッド
const arrayPractice = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // map, filter, reduce の練習
  const tripled = numbers.map((num) => num * 3);
  // 偶数のみ
  const evenNumbers = numbers.filter((num) => num % 2 === 0);
  // 奇数のみ
  const oddNumbers = numbers.filter((num) => num % 2 !== 0);
  // 合計
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);

  // 分割代入とスプレッド構文
  const [first, second, ...rest] = numbers;
  const combined = [...numbers, 6, 7];

  // 結果の表示
  const result = document.getElementById("arrayResult");
  result.innerHTML = `
        元の配列: ${numbers}<br>
        3倍: ${tripled}<br>
        偶数のみ: ${evenNumbers}<br>
        奇数のみ: ${oddNumbers}<br>
        合計: ${sum}<br>
        分割代入: first=${first}, second=${second} rest=${rest}<br>
        結合: ${combined}
    `;
};

// オブジェクトの操作
const objectPractice = () => {
  // オブジェクトの基本
  const human = {
    name: "山田太郎",
    age: 25,
    city: "東京",
  };

  // 分割代入
  const { name, age } = human;

  // オブジェクトのスプレッド構文
  const updatedPerson = {
    ...human,
    age: 26,
    occupation: "エンジニア",
  };

  // テンプレートリテラル
  const result = document.getElementById("objectResult");
  result.innerHTML = `
        元のオブジェクト: ${JSON.stringify(human)}<br>
        分割代入: name=${name}, age=${age}<br>
        更新後: ${JSON.stringify(updatedPerson)}
    `;
};

// 非同期処理
const asyncPractice = async () => {
  const result = document.getElementById("asyncResult");
  result.innerHTML = "処理中...";

  try {
    // Promise の練習
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // async/await の練習
    await delay(1000);
    result.innerHTML = "メッセージを送信する";

    await delay(1000);
    result.innerHTML = "送信中";

    // fetch API の練習（JSONPlaceholderを使用）
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    const data = await response.json();

    result.innerHTML = `
            非同期処理完了!<br>
            取得したデータ: ${JSON.stringify(data)}
        `;
  } catch (error) {
    result.innerHTML = `エラーが発生しました: ${error.message}`;
  }
};

// イベントリスナーの設定
document.getElementById("arrayButton").addEventListener("click", arrayPractice);
document
  .getElementById("objectButton")
  .addEventListener("click", objectPractice);
document.getElementById("asyncButton").addEventListener("click", asyncPractice);

// クラスの練習
class Counter {
  #count = 0; // プライベートフィールド

  increment() {
    this.#count++;
    return this.#count;
  }

  get value() {
    return this.#count;
  }
}

// モジュールの練習はコメントで説明
/*
// module.js
export const helper = () => {
    return 'Helper Function';
};

// main.js
import { helper } from './module.js';
*/
