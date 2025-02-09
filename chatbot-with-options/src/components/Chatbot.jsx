import React, { useState, useRef, useEffect } from 'react';

// シンプルな画像リンク検出用の正規表現
// (https://～) 形式でjpg, jpeg, png, gif, webpなど拡張子のURLを検出
const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp))/gi;

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'チャットサポートへようこそ！ご質問は何でしょうか？',
      optionsLayout: 'horizontal',
      options: [
        '注文に関するご質問',
        'ポイントに関するご質問',
        'その他'
      ],
    },
  ]);
  const [userInput, setUserInput] = useState('');

  // モーダルで表示する画像URL
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // スクロール領域への参照
  const scrollRef = useRef(null);

  // メッセージが追加されるたびにスクロール位置を一番下へ
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // メッセージ文字列を解析して、画像URLをクリック可能にする
  // 通常のテキストと画像リンクを分割して表示するコンポーネント
  function RenderMessageContent({ text }) {
    // 正規表現にマッチした箇所を分割し、画像は <img> などで表示
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageUrlRegex.exec(text)) !== null) {
      // match.index から match[0] までが画像URL
      const url = match[0];
      // 画像URLが始まる前のテキストを追加
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex + '-text'}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }
      parts.push(
        <img
          key={match.index + '-img'}
          src={url}
          alt="画像"
          className="w-32 h-auto cursor-pointer border border-gray-300 rounded mb-2"
          onClick={() => openImageModal(url)}
        />
      );
      lastIndex = match.index + url.length;
    }

    // 最後の部分のテキストを追加
    if (lastIndex < text.length) {
      parts.push(
        <span key={lastIndex + '-last'}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  }

  // 画像をクリックした時にモーダルを開く
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
  };

  // モーダルを閉じる
  const closeImageModal = () => {
    setSelectedImageUrl(null);
  };

  // 選択肢がクリックされた時の処理
  const handleOptionClick = (option) => {
    // ユーザーの選択内容をメッセージとして追加
    setMessages((prev) => [...prev, { role: 'user', content: option }]);

    // 一時的に「回答を生成中...」メッセージを挿入
    setMessages((prev) => [...prev, { role: 'assistant', content: '回答を生成中...' }]);

    // 選択内容に応じた次のメッセージ（本来はAI連携で決定）
    setTimeout(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop(); // remove '回答を生成中...'

        // 仮の応答ロジック
        if (option === '注文に関するご質問') {
          newMessages.push({
            role: 'assistant',
            content: '注文に関するご質問ですね。以下の中から選択してください。',
            optionsLayout: 'vertical',
            options: ['商品の検索', 'カート・購入手続き', 'キャンセル・変更', 'その他']
          });
        } else if (option === 'ポイントに関するご質問') {
          newMessages.push({
            role: 'assistant',
            content: 'ポイントに関するご質問ですね。以下の中から選択してください。',
            optionsLayout: 'horizontal',
            options: ['ポイントの確認方法', 'ポイントの有効期限', 'ポイントの使い方', 'その他']
          });
        } else if (option === 'その他') {
          newMessages.push({
            role: 'assistant',
            content: 'どのような内容でしょうか？入力欄にご記入ください。',
          });
        } else {
          // 次の選択肢を持たない追加オプションの例
          newMessages.push({
            role: 'assistant',
            content: `「${option}」ですね。さらに詳しい内容を入力してください。`,
          });
        }

        return newMessages;
      });
    }, 1000);
  };

  // テキスト入力からの送信ボタンが押された時の処理
  const handleSend = () => {
    if (!userInput.trim()) return;

    // ユーザーのメッセージを追加
    setMessages((prev) => [...prev, { role: 'user', content: userInput }]);

    // 入力欄をクリア
    setUserInput('');

    // 一時的なメッセージ
    setMessages((prev) => [...prev, { role: 'assistant', content: '回答を生成中...' }]);

    // 実際にはAI連携などの処理を行う
    setTimeout(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop(); // remove temporary message

        // ダミー応答（例：画像URLを返す）
        newMessages.push({
          role: 'assistant',
          content: '承知しました。詳しく確認して回答いたします。\nサンプル画像URL: https://sample-img-url/test.jpg\n他に質問はありますか？',
        });
        return newMessages;
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg mx-auto h-[calc(100vh-4rem)] flex flex-col rounded-2xl bg-gray-50 shadow relative">
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">チャットボット</h1>
      </div>

      {/* メッセージ一覧を表示するスクロール領域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          // roleに応じて左右に振り分け
          <div
            key={idx}
            className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`flex flex-col p-2 rounded-2xl whitespace-pre-wrap mb-2 max-w-sm text-lg ${
                msg.role === 'assistant' ? 'bg-purple-100 text-left' : 'bg-blue-100 text-right'
              }`}
            >
              {/* メッセージ内のテキスト・画像URLを分割して表示 */}
              <div className="mb-2">
                <RenderMessageContent text={msg.content} />
              </div>

              {/* msg.optionsがあれば選択肢を表示。optionsLayoutで縦横を切り替え */}
              {msg.options && (
                <div
                  className={
                    msg.optionsLayout === 'vertical'
                      ? 'flex flex-col gap-2'
                      : 'flex flex-row flex-wrap gap-2'
                  }
                >
                  {msg.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      className="px-4 py-2 bg-white rounded-full border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 入力欄を常に下部に固定して表示する領域 */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex">
          <input
            className="w-full border border-gray-300 p-2 rounded-l-2xl focus:outline-none"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="ご質問を入力してください..."
          />
          <button
            className="bg-purple-600 text-white px-4 rounded-r-2xl"
            onClick={handleSend}
          >
            送信
          </button>
        </div>
      </div>

      {/* 画像モーダル */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-xl shadow-lg max-w-xl">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <img src={selectedImageUrl} alt="enlarged" className="max-w-full h-auto rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
