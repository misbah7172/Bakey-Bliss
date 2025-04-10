import React, { useState } from 'react';
import Footer from '../components/Footer'; // Correct path
import 'bootstrap/dist/css/bootstrap.min.css';
import '../inboxstyles.css';

const Inbox = () => {
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  // Sample conversation data (replace with real data from an API)
  const [conversations, setConversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Hey, when will my order be ready?', timestamp: '10:30 AM' },
    { id: 2, name: 'Jane Smith', lastMessage: 'Thanks for the quick delivery!', timestamp: 'Yesterday' },
    { id: 3, name: 'Alice Johnson', lastMessage: 'Can I change my order?', timestamp: '2 days ago' },
  ]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Inbox Section */}
      <section className="inbox">
        <div className="container">
          <h2>Inbox</h2>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              id="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Inbox List */}
          <div className="inbox-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div key={conversation.id} className="conversation-item">
                  <div className="conversation-info">
                    <h3>{conversation.name}</h3>
                    <p>{conversation.lastMessage}</p>
                  </div>
                  <div className="conversation-timestamp">
                    <p>{conversation.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No conversations found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Inbox;