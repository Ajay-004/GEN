import React from 'react';
import '../style/Navbar.css';

function Navbar({
  currentChatName,
  isSidebarOpen,
  toggleSidebar,
  onNewChat,
  recentChats,
  onLoadRecentChat,
  onDeleteChat,
}) {
  const handleLoadChatClick = (chatId, chatName, event) => {
    // Prevent loading chat if delete icon was clicked
    if (event.target.classList.contains('delete-chat-icon')) return;
    onLoadRecentChat(chatId, chatName);
  };

  const handleDeleteIconClick = (chatId, event) => {
    event.stopPropagation(); // Prevent the parent <a>'s onClick from firing
    onDeleteChat(chatId);
  };

  const handleNewChatClick = (e) => {
    e.preventDefault();
    onNewChat();
  };

  return (
    <nav className="navbar-container">
      {/* 🔘 Sidebar Toggle Button (left) */}
      <div className="navbar-menu-icon-wrapper">
        <button
          className="menu-icon-button-in-chat"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <i className="fas fa-bars text-xl"></i> {/* Assuming Font Awesome for icons */}
        </button>
      </div>

      {/* 🔘 Logo */}
      <div className="navbar-logo">
        <img src="diet.jpg" alt="PicoBot Logo" className="navbar-bot-logo" /> {/* Ensure diet.jpg exists */}
        PicoBot
      </div>

      {/* 🔘 Chat title */}
      <div className="navbar-middle-links">
        <span className="current-chat-display"><strong>{currentChatName}</strong></span>
      </div>

      {/* 🔘 Placeholder for settings/icons (currently empty) */}
      <ul className="navbar-right-links"></ul>

      {/* 🔘 Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <button className="sidebar-close-button" onClick={toggleSidebar}>
            &times; {/* Close icon */}
          </button>
        </div>

        <div className="sidebar-content">
          {/* New Chat */}
          <a href="#new-chat" onClick={handleNewChatClick} className="sidebar-item">
            <i className="fas fa-edit"></i> {/* Edit icon */}
            New chat
          </a>

          {/* Recent Chats */}
          <div className="sidebar-section-title">Recent chats</div>

          {recentChats.length > 0 ? (
            // Sort chats by updatedAt (most recent first)
            [...recentChats]
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map((chat) => (
                <a
                  key={chat.id}
                  href={`#chat-${chat.id}`}
                  onClick={(e) => handleLoadChatClick(chat.id, chat.name, e)}
                  className="sidebar-item recent-chat-item"
                >
                  <span className="recent-chat-name">{chat.name}</span>
                  {/* The timestamp (updatedAt) is used for sorting, but NOT displayed here. */}
                  {/* If you wanted to display it, you'd add something like: */}
                  {/* <span className="chat-updated-at">
                       {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span> */}
                  <span
                    className="delete-chat-icon"
                    onClick={(e) => handleDeleteIconClick(chat.id, e)}
                    title="Delete Chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d11a2a" viewBox="0 0 24 24">
                        <path d="M9 3v1H4v2h1v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm2 2h2v1h-2V5zM7 6h10v14H7V6zm2 2v10h2V8H9zm4 0v10h2V8h-2z"/>
                    </svg>
                     {/* Trash can icon */}
                  </span>
                </a>
              ))
          ) : (
            <span className="no-recent-chats">No recent chats</span>
          )}
        </div>
      </div>

      {/* 🔘 Overlay to close sidebar on outside click */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </nav>
  );
}

export default Navbar;
