'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NotesPage() {
  const params = useParams();
  const supabase = createClient();
  const [notes, setNotes] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const loadNotes = () => {
    supabase.from('practitioner_notes').select('*').eq('assessment_id', params.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []));
  };

  useEffect(() => { loadNotes(); }, [params.id]);

  const addNote = async () => {
    if (!content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('practitioner_notes').insert({
      assessment_id: params.id, practitioner_id: user?.id,
      content: content.trim(), is_private: isPrivate,
    });
    setContent('');
    loadNotes();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Practitioner Notes</h1>
      
      <div className="space-y-3">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..." className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-700" />
            Private (client cannot see)
          </label>
          <button onClick={addNote} className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-white hover:bg-amber-800">Add Note</button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.map((n: any) => (
          <div key={n.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${n.is_private ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {n.is_private ? 'Private' : 'Shared'}
              </span>
              <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No notes yet</p>}
      </div>
    </div>
  );
}
