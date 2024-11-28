// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('mainContent');
  const token = localStorage.getItem('token');
  
  if (token) {
    auth.token = token;
  }

  // Show notification function
  window.showNotification = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Chat Module
  const chat = {
    socket: null,
    currentChatUser: null,

    init() {
      this.socket = io({
        auth: {
          token: auth.token
        }
      });
      this.setupSocketListeners();
    },

    setupSocketListeners() {
      this.socket.on('connect', () => {
        console.log('Connected to chat server');
      });

      this.socket.on('private message', (message) => {
        this.handleNewMessage(message);
      });

      this.socket.on('message sent', (message) => {
        this.addMessageToUI(message, true);
      });

      this.socket.on('message error', (error) => {
        showNotification(error.message, 'error');
      });
    },

    async startChat(userId, username) {
      try {
        this.currentChatUser = userId;
        const chatContainer = document.querySelector('.chat-container');
        const chatUserName = document.getElementById('chatUserName');
        
        if (chatContainer && chatUserName) {
          chatContainer.style.display = 'flex';
          chatUserName.textContent = `Chat with ${username}`;
        }

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
          <img src="/uploads/${message.sender.profilePic || 'default.jpg'}" 
               alt="${message.sender.username}" 
               class="message-avatar"
               onerror="this.src='/uploads/default.jpg'">
          <div class="message-content">
            <p>${message.content}</p>
            <span class="message-time">${time}</span>
          </div>
        </div>
      `;
    }
  };

  // Update navigation based on auth status
  function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (auth.isAuthenticated()) {
      navLinks.innerHTML = `
        <a href="#" id="dashboardLink">Dashboard</a>
        <a href="#" id="searchLink">Search</a>
        <a href="#" class="btn" id="logoutLink">Logout</a>
      `;
      
      document.getElementById('dashboardLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('dashboard');
      });
      
      document.getElementById('searchLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('search');
      });
      
      document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
        updateNavigation();
        navigate('home');
      });
    } else {
      navLinks.innerHTML = `
        <a href="#" id="homeLink">Home</a>
        <a href="#" id="loginLink">Login</a>
        <a href="#" id="registerLink">Register</a>
      `;
      
      document.getElementById('homeLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('home');
      });
      
      document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('login');
      });
      
      document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('register');
      });
    }
  }

  // Router
  function navigate(page) {
    switch(page) {
      case 'home':
        renderHome();
        break;
      case 'dashboard':
        renderDashboard();
        break;
      case 'search':
        renderSearch();
        break;
      case 'login':
        renderLogin();
        break;
      case 'register':
        renderRegister();
        break;
    }
  }

  // Render Home
  function renderHome() {
    mainContent.innerHTML = `
      <div class="home-container">
        <section class="features">
          <h2>Why Choose Roomiezz?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" alt="Safe Living" class="feature-img">
              <h3>Safe Living</h3>
              <p>Verified profiles and secure messaging for peace of mind.</p>
            </div>
            <div class="feature-card">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" alt="Perfect Match" class="feature-img">
              <h3>Perfect Match</h3>
              <p>Advanced matching system based on preferences and lifestyle.</p>
            </div>
            <div class="feature-card">
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" alt="Easy Connect" class="feature-img">
              <h3>Easy Connect</h3>
              <p>Simple and intuitive platform to find and connect with roommates.</p>
            </div>
          </div>
        </section>

        <section class="popular-cities">
          <h2>Popular Cities</h2>
          <div class="cities-grid">
            <div class="city-card">
              <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9" alt="New York" class="city-img">
              <h3>New York</h3>
              <p>500+ Active Listings</p>
            </div>
            <div class="city-card">
              <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad" alt="Los Angeles" class="city-img">
              <h3>Los Angeles</h3>
              <p>350+ Active Listings</p>
            </div>
            <div class="city-card">
              <img src="https://images.unsplash.com/photo-1494522855154-9297ac14b55f" alt="San Francisco" class="city-img">
              <h3>San Francisco</h3>
              <p>400+ Active Listings</p>
            </div>
            <div class="city-card">
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df" alt="Chicago" class="city-img">
              <h3>Chicago</h3>
              <p>300+ Active Listings</p>
            </div>
          </div>
        </section>

        <section class="testimonials">
          <h2>What Our Users Say</h2>
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" alt="Sarah" class="testimonial-img">
              <p>"Found my perfect roommate within a week! The matching system is incredible."</p>
              <h4>Sarah, Student</h4>
            </div>
            <div class="testimonial-card">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="John" class="testimonial-img">
              <p>"Very user-friendly platform. Made my house-hunting experience stress-free."</p>
              <h4>John, Professional</h4>
            </div>
            <div class="testimonial-card">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80" alt="Emma" class="testimonial-img">
              <p>"Great community of people. Found not just a roommate, but a friend!"</p>
              <h4>Emma, Graduate</h4>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // Render Login
  function renderLogin() {
    mainContent.innerHTML = `
      <div class="auth-container">
        <form class="auth-form" id="loginForm">
          <h2>Login to Your Account</h2>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-large">Login</button>
          <div class="auth-switch">
            <p>Don't have an account? <a href="#" onclick="navigate('register')">Register</a></p>
          </div>
        </form>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        await auth.login(credentials);
        showNotification('Login successful!');
        updateNavigation();
        navigate('dashboard');
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  // Render Register
  function renderRegister() {
    mainContent.innerHTML = `
      <div class="auth-container">
        <form class="auth-form" id="registerForm">
          <h2>Create Your Account</h2>
          <div class="input-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-large">Register</button>
          <div class="auth-switch">
            <p>Already have an account? <a href="#" onclick="navigate('login')">Login</a></p>
          </div>
        </form>
      </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        await auth.register(userData);
        showNotification('Registration successful! Logging you in...');
        await auth.login({ email: userData.email, password: userData.password });
        updateNavigation();
        navigate('dashboard');
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  // Render Dashboard
  async function renderDashboard() {
    if (!auth.isAuthenticated()) {
      navigate('login');
      return;
    }

    mainContent.innerHTML = `
      <div class="dashboard">
        <div class="sidebar">
          <div id="profileSection"></div>
          <div class="dashboard-nav">
            <button onclick="showDashboardSection('profile')">Edit Profile</button>
            <button onclick="showDashboardSection('friends')">Friends</button>
            <button onclick="showDashboardSection('requests')">Friend Requests</button>
            <button onclick="showDashboardSection('chat')">Chat</button>
          </div>
        </div>
        <div id="dashboardContent"></div>
      </div>
    `;

    await showDashboardSection('profile');
  }

  // Show Dashboard Section
  async function showDashboardSection(section) {
    const dashboardContent = document.getElementById('dashboardContent');
    const profileSection = document.getElementById('profileSection');

    try {
      const userData = await profile.getProfile();
      
      // Update profile section
      profileSection.innerHTML = `
        <div class="profile-summary">
          <img src="/uploads/${userData.profilePic || 'default.jpg'}?${Date.now()}" 
               alt="Profile" 
               class="profile-pic"
               onerror="this.src='/uploads/default.jpg'">
          <h3>${userData.username}</h3>
          <p>${userData.college || 'No college specified'}</p>
        </div>
      `;

      switch(section) {
        case 'profile':
          dashboardContent.innerHTML = `
            <div class="profile-form">
              <h2>Edit Profile</h2>
              <form id="profileUpdateForm">
                <div class="input-group">
                  <label for="profilePic">Profile Picture</label>
                  <input type="file" id="profilePic" name="profilePic" accept="image/*">
                </div>
                <div class="input-group">
                  <label for="username">Username</label>
                  <input type="text" id="username" name="username" value="${userData.username}">
                </div>
                <div class="input-group">
                  <label for="college">College</label>
                  <input type="text" id="college" name="college" value="${userData.college || ''}">
                </div>
                <div class="input-group">
                  <label for="bio">Bio</label>
                  <textarea id="bio" name="bio">${userData.bio || ''}</textarea>
                </div>
                <h3>Preferences</h3>
                <div class="input-group">
                  <label for="budget">Monthly Budget ($)</label>
                  <input type="number" id="budget" name="budget" value="${userData.preferences?.budget || ''}">
                </div>
                <div class="input-group">
                  <label for="location">Preferred Location</label>
                  <input type="text" id="location" name="location" value="${userData.preferences?.location || ''}">
                </div>
                <div class="input-group">
                  <label for="gender">Gender Preference</label>
                  <select id="gender" name="gender">
                    <option value="">Select Gender</option>
                    <option value="male" ${userData.preferences?.gender === 'male' ? 'selected' : ''}>Male</option>
                    <option value="female" ${userData.preferences?.gender === 'female' ? 'selected' : ''}>Female</option>
                    <option value="any" ${userData.preferences?.gender === 'any' ? 'selected' : ''}>Any</option>
                  </select>
                </div>
                <div class="input-group">
                  <label for="roomType">Room Type</label>
                  <select id="roomType" name="roomType">
                    <option value="">Select Room Type</option>
                    <option value="private" ${userData.preferences?.roomType === 'private' ? 'selected' : ''}>Private Room</option>
                    <option value="shared" ${userData.preferences?.roomType === 'shared' ? 'selected' : ''}>Shared Room</option>
                  </select>
                </div>
                <button type="submit" class="btn">Save Profile</button>
              </form>
            </div>
          `;

          document.getElementById('profileUpdateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Add preferences to formData
            const preferences = {
              budget: formData.get('budget'),
              location: formData.get('location'),
              gender: formData.get('gender'),
              roomType: formData.get('roomType')
            };
            formData.set('preferences', JSON.stringify(preferences));

            try {
              await profile.updateProfile(formData);
              showNotification('Profile updated successfully!');
              await showDashboardSection('profile'); // Refresh the section
            } catch (error) {
              showNotification(error.message, 'error');
            }
          });
          break;

        case 'friends':
          const friendsList = userData.friends || [];
          dashboardContent.innerHTML = `
            <div class="friends-section">
              <h2>My Friends (${friendsList.length})</h2>
              <div class="friends-grid">
                ${friendsList.length === 0 ? `
                  <p>You haven't added any friends yet.</p>
                ` : friendsList.map(friend => `
                  <div class="user-card">
                    <button class="remove-friend-btn" onclick="friends.removeFriend('${friend._id}')">×</button>
                    <img src="/uploads/${friend.profilePic || 'default.jpg'}?${Date.now()}" 
                         alt="${friend.username}" 
                         class="profile-pic"
                         onerror="this.src='/uploads/default.jpg'">
                    <h4>${friend.username}</h4>
                    <p>${friend.college || ''}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          break;

        case 'requests':
          const requests = await friends.getRequests();
          dashboardContent.innerHTML = `
            <div class="requests-section">
              <h2>Friend Requests</h2>
              <div class="requests-container">
                <div class="received-requests">
                  <h3>Received Requests (${requests.received.length})</h3>
                  <div class="friends-grid">
                    ${requests.received.length === 0 ? `
                      <p>No pending friend requests.</p>
                    ` : requests.received.map(user => `
                      <div class="user-card">
                        <img src="/uploads/${user.profilePic || 'default.jpg'}?${Date.now()}" 
                             alt="${user.username}" 
                             class="profile-pic"
                             onerror="this.src='/uploads/default.jpg'">
                        <h4>${user.username}</h4>
                        <div class="request-actions">
                          <button class="btn" onclick="friends.acceptRequest('${user._id}')">Accept</button>
                          <button class="btn btn-danger" onclick="friends.rejectRequest('${user._id}')">Reject</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="sent-requests mt-3">
                  <h3>Sent Requests (${requests.sent.length})</h3>
                  <div class="friends-grid">
                    ${requests.sent.length === 0 ? `
                      <p>No sent friend requests.</p>
                    ` : requests.sent.map(user => `
                      <div class="user-card">
                        <button class="cancel-request-btn" onclick="friends.cancelRequest('${user._id}')">×</button>
                        <img src="/uploads/${user.profilePic || 'default.jpg'}?${Date.now()}" 
                             alt="${user.username}" 
                             class="profile-pic"
                             onerror="this.src='/uploads/default.jpg'">
                        <h4>${user.username}</h4>
                        <p>Request Pending</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
          break;

        case 'chat':
          const chatFriendsList = userData.friends || [];
          dashboardContent.innerHTML = `
            <div class="chat-section">
              <div class="friends-list">
                <h3>Chat with Friends</h3>
                <div class="friends-grid">
                  ${chatFriendsList.map(friend => `
                    <div class="user-card" onclick="chat.startChat('${friend._id}', '${friend.username}')">
                      <img src="/uploads/${friend.profilePic || 'default.jpg'}?${Date.now()}" 
                           alt="${friend.username}" 
                           class="profile-pic"
                           onerror="this.src='/uploads/default.jpg'">
                      <h4>${friend.username}</h4>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="chat-container" style="display: none;">
                <div class="chat-header">
                  <h2 id="chatUserName">Select a friend to start chatting</h2>
                </div>
                <div id="chatContent" class="chat-content"></div>
                <div class="chat-input-container">
                  <input type="text" id="messageInput" class="chat-input" placeholder="Type a message...">
                  <button class="send-button" id="sendButton">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          `;

          // Initialize chat functionality
          chat.init();

          // Add event listener for send button
          const sendButton = document.getElementById('sendButton');
          const messageInput = document.getElementById('messageInput');
          
          if (sendButton && messageInput) {
            sendButton.addEventListener('click', () => {
              const content = messageInput.value;
              if (content.trim()) {
                chat.sendMessage(content);
                messageInput.value = '';
              }
            });

            messageInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error loading dashboard section:', error);
      dashboardContent.innerHTML = `
        <div class="error-message">
          <p>Error loading content. Please try again later.</p>
        </div>
      `;
    }
  }

  // Render Search
  function renderSearch() {
    if (!auth.isAuthenticated()) {
      navigate('login');
      return;
    }

    mainContent.innerHTML = `
      <div class="search-container">
        <div class="search-form-container">
          <h2>Find Roommates</h2>
          <form id="searchForm" class="search-form">
            <div class="input-group">
              <label for="college">College</label>
              <input type="text" id="college" name="college" placeholder="Enter college name">
            </div>
            <div class="input-group">
              <label for="location">Location</label>
              <input type="text" id="location" name="location" placeholder="Enter location">
            </div>
            <div class="input-group">
              <label for="budget">Maximum Budget ($)</label>
              <input type="number" id="budget" name="budget" placeholder="Enter maximum budget">
            </div>
            <button type="submit" class="btn">Search</button>
          </form>
        </div>
        <div id="searchResults" class="search-results"></div>
      </div>
    `;

    document.getElementById('searchForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const criteria = {
        college: formData.get('college'),
        location: formData.get('location'),
        budget: formData.get('budget')
      };
      
      try {
        const results = await search.searchUsers(criteria);
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
          resultsContainer.innerHTML = `
            <div class="no-results">
              <p>No users found matching your criteria.</p>
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = `
          <div class="search-grid">
            ${results.map(user => `
              <div class="user-card">
                <img src="/uploads/${user.profilePic || 'default.jpg'}?${Date.now()}" 
                     alt="${user.username}" 
                     class="profile-pic"
                     onerror="this.src='/uploads/default.jpg'">
                <h4>${user.username}</h4>
                <p>${user.college || 'No college specified'}</p>
                ${user.preferences ? `
                  <div class="preferences">
                    ${user.preferences.budget ? 
                      `<p>Budget: $${user.preferences.budget}/month</p>` : ''}
                    ${user.preferences.location ? 
                      `<p>Location: ${user.preferences.location}</p>` : ''}
                    ${user.preferences.gender ? 
                      `<p>Gender Preference: ${user.preferences.gender}</p>` : ''}
                    ${user.preferences.roomType ? 
                      `<p>Room Type: ${user.preferences.roomType}</p>` : ''}
                  </div>
                ` : ''}
                <button onclick="friends.sendRequest('${user._id}')" class="btn">
                  Send Friend Request
                </button>
              </div>
            `).join('')}
          </div>
        `;
      } catch (error) {
        console.error('Search error:', error);
        document.getElementById('searchResults').innerHTML = `
          <div class="error-message">
            <p>An error occurred while searching. Please try again.</p>
          </div>
        `;
      }
    });
  }

  // Make functions available globally
  window.showDashboardSection = showDashboardSection;
  window.navigate = navigate;
  window.showNotification = showNotification;
  window.chat = chat;

  // Initialize
  updateNavigation();
  navigate('home');
});