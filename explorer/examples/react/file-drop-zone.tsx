import { useState } from 'react';
import { FileDropZone } from '@mosaic-home/design-system/react';
import { formatFileSize } from '@mosaic-home/design-system/web';

export function FileDropZoneExample() {
  const [files, setFiles] = useState<File[]>([]);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return (
    <>
      {/* Files that are too big, of the wrong type or too many are refused with a message in the zone. */}
      <FileDropZone
        title="Drop floor plans here"
        hint="PNG, JPG or WebP, up to 5 MB each, up to 4 files"
        accept="image/png,image/jpeg,image/webp"
        maxSize={5_000_000}
        maxFiles={4}
        onChange={setFiles}
      />
      {files.length > 0 && <p>{`${files.length} ready to upload, ${formatFileSize(total)}.`}</p>}
    </>
  );
}
