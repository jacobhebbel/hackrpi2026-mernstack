import { useEffect, useState } from 'react';
import './App.css';

const MIN_ID = 1;
const MAX_ID = 124;

type FoxPhoto = {
  id: number;
  url: string;
};

type View = 'gallery' | 'saved';

function App() {
  const [imageId, setImageId] = useState<number>(1);
  const [photo, setPhoto] = useState<FoxPhoto | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [view, setView] = useState<View>('gallery');
  const [savedPhotos, setSavedPhotos] = useState<FoxPhoto[]>([]);
  const [savedLoading, setSavedLoading] = useState<boolean>(false);
  const [savedError, setSavedError] = useState<string>('');

  useEffect(() => {
    const loadPhoto = async () => {
      const res = await fetch(`/images/${imageId}`);
      const data = (await res.json()) as FoxPhoto;
      setPhoto(data);
    };
    loadPhoto();
  }, [imageId]);

  useEffect(() => {
    if (view !== 'saved') return;

    const loadSaved = async () => {
      setSavedLoading(true);
      setSavedError('');
      try {
        const res = await fetch('/saved');
        if (!res.ok) throw new Error('Failed to fetch saved images');
        const data = (await res.json()) as FoxPhoto[];
        setSavedPhotos(Array.isArray(data) ? data : []);
      } catch {
        setSavedError('Could not load saved images.');
      } finally {
        setSavedLoading(false);
      }
    };

    loadSaved();
  }, [view]);

  const nextImage = () =>
    setImageId((id) => (id >= MAX_ID ? MIN_ID : id + 1));

  const prevImage = () =>
    setImageId((id) => (id <= MIN_ID ? MAX_ID : id - 1));

  const saveImage = async () => {
    try {
      const res = await fetch('/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });
      if (res.ok) setSaveMessage(`Saved fox #${imageId}!`);
      else setSaveMessage('Could not save that image.');
    } catch {
      setSaveMessage('Could not save that image.');
    }
  };

  const removeSavedImage = async (id: number) => {
    try {
      const res = await fetch(`/saved/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedPhotos((prev) => prev.filter((saved) => saved.id !== id));
      }
    } catch {
      setSavedError('Could not remove that image.');
    }
  };

  const goToGallery = () => setView('gallery');
  const goToSaved = () => setView('saved');

  const savedHeading =
    savedPhotos.length === 1 ? 'Saved image' : 'Saved images';

  return (
    <div className="app">
      <header className="banner">
        <h1>Fox Images</h1>
        <nav className="tabs">
          <button
            type="button"
            className={view === 'gallery' ? 'tab-btn active' : 'tab-btn'}
            onClick={goToGallery}
          >
            Gallery
          </button>
          <button
            type="button"
            className={view === 'saved' ? 'tab-btn active' : 'tab-btn'}
            onClick={goToSaved}
          >
            Saved{savedPhotos.length > 0 ? ` (${savedPhotos.length})` : ''}
          </button>
        </nav>
      </header>

      {view === 'gallery' ? (
        <main className="viewer">
          <button
            type="button"
            className="nav-btn"
            onClick={prevImage}
            aria-label="Previous image"
          >
            ←
          </button>

          <div className="stage">
            <div className="frame">
              {photo ? (
                <img src={photo.url} alt={`Fox #${photo.id}`} />
              ) : (
                <div className="frame-placeholder">Loading…</div>
              )}
            </div>

            <button type="button" className="save-btn" onClick={saveImage}>
              Save Image
            </button>
          </div>

          <button
            type="button"
            className="nav-btn"
            onClick={nextImage}
            aria-label="Next image"
          >
            →
          </button>
        </main>
      ) : (
        <main className="saved-page">
          {savedLoading ? (
            <p className="saved-status">Loading saved images…</p>
          ) : savedError ? (
            <div className="saved-status">
              <p>{savedError}</p>
              <button type="button" className="tab-btn" onClick={goToSaved}>
                Retry
              </button>
            </div>
          ) : savedPhotos.length === 0 ? (
            <div className="saved-status">
              <p>You have no saved images yet.</p>
              <button type="button" className="tab-btn" onClick={goToGallery}>
                Find a fox to save
              </button>
            </div>
          ) : (
            <>
              <h2 className="saved-heading">{savedHeading}</h2>
              <div className="saved-grid">
                {savedPhotos.map((saved) => (
                  <div className="saved-card" key={saved.id}>
                    <img src={saved.url} alt={`Fox #${saved.id}`} />
                    <div className="saved-card-footer">
                      <span className="saved-id">Fox #{saved.id}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeSavedImage(saved.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {view === 'gallery' && saveMessage && <p className="save-msg">{saveMessage}</p>}
    </div>
  );
}

export default App;
