import Image from "next/image";

export interface FileFolderIconProps {
  size?: number;
  className?: string;
  isSelected?: boolean;
}

export function FolderIcon({ size = 24, className = "" }: FileFolderIconProps) {
  const width = Math.round(size * 1.25);
  const height = size;

  return (
    <Image
      src="/folder-icon.png"
      alt="Folder"
      width={width}
      height={height}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function FileIcon({ size = 26, className = "" }: FileFolderIconProps) {
  return (
    <Image
      src="/filicon.png"
      alt="File"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
