import { useEffect, useState } from "react";

export function FileUpload({
  sessionId,
  questionId,
  onUploaded
}: {
  sessionId: string;
  questionId: string;
  onUploaded: (fileInfo: { id: string; filename: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    formData.append("questionId", questionId);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const payload = await response.json();
      onUploaded(payload);
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-mist/60 p-4">
      <input
        type="file"
        accept=".pdf,.docx,.png,.jpg,.jpeg"
        onChange={handleChange}
        className="text-sm"
      />
      <p className="helper mt-2">PDF, DOCX, PNG, JPG accepted. Files upload to local storage in dev.</p>
      {uploading && <p className="helper mt-2 text-tide">Uploading…</p>}
      {error && <p className="helper mt-2 text-red-600">{error}</p>}
    </div>
  );
}
