import styles from "@/styles/Home.module.css";
import { useRef, useState } from "react";

export default function Home() {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    setParagraphs(lines);
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection) return;
    setSelectedText(selection.toString());
  };

  const handleConfirm = async () => {
    if (!selectedText || !paragraphs[currentIndex]) return;

    const entry = {
      original_text: paragraphs[currentIndex],
      highlighted_text: selectedText
    };

    try {
      const response = await fetch("/api/save-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });

      if (response.ok) {
        setSelectedText("");
        setCurrentIndex((prev) => Math.min(prev + 1, paragraphs.length - 1));
      }
    } catch (error) {
      alert("Error saving selection");
    }
  };

  return (
    <div className={styles.container}>
      {paragraphs.length === 0 ? (
        <div className={styles.uploadSection}>
          <h1>Text Selection Tool</h1>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            ref={fileInput}
            className={styles.fileInput}
          />
        </div>
      ) : (
        <div className={styles.reviewSection}>
          <div className={styles.progress}>
            Paragraph {currentIndex + 1} of {paragraphs.length}
          </div>

          <div className={styles.paragraph} onMouseUp={handleSelection}>
            {paragraphs[currentIndex]}
          </div>

          <div className={styles.selection}>
            Selected text:{" "}
            {selectedText && (
              <span className={styles.highlighted}>{selectedText}</span>
            )}
          </div>

          <div className={styles.controls}>
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className={styles.button}
            >
              Previous
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedText}
              className={styles.button}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
