import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import '../style/MessageInput.css';

function MessageInput({ onSendMessage, isLoading }) {
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();

        const handleClickOutside = (e) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(e.target) &&
                !e.target.closest('.emoji-button')
            ) {
                setShowEmojiPicker(false);
            }
        };

        const handleGlobalKeyPress = (e) => {
            const tag = e.target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || isLoading || selectedFile) return;
            if (!inputRef.current) return;

            inputRef.current.focus();

            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                setInput((prev) => prev + e.key);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleGlobalKeyPress);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleGlobalKeyPress);
        };
    }, [isLoading, selectedFile]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return;
        const trimmedInput = input.trim();
        if (selectedFile) {
            onSendMessage({ text: trimmedInput || selectedFile.name, file: selectedFile });
            handleClearFile();
        } else if (trimmedInput) {
            onSendMessage({ text: trimmedInput, file: null });
            setInput('');
        }
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = () => setShowEmojiPicker(!showEmojiPicker);

    const handleSelectEmoji = (emoji) => {
        setInput((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const handleAttachFileClick = () => {
        if (!isLoading && !selectedFile) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setInput(file.name);
        } else {
            setSelectedFile(null);
            setInput('');
        }
        e.target.value = null;
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        };

        recognition.onerror = (event) => {
            console.error('Voice error:', event.error);
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <form onSubmit={handleSubmit} className="message-input-form">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
                disabled={isLoading || !!selectedFile}
            />

            <button
                type="button"
                className="icon-button attach-button"
                onClick={handleAttachFileClick}
                disabled={isLoading || !!selectedFile}
                title="Attach Image"
            >
                <i class="fa-solid fa-paperclip"></i>
            </button>

            <input
                type="text"
                ref={inputRef}
                value={selectedFile ? selectedFile.name : input}
                onChange={(e) => !selectedFile && setInput(e.target.value)}
                placeholder={
                    selectedFile ? `Image: ${selectedFile.name}` :
                        isLoading ? 'Type your message...' : 'Type your message...'
                }
                disabled={isLoading}
                readOnly={!!selectedFile}
                className="message-input"
            />

            {selectedFile && (
                <button
                    type="button"
                    className="icon-button clear-file-button"
                    onClick={handleClearFile}
                    disabled={isLoading}
                    title="Clear Selected Image"
                >
                    ✖️
                </button>
            )}

            <div className="emoji-button-container">
                <button
                    type="button"
                    className="icon-button emoji-button"
                    onClick={handleEmojiClick}
                    disabled={isLoading || !!selectedFile}
                    title="Insert Emoji"
                >
                    <i class="fa-solid fa-face-smile"></i>
                </button>

                {showEmojiPicker && (
                    <div className="emoji-picker" ref={emojiPickerRef}>
                        <EmojiPicker
                            onEmojiClick={(emojiData) => handleSelectEmoji(emojiData.emoji)}
                            height={350}
                            width={280}
                            lazyLoadEmojis
                        />
                    </div>
                )}
            </div>

            <button
                type="button"
                className={`icon-button mic-button ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceInput}
                disabled={isLoading || !!selectedFile}
                title="Speak to Type"
            >
                <i className={`fas fa-microphone${isListening ? '-alt' : ''}`}></i>
            </button>

            <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className="send-button"
            >
                {isLoading ? 'Send' : selectedFile ? 'Send Image' : 'Send'}
            </button>
        </form> 
    );
}

export default MessageInput;
