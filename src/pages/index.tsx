import styles from '@/styles/Home.module.css';
import { useRef, useState } from 'react';

export default function Home() {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    setParagraphs(lines);
    setIsCompleted(false);
    setCurrentIndex(0);
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
      const response = await fetch('/api/save-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (response.ok) {
        setSelectedText('');
        if (currentIndex === paragraphs.length - 1) {
          setIsCompleted(true);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }
    } catch (error) {
      alert('Error saving selection');
    }
  };

  const handleSkip = () => {
    setSelectedText('');
    if (currentIndex === paragraphs.length - 1) {
      setIsCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsCompleted(false);
    setParagraphs([]);
    setCurrentIndex(0);
    setSelectedText('');
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.container}>
        <div className={styles.completedSection}>
          <h1>🎉 You've finished all paragraphs! 🎉</h1>
          <button onClick={handleReset} className={styles.button}>
            Start New File
          </button>
        </div>
      </div>
    );
  }

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
          
          <div 
            className={styles.paragraph}
            onMouseUp={handleSelection}
          >
            {paragraphs[currentIndex]}
          </div>

          <div className={styles.selection}>
            Selected text: {selectedText && <span className={styles.highlighted}>{selectedText}</span>}
          </div>

          <div className={styles.controls}>
            <button
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className={styles.button}
            >
              Previous
            </button>
            <button
              onClick={handleSkip}
              className={`${styles.button} ${styles.skipButton}`}
            >
              Skip
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