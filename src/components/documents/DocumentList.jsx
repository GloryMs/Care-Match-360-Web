// src/components/documents/DocumentList.jsx
// Reusable document list used by both PatientProfilePage and ProviderProfilePage.
// Supports inline preview (images / PDFs) and forced download via the new
// FileDownloadController endpoints.

import { useState } from 'react';
import { FileText, ImageIcon, Film, Download, Eye, Trash2, Loader2, X } from 'lucide-react';
import { fileAPI } from '../../api/profileService';

// ─────────────────────────────────────────────────────────────────────────────
// Icon helpers
// ─────────────────────────────────────────────────────────────────────────────
function FileIcon({ mimeType, size = 16 }) {
  if (mimeType?.startsWith('image/'))  return <ImageIcon  size={size} />;
  if (mimeType?.startsWith('video/'))  return <Film       size={size} />;
  return                                       <FileText  size={size} />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  return                          `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview modal — shows images and PDFs inline
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
  const viewUrl = fileAPI.buildViewUrl(doc.fileUrl);
  const isImage = doc.mimeType?.startsWith('image/');
  const isPdf   = doc.mimeType === 'application/pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
            {doc.fileName}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
          {isImage && (
            <img
              src={viewUrl}
              alt={doc.fileName}
              className="w-full h-auto object-contain"
            />
          )}
          {isPdf && (
            <iframe
              src={viewUrl}
              title={doc.fileName}
              className="w-full"
              style={{ height: '75vh', border: 'none' }}
            />
          )}
          {!isImage && !isPdf && (
            <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>
              <FileText size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Preview not available for this file type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object[]} documents   - DocumentResponse array from API
 * @param {Function} onDelete    - (docId: string) => void  called after server delete succeeds
 * @param {Function} deleteDoc   - (docId: string) => Promise  the actual API call
 * @param {boolean}  loading     - show skeleton while fetching
 */
export default function DocumentList({ documents = [], onDelete, deleteDoc, loading = false }) {
  const [downloading, setDownloading] = useState(null);   // docId being downloaded
  const [deleting,    setDeleting   ] = useState(null);   // docId being deleted
  const [preview,     setPreview    ] = useState(null);   // DocumentResponse to preview

  // ── Download ────────────────────────────────────────────────────────────
  const handleDownload = async (doc) => {
    setDownloading(doc.id);
    try {
      const res = await fileAPI.downloadByUrl(doc.fileUrl);
      const blob = new Blob([res.data], { type: doc.mimeType || 'application/octet-stream' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = doc.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  // ── Preview ─────────────────────────────────────────────────────────────
  const canPreview = (doc) =>
    doc.mimeType?.startsWith('image/') || doc.mimeType === 'application/pdf';

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.fileName}"?`)) return;
    setDeleting(doc.id);
    try {
      await deleteDoc(doc.id);
      onDelete?.(doc.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface-alt)' }} />
        ))}
      </div>
    );
  }

  if (!documents.length) {
    return (
      <p className="text-sm mt-3" style={{ color: 'var(--text-faint)' }}>
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Left — icon + info */}
            <div className="flex items-center gap-2 min-w-0">
              <span style={{ color: 'var(--primary-600)', flexShrink: 0 }}>
                <FileIcon mimeType={doc.mimeType} size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                  {doc.fileName}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {doc.documentType?.replace(/_/g, ' ')}
                  {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
                </p>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {/* Preview (only for images / PDFs) */}
              {canPreview(doc) && (
                <button
                  type="button"
                  title="Preview"
                  onClick={() => setPreview(doc)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                >
                  <Eye size={14} style={{ color: '#3b82f6' }} />
                </button>
              )}

              {/* Download */}
              <button
                type="button"
                title="Download"
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
                className="p-1.5 rounded-lg transition-colors hover:bg-green-50 disabled:opacity-50"
              >
                {downloading === doc.id
                  ? <Loader2 size={14} className="animate-spin" style={{ color: '#16a34a' }} />
                  : <Download size={14} style={{ color: '#16a34a' }} />}
              </button>

              {/* Delete */}
              <button
                type="button"
                title="Delete"
                onClick={() => handleDelete(doc)}
                disabled={deleting === doc.id}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {deleting === doc.id
                  ? <Loader2 size={14} className="animate-spin" style={{ color: '#ef4444' }} />
                  : <Trash2 size={14} style={{ color: '#ef4444' }} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && <PreviewModal doc={preview} onClose={() => setPreview(null)} />}
    </>
  );
}