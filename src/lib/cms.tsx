import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { loadCMSContent, saveCMSContent, type CMSContent } from '@/lib/cms';

export default function AdminCMS() {
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const data = await loadCMSContent();
    setContent(data);
    setLoading(false);
  }

  async function saveHero() {
    setSaving(true);
    await saveCMSContent('hero.title', content!.hero.title);
    await saveCMSContent('hero.subtitle', content!.hero.subtitle);
    if (content!.hero.backgroundImage) {
      await saveCMSContent('hero.image', content!.hero.backgroundImage);
    }
    setSaving(false);
    alert('✅ Hero Bereich gespeichert!');
  }

  async function saveFooter() {
    setSaving(true);
    await saveCMSContent('footer.text', content!.footer.text);
    setSaving(false);
    alert('✅ Footer gespeichert!');
  }

  if (loading) return <div className="p-8 text-center">Laden...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📝 CMS - Texte & Bilder verwalten</h1>
      
      {/* Hero Bereich */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">🏔️ Hero Bereich</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Hero Titel</label>
          <input
            type="text"
            value={content.hero.title}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Hero Untertitel</label>
          <textarea
            value={content.hero.subtitle}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
            className="w-full p-2 border rounded"
            rows={2}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Hero Bild-URL</label>
          <input
            type="text"
            value={content.hero.backgroundImage}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })}
            className="w-full p-2 border rounded"
            placeholder="https://...jpg"
          />
          {content.hero.backgroundImage && (
            <img src={content.hero.backgroundImage} alt="Preview" className="mt-2 h-32 object-cover rounded" />
          )}
        </div>
        
        <button onClick={saveHero} disabled={saving} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
          {saving ? 'Speichert...' : '💾 Hero speichern'}
        </button>
      </div>
      
      {/* Bilder hochladen */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">🖼️ Bilder hochladen</h2>
        <ImageUploader 
          onUpload={(url) => {
            setContent({ ...content, hero: { ...content.hero, backgroundImage: url } });
          }}
        />
      </div>
      
      {/* Footer */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">📄 Footer</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Footer Text</label>
          <input
            type="text"
            value={content.footer.text}
            onChange={(e) => setContent({ ...content, footer: { text: e.target.value } })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button onClick={saveFooter} disabled={saving} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
          {saving ? 'Speichert...' : '💾 Footer speichern'}
        </button>
      </div>
    </div>
  );
}

// Bild-Upload Komponente
function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('cms-images')
      .upload(filename, file);

    if (error) {
      alert('Fehler beim Hochladen: ' + error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('cms-images')
        .getPublicUrl(filename);
      onUpload(publicUrl);
      alert('✅ Bild hochgeladen!');
    }
    setUploading(false);
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
      {uploading && <p className="text-sm text-gray-500 mt-2">Lade hoch...</p>}
    </div>
  );
        }
