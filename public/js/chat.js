const chat = {
    socket: null,
    currentChatUser: null,
  
    init() {
      this.socket = io();
      this.setupSocketListeners();
    },
  
    setupSocketListeners() {
      this.socket.on('connect', () => {
        console.log('Connected to chat server');
      });
  
      this.socket.on('private message', (message) => {
        this.handleNewMessage(message);
      });
    },
  
    async startChat(userId) {
      try {
        this.currentChatUser = userId;
        const response = await fetch(`/api/chat/${userId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load chat history');
        
        const messages = await response.json();
        this.displayChatHistory(messages);
        this.markMessagesAsRead(userId);
      } catch (error) {
        console.error('Start chat error:', error);
        showNotification(error.message, 'error');
      }
    },
  
    async sendMessage(content) {
      if (!this.currentChatUser || !content.trim()) return;
  
      try {
        this.socket.emit('private message', {
          receiver: this.currentChatUser,
          content: content.trim()
        });
  
        // Optimistically add message to UI
        this.addMessageToUI({
          sender: auth.user,
          content,
          createdAt: new Date()
        }, true);
      } catch (error) {
        console.error('Send message error:', error);
        showNotification('Failed to send message', 'error');
      }
    },
  
    async markMessagesAsRead(userId) {
      try {
        await fetch(`/api/chat/read/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    },
  
    handleNewMessage(message) {
      if (message.sender._id === this.currentChatUser) {
        this.addMessageToUI(message);
        this.markMessagesAsRead(message.sender._id);
      } else {
        showNotification(`New message from ${message.sender.username}`);
      }
    },
  
    displayChatHistory(messages) {
      const chatContent = document.getElementById('chatContent');
      if (!chatContent) return;
  
      chatContent.innerHTML = messages.map(msg => this.createMessageHTML(msg)).join('');
      chatContent.scrollTop = chatContent.scrollHeight;
    },
  
    addMessageToUI(message, isSelf = false) {
      const chatContent = document.getElementById('chatContent');
      if (!chatContent) return;
  
      chatContent.insertAdjacentHTML('beforeend', this.createMessageHTML(message, isSelf));
      chatContent.scrollTop = chatContent.scrollHeight;
    },
  
    createMessageHTML(message, isSelf = false) {
      const messageClass = isSelf ? 'message-self' : 'message-other';
      const time = new Date(message.createdAt).toLocaleTimeString();
      
      return `
        <div class="message ${messageClass}">
          <img src="/uploads/${message.sender.profilePic}" alt="${message.sender.username}" class="message-avatar">
          <div class="message-content">
            <p>${message.content}</p>
            <span class="message-time">${time}</span>
          </div>
        </div>
      `;
    }
  };
  
  export default chat;