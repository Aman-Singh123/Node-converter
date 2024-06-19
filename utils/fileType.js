const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/heic',
    'image / heif',
    'image/webp',
    'image/gif',
    'image/tiff',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'text/plain',
    'application/vnd.oasis.opendocument.text', // ODT
    'application/vnd.oasis.opendocument.spreadsheet', // ODS
    'application/vnd.oasis.opendocument.presentation', // ODP
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/rtf', // RTF
    'application/xml', // XML
    'text/csv', // CSV
    'application/zip', // ZIP
    'application/x-7z-compressed', // 7Z
    'application/x-rar-compressed', // RAR
    'application/x-tar', // TAR
    'audio/mpeg', // MP3
    'video/mp4', // MP4
    'application/json', // JSON
    'application/epub+zip', // EPUB
    'application/x-mobipocket-ebook', // MOBI
];

module.exports = allowedMimeTypes