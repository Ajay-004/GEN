import React, { useState, useRef, useEffect } from 'react';
import '../style/MessageInput.css';

function MessageInput({ onSendMessage, isLoading }) {
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null); // Ref for the main text input field

    // Auto-focus input box when component loads
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Effect to close emoji picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            // Check if click is outside the emoji picker AND not on the emoji button itself
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                !event.target.closest('.emoji-button') // Ensures clicking the emoji button toggles, not closes
            ) {
                setShowEmojiPicker(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent sending if a message is already in transit

        const trimmedInput = input.trim();

        if (selectedFile) {
            // If a file is selected, send the file along with any typed text (as caption)
            // If no text is typed, use the filename as default text
            onSendMessage({ text: trimmedInput || selectedFile.name, file: selectedFile });
            handleClearFile(); // Clear the file after sending
        } else if (trimmedInput) {
            // If only text is present, send the text message
            onSendMessage({ text: trimmedInput, file: null });
            setInput(''); // Clear input field after sending
        }

        setShowEmojiPicker(false); // Close emoji picker after sending
    };

    const handleEmojiClick = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleSelectEmoji = (emoji) => {
        setInput((prev) => prev + emoji);
        inputRef.current?.focus(); // Refocus input field after adding emoji
    };

    const handleAttachFileClick = () => {
        // Only allow attaching a file if not currently loading and no file is already selected
        if (!isLoading && !selectedFile) {
            fileInputRef.current.click(); // Programmatically click the hidden file input
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) { // Only accept image files
            setSelectedFile(file);
            // Optionally, you can set the input to the file name or a preview string
            setInput(file.name);
        } else {
            setSelectedFile(null);
            setInput(''); // Clear input if invalid file type or no file
        }
        // Clear the file input's value to allow selecting the same file again if needed
        e.target.value = null;
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setInput('');
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the hidden file input
        }
    };

    // Your extensive list of emojis
    const allEmojis = [
        '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
        '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖',
        '😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔',
        '🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴',
        '🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','💀','👻','👽','👾','🤖','🎃','😺','😸',
        '😹','😻','😼','😽','🙀','😿','😾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷',
        '🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄',
        '🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙',
        '🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐆','🐅','🐃','🐂','🐄','🐪','🐫','🦙',
        '🦒','🐘','🦣','🦏','🦛','🐐','🐏','🐑','🐎','🐖','🐀','🐁','🐓','🦃','🦚','🦜','🕊️','🐇','🦝','🦨','🦡',
        '🦫','🦦','🦥','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂',
        '🍁','🍄','🐚','🪨','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗',
        '🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐','🌟','✨','⚡','☄️','💥','🔥','🌪️','🌈','☀️',
        '🌤️','⛅','🌥️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌫️','🌊','💧','💦','☔','🫧','🪺',
        '🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆',
        '🌽','🥕','🫑','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴',
        '🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🍝','🍜','🍲','🍛','🍣','🍱','🥟',
        '🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫',
        '🍿','🧂','🥤','🧃','🧉','🧊','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧋','🫖','☕','🍵','🫗','🥄','🍴','🍽️',
        '🥣','🥡','🥢','🧂','🏺','🔪','🏹','🛠️','🗡️','⚔️','🪓','🔫','🚬','🧨','💣','🪃','🪄','🪜','🛏️','🛋️','🪑',
        '🚪','🪞','🪟','🛁','🚿','🪠','🧼','🧽','🪥','🪒','🧻','🚽','🚰','🛒','🚗','🚕','🚙','🚌','🚎','🏎️','🚓',
        '🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚨','🚔','🚍','🚘','🚖',
        '🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🪂','💺','🚁',
        '🚟','🛰️','🚀','🛸','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🚏','🗺️','🗿','🗽',
        '🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🏠','🏡','🏘️',
        '🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🛕','🕍','🕋','⛩️',
        '🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁','⌚','📱','📲','💻',
        '⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️',
        '📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵',
        '💴','💶','💷','🪙','💰','💳','🧾','💎','⚖️','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🗜️','⚗️','🧪','🧫','🧬','🔬',
        '🔭','📡','💉','🩸','💊','🩺','🚪','🛏️','🛋️','🚽','🚿','🛁','🧴','🧷','🧹','🧺','🧻','🪠','🪤','🪒','🧼','🧽','🪥'
    ];

    return (
        <form onSubmit={handleSubmit} className="message-input-form">
            {/* Hidden file input for file selection */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*" // Only accept image files
                disabled={isLoading || !!selectedFile} // Disable if loading or file already selected
            />

            {/* Attach File Button */}
            <button
                type="button"
                className="icon-button attach-button"
                onClick={handleAttachFileClick}
                disabled={isLoading || !!selectedFile} // Disable if loading or file already selected
                title="Attach Image"
            >
                ➕
            </button>

            {/* Main Message Input Field */}
            <input
                type="text"
                ref={inputRef} // Auto-focus via this ref
                value={selectedFile ? selectedFile.name : input} // Display filename if file selected
                onChange={(e) => !selectedFile && setInput(e.target.value)} // Only allow typing if no file
                placeholder={
                    selectedFile
                        ? `Image: ${selectedFile.name}` // Placeholder when image is selected
                        : isLoading
                            ? 'Sending...' // Placeholder when loading/sending
                            : 'Type your message...' // Default placeholder
                }
                disabled={isLoading} // Disable input when loading
                readOnly={!!selectedFile} // Make read-only if a file is selected
                className="message-input"
            />

            {/* Clear File Button (conditionally rendered) */}
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

            {/* Emoji Picker Button and Container */}
            <div className="emoji-button-container">
                <button
                    type="button"
                    className="icon-button emoji-button"
                    onClick={handleEmojiClick}
                    disabled={isLoading || !!selectedFile} // Disable if loading or file selected
                    title="Insert Emoji"
                >
                    😀
                </button>

                {showEmojiPicker && (
                    <div className="emoji-picker" ref={emojiPickerRef}>
                        {allEmojis.map((emoji, index) => (
                            <span
                                key={index}
                                onClick={() => handleSelectEmoji(emoji)}
                                className="emoji-item"
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Send Button */}
            <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedFile)} // Disable if loading or nothing to send
                className="send-button"
            >
                {isLoading ? 'Send' : selectedFile ? 'Send Image' : 'Send'}
            </button>
        </form>
    );
}

export default MessageInput;