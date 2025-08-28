// src/pages/Add.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const isValidUrl = (url) => {
  try {
    if (!url) return true; // 空文字列は有効とみなす
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
export default function Add() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [note, setNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [links, setLinks] = useState([
    { name: "", url: "" },
    { name: "", url: "" },
    { name: "", url: "" },
  ]);
  const [urlErrors, setUrlErrors] = useState(["", "", ""]);
  const [isValid, setIsValid] = useState(false);
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;

    if (field === "url") {
      const isValid = isValidUrl(value);
      const newUrlErrors = [...urlErrors];
      newUrlErrors[index] = isValid ? "" : "誤ったURL";
      setUrlErrors(newUrlErrors);
    }
    setLinks(updatedLinks);
  };

  useEffect(() => {
    const newUrlErrors = links.map((link) =>
      isValidUrl(link.url) ? "" : "誤ったURL"
    );
    setUrlErrors(newUrlErrors);

    // すべてのエラーがなく、かつ必須項目が入力されていれば isValid を true にする
    const noUrlErrors = newUrlErrors.every((error) => !error);
    const isTitleValid = title.trim() !== ""; // タイトルが空でないか
    setIsValid(noUrlErrors && isTitleValid);
  }, [links, title, artist]);

  // 過去のタグを読み込む
  useEffect(() => {
    const grooves = JSON.parse(localStorage.getItem("grooves")) || [];
    const allTags = grooves.flatMap((g) => g.tags || []);
    const uniqueTags = [...new Set(allTags)];
    setExistingTags(uniqueTags);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newGroove = {
      id: uuidv4(),
      title,
      artist,
      note,
      tags,
      date: new Date().toISOString(),
      progress: 1,
      links, // ← 追加！
    };

    const existingGrooves = JSON.parse(localStorage.getItem("grooves")) || [];
    const updatedGrooves = [...existingGrooves, newGroove];
    localStorage.setItem("grooves", JSON.stringify(updatedGrooves));

    setTitle("");
    setArtist("");
    setNote("");
    setTags([]);
    setTagInput("");
    setLinks([
      { name: "", url: "" },
      { name: "", url: "" },
      { name: "", url: "" },
    ]);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSelectExistingTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handledelete = (index) => {
    const updatedLinks = links.map((link, i) =>
      i === index ? { name: "", url: "" } : link
    );

    setLinks(updatedLinks);
  };
  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex items-center">
        <span className="material-icons Addicon mr-2 ">post_add</span>
        <h1 className="text-2xl font-bold mb-2 mt-2">グルーヴ追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 曲名とアーティストを横並びにする */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mt-4">曲名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent"
              placeholder="必須"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mt-4">
              アーティスト
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium mt-4">メモ</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent"
            rows="1"
          ></textarea>
        </div>

        {/* タグ入力と選択済みタグを横並びにする */}
        <div>
          <label className="block text-sm font-medium mt-6">タグ</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent"
                  placeholder="タグ名を入力"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-800 text-white w-3 h-3 disabled:bg-gray-300"
                  disabled={!tagInput.trim()}
                  style={{ minWidth: "23px", minHeight: "23px" }}
                  aria-label="タグ追加"
                >
                  <span className="material-icons text-base">add</span>
                </button>
              </div>
            </div>
            {/* 選択中タグ */}
            <div className="flex flex-wrap mt-1 gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 rounded text-sm py-1 px-2 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ✕
                </span>
              ))}
            </div>
          </div>

          {/* 既存タグから選択 */}
          {existingTags.length > 0 && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-600">
                既存のタグから選択:
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleSelectExistingTag(tag)}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm cursor-pointer hover:bg-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <label className="block text-sm font-medium mt-4">リンク</label>
          {/* リンク入力を Grid で横並びにする */}
          {links.map((link, index) => (
            <div key={index} className="flex items-center mb-4">
              <input
                type="text"
                placeholder={`リンク${index + 1}名`}
                value={link.name}
                onChange={(e) =>
                  handleLinkChange(index, "name", e.target.value)
                }
                className="mr-2 mb-3 p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent" // flex-grow で input を拡張
              />
              {/* アイコンをここに追加 */}
              <span className="material-icons mb-3">link</span>
              <input
                type="text"
                placeholder={`リンク${index + 1}URL`}
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className="ml-2 mb-3 p-2 flex items-center border-b border-gray-500 focus:border-indigo-500 py-1 px-2 appearance-none focus:outline-none bg-transparent" // flex-grow で input を拡張
              />
              <span
                className="material-icons mb-3 ml-3 add cursor-pointer"
                onClick={() => handledelete(index)}
              >
                delete
              </span>
              {urlErrors[index] && (
                <p className="text-red-500 text-sm mb-3 ml-2">
                  {urlErrors[index]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 追加ボタン */}
        <button
          type="submit"
          className={`bg-blue-500 text-white font-semibold px-4 py-2 rounded transition-colors duration-200 ${
            isValid
              ? "hover:bg-blue-600"
              : "opacity-50 cursor-not-allowed bg-gray-400"
          }`}
          disabled={!isValid}
        >
          追加する
        </button>
      </form>

      {/* 戻るリンク */}
      <div className="mt-6 flex items-center">
        <span className="material-icons last_page mr-1 mb-4">first_page</span>
        <Link
          to="/react-app/"
          className="mb-4 text-indigo-500 hover:text-indigo-400 text-base font-semibold cursor-pointer"
        >
          一覧に戻る
        </Link>
      </div>
    </div>
  );
}
