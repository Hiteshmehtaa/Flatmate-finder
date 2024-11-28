// Friends management
const friends = {
  async sendRequest(userId) {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      showNotification('Friend request sent successfully!');
      // Refresh the search results to update UI
      const searchForm = document.getElementById('searchForm');
      if (searchForm) {
        searchForm.dispatchEvent(new Event('submit'));
      }
      return data;
    } catch (error) {
      console.error('Friend request error:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async getRequests() {
    try {
      const response = await fetch('/api/friends/requests', {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      return await response.json();
    } catch (error) {
      console.error('Get requests error:', error);
      throw error;
    }
  },

  async acceptRequest(userId) {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      showNotification('Friend request accepted!');
      // Refresh the requests section immediately
      await showDashboardSection('requests');
      return data;
    } catch (error) {
      console.error('Accept request error:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async rejectRequest(userId) {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      showNotification('Friend request rejected');
      // Refresh the requests section immediately
      await showDashboardSection('requests');
      return data;
    } catch (error) {
      console.error('Reject request error:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async cancelRequest(userId) {
    try {
      const response = await fetch('/api/friends/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      showNotification('Friend request cancelled');
      // Refresh the requests section immediately
      await showDashboardSection('requests');
      return data;
    } catch (error) {
      console.error('Cancel request error:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async removeFriend(userId) {
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      showNotification('Friend removed successfully');
      // Refresh the friends section immediately
      await showDashboardSection('friends');
      return data;
    } catch (error) {
      console.error('Remove friend error:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  },

  confirmRemoveFriend(userId, username) {
    if (confirm(`Are you sure you want to remove ${username} from your friends list?`)) {
      this.removeFriend(userId).catch(error => {
        console.error('Error removing friend:', error);
        showNotification('Failed to remove friend. Please try again.', 'error');
      });
    }
  }
};