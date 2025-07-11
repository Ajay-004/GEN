import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
// Removed LoadingSpinner import from App.js if ChatWindow handles message-specific loading
// import LoadingSpinner from './components/LoadingSpinner'; 
import './style/App.css';
import './style/main.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false); // Indicates if AI is processing or data is being fetched
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const userId = 'guestUser123'; // Hardcoded user ID for simplicity. In a real app, this would be dynamic.

    // New state for managing multiple chats
    const [currentChatId, setCurrentChatId] = useState(null); // ID of the currently active chat
    const [currentChatName, setCurrentChatName] = useState('New Chat'); // Display name for the current chat
    const [recentChats, setRecentChats] = useState([]); // Array of { id, name, updatedAt } for recent chats

    // State for sidebar visibility, managed here and passed to Navbar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial greeting message - ensure sender is 'bot' for CSS consistency
    const initialGreetingMessage = { sender: 'bot', text: "Hello! I'm PicoBot, your fitness assistant. To start, please tell me your age.", timestamp: new Date().toISOString() };

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to fetch conversation history for a specific chat
    const fetchChatHistory = async (chatId) => {
        try {
            setLoading(true); // Indicate loading for fetching history
            const response = await axios.get(`/api/chat/history/${userId}/${chatId}`);
            let fetchedMessages = response.data.messages;

            // Ensure the initial greeting message is always present at the start of the chat history
            const hasGreeting = fetchedMessages.some(msg =>
                msg.sender === 'bot' && msg.text.includes("Hello! I'm PicoBot")
            );
            if (!hasGreeting) {
                fetchedMessages = [initialGreetingMessage, ...fetchedMessages];
            }
            
            setMessages(fetchedMessages);
            console.log(`Conversation history loaded for chat ID ${chatId}:`, fetchedMessages);
        } catch (error) {
            console.error(`Error fetching conversation history for chat ID ${chatId}:`, error);
            setMessages([
                initialGreetingMessage, // Always show greeting even on error
                { sender: 'bot', text: 'Oops! Unable to load conversation history for this chat.' }
            ]);
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    };

    // Function to fetch the list of recent chats for the user
    const fetchRecentChats = async () => {
        try {
            const response = await axios.get(`/api/chat/recent-chats/${userId}`);
            setRecentChats(response.data.chats);
            console.log('Recent chats loaded:', response.data.chats);
            return response.data.chats; // Return chats for initial loading logic
        } catch (error) {
            console.error('Error fetching recent chats:', error);
            setRecentChats([]);
            return [];
        }
    };

    // Function to start a new chat
    const startNewChat = () => {
        const newChatTempId = `new_chat_${Date.now()}`;
        setCurrentChatId(newChatTempId);
        setCurrentChatName('New Conversation'); // This is the name displayed in Navbar for a fresh chat
        setMessages([initialGreetingMessage]);
        console.log('Started new chat with temporary ID:', newChatTempId);
        setIsSidebarOpen(false); // Close sidebar when starting a new chat
    };

    // Function to load a specific recent chat
    const onLoadRecentChat = (chatId, chatName) => {
        setCurrentChatId(chatId);
        setCurrentChatName(chatName);
        fetchChatHistory(chatId);
        console.log(`Loaded recent chat: ${chatName} (${chatId})`);
        setIsSidebarOpen(false); // Close sidebar when loading a chat
    };

    // Function to handle chat deletion
    const handleDeleteChat = async (chatIdToDelete) => {
        if (!window.confirm("Are you sure you want to delete this conversation?")) {
            return; // User cancelled
        }
        try {
            setLoading(true); // Indicate loading during deletion
            const response = await axios.delete(`/api/chat/${userId}/${chatIdToDelete}`);
            console.log('Delete response:', response.data.message);

            const updatedRecentChats = await fetchRecentChats(); // Re-fetch to update list

            if (currentChatId === chatIdToDelete) {
                // If the deleted chat was the current one, start a new one
                if (updatedRecentChats.length > 0) {
                    const mostRecent = updatedRecentChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                    onLoadRecentChat(mostRecent.id, mostRecent.name);
                } else {
                    startNewChat();
                }
            }
            // If the deleted chat was not the current one, just update the recent chats list
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete conversation. Please try again.');
        } finally {
            setLoading(false); // End loading
        }
    };

    // Function to export current chat as JSON file (triggers backend download)
    const exportChatAsJson = async () => {
        // Prevent export if it's a new unsaved chat or has only the initial greeting
        if (!currentChatId || currentChatId.startsWith('new_chat_') || messages.length <= 1) {
            alert("No conversation to export or chat is empty.");
            return;
        }

        try {
            setLoading(true); // Indicate loading during export initiation
            const exportUrl = `/api/chat/export-json/${userId}/${currentChatId}`;

            window.open(exportUrl, '_blank'); // Triggers file download

            console.log(`Export initiated for chat ID: ${currentChatId}`);
            alert("Chat export initiated! Check your downloads.");

        } catch (error) {
            console.error('Error initiating chat export:', error);
            alert('Failed to export conversation. Please try again.');
        } finally {
            setLoading(false); // End loading
            setIsSidebarOpen(false); // Close sidebar after exporting
        }
    };


    // Initial load effect: fetch recent chats and then load the most recent one or start a new one
    useEffect(() => {
        const initializeChat = async () => {
            const fetchedRecentChats = await fetchRecentChats();
            if (fetchedRecentChats.length > 0) {
                // Load the most recent chat if available
                const mostRecent = fetchedRecentChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                onLoadRecentChat(mostRecent.id, mostRecent.name);
            } else {
                // If no recent chats, initialize with a fresh empty chat
                startNewChat();
            }
        };

        initializeChat();
    }, [userId]); // Dependency on userId ensures it runs once per user or if userId changes

    // Function to handle language selection from Navbar
    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        console.log(`Language changed to: ${langCode}`);
    };

    // Function to send a new message to the backend (now handles files)
    const sendMessage = async (payload) => {
        const { text, file } = payload;

        // Validate input: If no text and no file, do nothing.
        if (!text && !file) {
            console.warn("Attempted to send an empty message with no file.");
            return;
        }

        // Add user's message to UI immediately with a timestamp
        const newUserMessage = {
            sender: 'user',
            text: text || (file ? `Attaching: ${file.name}` : ''), // Show filename if no text
            fileData: file ? URL.createObjectURL(file) : null, // Create a temporary URL for immediate display
            fileMimeType: file ? file.type : null,
            timestamp: new Date().toISOString()
        };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setLoading(true); // Indicate AI is processing the message

        try {
            let response;
            if (file) {
                // Handle file upload
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', userId);
                formData.append('message', text || ''); // Send text (caption) or empty string
                formData.append('language', selectedLanguage);
                formData.append('chatId', currentChatId);

                response = await axios.post('/api/chat/message', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('File message sent and response received:', response.data);

            } else {
                // Handle text message
                response = await axios.post('/api/chat/message', {
                    userId,
                    message: text,
                    language: selectedLanguage,
                    chatId: currentChatId
                });
                console.log('Text message sent and response received:', response.data);
            }

            // Update currentChatId with the actual MongoDB _id if it was a new chat
            if (currentChatId && currentChatId.startsWith('new_chat_')) {
                setCurrentChatId(response.data.chatId);
                setCurrentChatName(response.data.chatName || 'New Conversation'); // Use backend name or default
            }

            // Re-fetch recent chats after a message is sent to ensure list is updated
            fetchRecentChats();

            // Simulate AI typing delay for better UX
            setTimeout(() => {
                // Ensure the bot's message also has a consistent sender and timestamp
                const botMessage = {
                    ...response.data.chefGPTMessage,
                    sender: 'bot', // Ensure consistency
                    timestamp: new Date().toISOString()
                };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
                setLoading(false); // AI response received, turn off loading
            }, 1000); // Reduced delay for smoother feel
            
        } catch (error) {
            console.error('Error sending message or receiving response:', error);
            setLoading(false); // Stop loading on error
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: 'Oops! Something went wrong while getting a response. Please try again.', timestamp: new Date().toISOString() }
            ]);
        } finally {
             // Clean up temporary object URL if a file was sent
             if (file && newUserMessage.fileData) {
                URL.revokeObjectURL(newUserMessage.fileData);
            }
        }
    };

    return (
        <div className="app-main-container">
            <Navbar
                onLanguageSelect={handleLanguageSelect}
                onNewChat={startNewChat}
                recentChats={recentChats}
                onLoadRecentChat={onLoadRecentChat}
                currentChatName={currentChatName}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar} // Navbar controls sidebar
                onDeleteChat={handleDeleteChat}
                onExportChat={exportChatAsJson}
            />
            <div className="chat-content-wrapper">
                <ChatWindow
                    messages={messages}
                    isLoading={loading} // Pass loading state for the typing indicator in ChatWindow
                    // Removed chatWindowRef and toggleSidebar from ChatWindow props
                    // as ChatWindow manages its own scroll, and Navbar controls sidebar
                />
                {/* Removed global LoadingSpinner as ChatWindow handles typing indicator */}
                {/* {loading && <LoadingSpinner />} */}
                <MessageInput onSendMessage={sendMessage} isLoading={loading} />
            </div>
        </div>
    );
}

export default App;