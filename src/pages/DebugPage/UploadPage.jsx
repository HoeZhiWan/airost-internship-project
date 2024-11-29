import React from 'react';
import { FaSpinner, FaDownload, FaFile, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileAudio, FaFileVideo, FaFileCode, FaTrash, FaEllipsisV, FaLink } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; 

function UploadPage() {
    const [error, setError] = React.useState(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const { user } = useAuth();
    const fileInputRef = React.useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const [files, setFiles] = React.useState([]);
    const [activeMenu, setActiveMenu] = React.useState(null);

    React.useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('http://localhost:3000/api/file/list', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }

            const data = await response.json();
            setFiles(data.files);
        } catch (err) {
            console.error('Error fetching files:', err);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return <FaFileImage className="w-12 h-12 text-blue-500" />;
        if (fileType === 'application/pdf') return <FaFilePdf className="w-12 h-12 text-red-500" />;
        if (fileType.includes('word')) return <FaFileWord className="w-12 h-12 text-blue-600" />;
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel className="w-12 h-12 text-green-600" />;
        if (fileType.startsWith('audio/')) return <FaFileAudio className="w-12 h-12 text-purple-500" />;
        if (fileType.startsWith('video/')) return <FaFileVideo className="w-12 h-12 text-pink-500" />;
        if (fileType.includes('javascript') || fileType.includes('typescript') || fileType.includes('html') || fileType.includes('css')) 
            return <FaFileCode className="w-12 h-12 text-gray-600" />;
        return <FaFile className="w-12 h-12 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return false;
        }
        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setError(null);
        setIsDragging(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSuccess(false);

        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // Use selectedFile instead of getting from form

        try {
            setIsUploading(true);
            setError(null);
            
            const idToken = await user.getIdToken();
            const response = await fetch('http://localhost:3000/api/file/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log("Upload response:", data);
            setIsSuccess(true);
            resetForm(); // Reset form after successful upload
            await fetchFiles(); // Refresh the file list after upload
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleAreaClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleDelete = async (fileId, key) => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`http://localhost:3000/api/file/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileId, key })
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            await fetchFiles(); // Refresh the file list
        } catch (err) {
            console.error('Error deleting file:', err);
            setError('Failed to delete file');
        }
    };

    const handleCopyUrl = async (fileUrl) => {
        try {
            await navigator.clipboard.writeText(fileUrl);
            setError(null);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (err) {
            setError('Failed to copy URL');
        }
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <div className="flex justify-center items-center flex-grow">
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div 
                            onClick={handleAreaClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file && validateFile(file)) {
                                    setSelectedFile(file);
                                }
                            }}
                            className={`border-2 ${isDragging ? 'border-dashed border-green-300' : 'border-dashed border-gray-300'} 
                            rounded-lg p-6 text-center transition-all duration-200 hover:border-green-500 hover:shadow-lg cursor-pointer`}
                        >
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    {getFileIcon(selectedFile.type)}
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <FaFile className="w-12 h-12 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        Drag and drop or click to select a file
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="file"
                                accept="*/*"  // Changed to accept all files
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isUploading || !selectedFile}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload File
                        </button>
                    </form>
                    
                    {isUploading && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <FaSpinner className="animate-spin w-4 h-4" />
                            <span>Uploading...</span>
                        </div>
                    )}
                    
                    {isSuccess && (
                        <p className="text-green-500 text-sm mt-2">Upload completed successfully!</p>
                    )}
                    
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </div>
            </div>

            {/* File List Section */}
            <div className="w-full max-w-4xl mx-auto mt-8 mb-4 overflow-visible"> {/* Added overflow-visible */}
                <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
                <div className="bg-white rounded-lg shadow">  {/* Removed overflow-hidden */}
                    {files.length === 0 ? (
                        <p className="p-4 text-gray-500">No files uploaded yet</p>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {files.map((file) => (
                                <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        {getFileIcon(file.fileType)}
                                        <div>
                                            <p className="font-medium">{file.fileName}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === file.id ? null : file.id)}
                                            className="p-2 hover:bg-gray-100 rounded"
                                        >
                                            <FaEllipsisV className="text-gray-500" />
                                        </button>
                                        
                                        {activeMenu === file.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                <div className="py-1" role="menu">
                                                    <button
                                                        onClick={() => {
                                                            handleCopyUrl(file.fileUrl);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                                    >
                                                        <FaLink className="mr-3" /> Copy URL
                                                    </button>
                                                    <a
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={() => setActiveMenu(null)}
                                                    >
                                                        <FaDownload className="mr-3" /> Download
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            handleDelete(file.id, file.key);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                                    >
                                                        <FaTrash className="mr-3" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UploadPage;

