// Profile management
const profile = {
  async updateProfile(formData) {
    try {
      // Convert preferences to JSON string
      const preferencesData = {
        budget: formData.get('budget'),
        location: formData.get('location'),
        gender: formData.get('gender'),
        roomType: formData.get('roomType')
      };
      formData.set('preferences', JSON.stringify(preferencesData));
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      showNotification('Profile updated successfully!', 'success');
      return data.user;
    } catch (error) {
      console.error('Profile update error:', error);
      showNotification(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  },

  async getProfile(userId = null) {
    try {
      const url = userId ? `/api/users/${userId}` : '/api/users/profile';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }
};