import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [grooves, setGrooves] = useState([]);
  const [displayedGrooves, setDisplayedGrooves] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [note, setText] = useState(" ");
  const [selectedTag, setSelectedTag] = useState(null); // ← 現在の選択タグ
  const [allTags, setAllTags] = useState([]); // 全タグリスト

  useEffect(() => {
    const stored = localStorage.getItem("grooves");
    const set = localStorage.getItem("note");
    const savedTag = localStorage.getItem("selectedTag");
    if (stored) {
      const parsed = JSON.parse(stored);
      setGrooves(parsed);
      setDisplayedGrooves(parsed);

      // タグ一覧を抽出
      const tagsSet = new Set();
      parsed.forEach((g) => g.tags?.forEach((t) => tagsSet.add(t)));
      setAllTags([...tagsSet]);
    }

    const savedFilter = localStorage.getItem("showOnlyIncomplete");
    if (savedFilter !== null) {
      setShowOnlyIncomplete(savedFilter === "true");
    }

    if (savedTag) {
      setSelectedTag(savedTag);
    } else {
      setSelectedTag(null); // ← 空文字ではなく null に統一
    }

    if (set !== null) {
      setText(set);
    } else {
      setText("");
    }
  }, []);

  const handleDelete = (id) => {
    var result = window.confirm("本当に削除しますか？");
    if (result) {
      const updated = grooves.filter((g) => g.id !== id);
      setGrooves(updated);
      localStorage.setItem("grooves", JSON.stringify(updated));
    }
  };

  const navigate = useNavigate();

  const handleEdit = (id) => {
    const groove = grooves.find((g) => g.id === id);
    navigate("edit", { state: { id, data: groove } });
  };

  const handleProgressChange = (id, newProgress) => {
    const updatedGrooves = grooves.map((g) =>
      g.id === id ? { ...g, progress: newProgress } : g
    );
    setGrooves(updatedGrooves);
    localStorage.setItem("grooves", JSON.stringify(updatedGrooves));

    // フィルター＋並び替えが有効なら再計算
    const filtered = updatedGrooves.filter((g) =>
      g.title.toLowerCase().includes(filterText.toLowerCase())
    );
    setDisplayedGrooves(filtered); // ← ここで再描画
  };

  const sortByComplete = () => {
    const sorted = [...grooves].sort((a, b) => {
      const aComplete = a.progress === 5;
      const bComplete = b.progress === 5;
      return aComplete - bComplete;
    });

    setGrooves(sorted); // ← ここがポイント！
    localStorage.setItem("grooves", JSON.stringify(sorted)); // 永続化もする
  };

  useEffect(() => {
    let filtered = grooves.filter(
      (g) =>
        (g.title.toLowerCase().includes(filterText.toLowerCase()) ||
          g.artist.toLowerCase().includes(filterText.toLowerCase())) &&
        (!selectedTag || g.tags?.includes(selectedTag))
    );

    if (showOnlyIncomplete) {
      filtered = filtered.filter((g) => g.progress !== 5);
    }

    setDisplayedGrooves(filtered);
  }, [grooves, filterText, showOnlyIncomplete, selectedTag]);

  const handleAdd = () => {
    if (note !== "") {
      alert("保存しました！");
      localStorage.setItem("note", note);
    }
  };

  const handledelete = () => {
    if (note !== "") {
      var result = window.confirm("本当に削除しますか？");
      if (result) {
        localStorage.setItem("note", "");
        setText("");
      }
    }
  };

  // エクスポート機能
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(grooves, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const filename = "grooves.json";
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [grooves]); // grooves を依存配列に追加

  // インポート機能
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json)) {
            localStorage.setItem("grooves", JSON.stringify(json));
            window.location.reload();
          } else {
            alert(
              "無効なファイル形式です。JSON配列をアップロードしてください。"
            );
          }
        } catch {
          alert("JSONファイルのパース中にエラーが発生しました。");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        handleExport();
      } else if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        handleImport();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleExport, handleImport]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">グルーヴ一覧</h1>
      <div className="flex items-center">
        <span className="material-icons last_page ml-1 mt-0.4">last_page</span>
        <Link
          to="add"
          className="text-blue-600 font-semibold cursor-pointer ml-1"
        >
          新しいグルーヴを追加
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {/* 検索バー */}
        <div className="flex items-center gap-2">
          <span className="material-icons">search</span>
          <input
            type="text"
            placeholder="検索..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-53 flex-grow border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent"
          />
        </div>

        {/* 並び替えボタン */}
        <button
          onClick={sortByComplete}
          className="ml-2 bg-slate-300 hover:bg-slate-400 text-gray-800 font-bold py-1 px-3 rounded inline-flex items-center"
        >
          並び替え
        </button>

        {/* 未完了/すべて表示ボタン */}
        <button
          onClick={() => {
            const newValue = !showOnlyIncomplete;
            setShowOnlyIncomplete(newValue);
            localStorage.setItem("showOnlyIncomplete", newValue);
          }}
          className="bg-slate-300 hover:bg-slate-400 text-gray-800 font-bold py-1 px-3 rounded inline-flex items-center"
        >
          {showOnlyIncomplete ? "すべて表示" : "未完了のみ"}
        </button>

        {/* タグ選択 */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTag || ""}
            onChange={(e) => {
              const value = e.target.value || null;
              setSelectedTag(value);
              localStorage.setItem("selectedTag", value || ""); // ← 空文字を保存
            }}
            className="border rounded px-2 py-1 bg-slate-200 inline-flex items-center"
          >
            <option value="">タグ：全て表示</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                タグ：#{tag}
              </option>
            ))}
          </select>
        </div>

        {/* 目標設定 */}
        <div className="flex items-center gap-2 ml-auto ">
          {" "}
          {/* flex-grow を削除し、w-48 を追加 */}
          <span className="material-icons">flag</span>
          <div className="flex items-center border-b border-gray-500 py-1">
            {" "}
            {/* flex-grow を削除 */}
            <input
              className="sm:w-95 w-53 appearance-none bg-transparent border-none text-gray-700 mr-1 py-1 px-2 leading-tight focus:outline-none focus:border-green-800" // flex-grow を削除
              type="text"
              placeholder="簡単に目標を設定できます"
              onChange={(e) => setText(e.target.value)}
              value={note}
            />
            <span
              className="material-icons cursor-pointer add mr-1"
              onClick={handleAdd}
            >
              add_circle
            </span>
            <span
              className="material-icons cursor-pointer add mr-1"
              onClick={handledelete}
            >
              delete
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {grooves.length === 0 && (
          <p className="text-gray-500">まだグルーヴがありません。</p>
        )}
        {displayedGrooves.map((groove) => (
          <div
            key={groove.id}
            className="bg-white shadow-lg rounded-2xl p-4 flex-grow w-full md:w-auto md:max-w-90"
          >
            <h2 className="text-xl font-semibold">{groove.title}</h2>
            <p className="text-gray-500">アーティスト：{groove.artist}</p>

            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleProgressChange(groove.id, level)}
                  className={`w-6 h-6 rounded-full text-xs font-bold ${
                    groove.progress >= level
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {level}
                </button>
              ))}
              <div
                className={`min-w-[80px] mt-2 p-1 rounded text-xs font-semibold inline-block ${
                  groove.progress === 5 ? "text-green-500" : "text-gray-700"
                }`}
              >
                {groove.progress === 5
                  ? "完了！"
                  : `進行度：${groove.progress} / 5`}
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-400 whitespace-pre-wrap">
              メモ：{groove.note}
            </p>
            <div className="flex flex-wrap mt-1">
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                リンク：
              </p>
              {groove.links
                ?.filter((link) => link.url)
                .map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline block mr-3"
                  >
                    <span className="material-icons link">open_in_new</span>
                    {link.name || `リンク${index + 1}`}
                  </a>
                ))}
            </div>
            <div className="flex justify-between">
              <div className="flex">
                <button
                  onClick={() => handleEdit(groove.id)}
                  className="mt-1 mr-2 text-sm text-blue-500 cursor-pointer hover:text-blue-400"
                >
                  edit
                </button>
                <button
                  onClick={() => handleDelete(groove.id)}
                  className="mt-1 mr-0 text-sm text-red-500 cursor-pointer hover:text-red-400"
                >
                  delete
                </button>
              </div>
              <b className="text-xs font-normal !text-gray-400 mt-2">
                {new Date(groove.date).toLocaleString()}
              </b>
            </div>
            {groove.tags && groove.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {groove.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-gray-600 text-xs font-semibold rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
