import { useEffect, useState, useRef } from "react";
import LoadingTab from "./LoadingTab";
import { useAuth } from "../contexts/AuthContext";
import { FaDownload, FaFile, FaTimes, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileAudio, FaFileVideo, FaFileCode, FaTrash, FaEllipsisV, FaLink, FaFileUpload } from 'react-icons/fa';
import { uploadFile } from '../lib/fileUpload';
import { getUserProfile } from "../lib/todos";
import { useProfiles } from '../contexts/ProfileContext';

function FileTab({ groupId }) {
    const { user } = useAuth();
    const { getProfile } = useProfiles();
    
    const dragCounterRef = useRef(0);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [filterUploader, setFilterUploader] = useState('all');
    const [uploaders, setUploaders] = useState([]);
    const [userDisplayNames, setUserDisplayNames] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (!groupId || !user) return;

        fetchFiles().then(() =>
            setLoading(false)
        );

        const interval = setInterval(fetchFiles, 5000);

        return () => { clearInterval(interval); };
    }, [groupId, user]);

    useEffect(() => {
        const fetchUserDisplayNames = async () => {
            if (!files.length || !user) return;

            try {
                const idToken = await user.getIdToken();
                const uniqueUploaderIds = [...new Set(files.map(file => file.uploadedBy))];
                const displayNames = {};
                await Promise.all(
                    uniqueUploaderIds.map(async (uid) => {
                        const profile = await getProfile(uid, idToken);
                        if (profile) {
                            displayNames[uid] = profile.username;
                        }
                    })
                );

                setUserDisplayNames(displayNames);
                setUploaders(uniqueUploaderIds);
            } catch (error) {
                console.error('Error fetching user display names:', error);
            }
        };

        fetchUserDisplayNames();
    }, [files, user, getProfile]);

    const fetchFiles = async () => {
        if (!user) return;

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`http://localhost:3000/api/file/list?groupId=${groupId}`, {
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
            // Optionally set an error state here
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

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "Invalid";

        try {
            let date;
            if (timestamp._seconds && timestamp._nanoseconds) {
                date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
            } else if (typeof timestamp === 'string' || timestamp instanceof Date) {
                date = new Date(timestamp);
            } else {
                return "Invalid";
            }

            if (isNaN(date.valueOf())) {
                return "Invalid";
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(date);
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return "Invalid";
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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Delete failed');
            }

            await fetchFiles();
        } catch (err) {
            console.error('Error deleting file:', err);
            setError(err.message || 'Failed to delete file');
        }
    };

    const handleBulkDelete = async () => {
        try {
            const idToken = await user.getIdToken();
            await Promise.all(selectedFiles.map(fileId => {
                const file = files.find(f => f.id === fileId);
                return fetch(`http://localhost:3000/api/file/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fileId, key: file.key })
                });
            }));

            setSelectedFiles([]);
            await fetchFiles();
        } catch (err) {
            console.error('Error deleting files:', err);
            setError('Failed to delete selected files');
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

    const handleFileClick = (e, file) => {
        if (e.target.closest('.menu-container')) {
            return;
        }

        if (file.fileType.startsWith('image/')) {
            setPreviewUrl(file.fileUrl);
        } else {
            window.open(file.fileUrl, '_blank');
        }
    };

    const validateFileSize = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return false;
        }
        return true;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (validateFileSize(file)) {
                setError(null);
                setUploadPreview(file);
            } else {
                setUploadPreview(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!uploadPreview) return;

        try {
            setUploading(true);
            setError(null);

            const idToken = await user.getIdToken();
            await uploadFile(uploadPreview, groupId, idToken);

            setUploadPreview(null);
            await fetchFiles();
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            if (validateFileSize(file)) {
                setError(null);
                setUploadPreview(file);
            } else {
                setUploadPreview(null);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenu && !event.target.closest('.menu-container')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu]);

    const filteredFiles = files.filter(file => {
        if (filterUploader === 'all') return true;
        return file.uploadedBy === filterUploader;
    });

    if (loading) {
        return <LoadingTab />;
    }

    return (
        <div className="flex flex-col gap-4 justify-end w-full m-4 relative">
            <div
                className="flex flex-col gap-4 h-full relative"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-400 transition-all duration-200">
                        <FaFileUpload className="w-16 h-16 text-blue-400 mb-4" />
                        <p className="text-xl text-blue-600 font-semibold">Drop your file here to upload</p>
                    </div>
                )}

                {/* Add Filter Dropdown */}
                <div className="mb-4">
                    <select
                        className="bg-shade-300 px-5 py-2 rounded-lg w-64"
                        value={filterUploader}
                        onChange={(e) => setFilterUploader(e.target.value)}
                    >
                        <option value="all">All Uploaders</option>
                        {uploaders.map(uid => (
                            <option key={uid} value={uid}>
                                {userDisplayNames[uid] || uid}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Files List Section */}
                <div className="flex-1 overflow-y-auto">
                    {filteredFiles.length === 0 ? (
                        <p className="p-4 text-gray-500">No files found</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-start bg-shade-300 rounded-lg p-4 hover:bg-shade-500 transition-colors"
                                    onClick={(e) => handleFileClick(e, file)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex-shrink-0 mr-4" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFiles([...selectedFiles, file.id]);
                                                } else {
                                                    setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                                                }
                                            }}
                                            className="w-5 h-5 mr-2"
                                        />
                                    </div>
                                    <div className="flex-shrink-0 mr-4">
                                        {getFileIcon(file.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium mb-1">{file.fileName}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(file.fileSize)} • {formatTimestamp(file.uploadedAt)} •
                                            Uploaded by {userDisplayNames[file.uploadedBy] || file.uploadedBy}
                                        </p>
                                    </div>
                                    <div className="relative menu-container ml-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();  // Add this line
                                                setActiveMenu(activeMenu === file.id ? null : file.id);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded"
                                        >
                                            <FaEllipsisV className="text-gray-500" />
                                        </button>

                                        {activeMenu === file.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                <div className="py-1" role="menu">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(null);
                                                        }}
                                                    >
                                                        <FaDownload className="mr-3" /> Download
                                                    </a>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}
                {isSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        Operation successful!
                    </div>
                )}

                {/* Add bulk actions bar when files are selected */}
                {selectedFiles.length > 0 && (
                    <div className="bg-shade-300 p-4 rounded-lg flex items-center justify-between mb-4">
                        <span>{selectedFiles.length} file(s) selected</span>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                        >
                            <FaTrash /> Delete Selected
                        </button>
                    </div>
                )}

                {/* Upload Section */}
                <div className="sticky bottom-0 flex justify-center w-full">
                    <div className="bg-shade-300 px-[12px] py-[8px] rounded-[5px] w-full">
                        {uploadPreview ? (
                            <div className="flex items-center w-full">
                                <div className="flex-1 flex items-center min-w-0">
                                    {getFileIcon(uploadPreview.type)}
                                    <div className="min-w-0 flex-1 ml-2">
                                        <p className="text-sm font-medium truncate">{uploadPreview.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(uploadPreview.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => setUploadPreview(null)}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload File'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center w-full">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-500 hover:text-blue-600 font-medium px-4 py-2"
                                >
                                    Select File
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Preview Modal */}
                {previewUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setPreviewUrl(null)}
                    >
                        <div className="max-w-4xl max-h-[90vh] p-2">
                            <button
                                className="absolute top-4 right-4 text-white hover:text-gray-300"
                                onClick={() => setPreviewUrl(null)}
                            >
                                <FaTimes size={24} />
                            </button>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-[90vh] object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileTab;