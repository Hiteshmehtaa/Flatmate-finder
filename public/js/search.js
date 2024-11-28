// Search functionality
const search = {
  async searchUsers(criteria) {
    try {
      // Filter out empty criteria and format them
      const validCriteria = {};
      if (criteria.college?.trim()) validCriteria.college = criteria.college.trim();
      if (criteria.location?.trim()) validCriteria.location = criteria.location.trim();
      if (criteria.budget && !isNaN(criteria.budget)) validCriteria.budget = criteria.budget;
      
      const queryString = new URLSearchParams(validCriteria).toString();
      const response = await fetch(`/api/users/search?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
      }

      const results = await response.json();
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  renderSearchResults(results) {
    const container = document.querySelector('.search-results');
    if (!results.length) {
      container.innerHTML = `
        <div class="neumorphic" style="text-align: center; padding: 2rem;">
          <p>No users found matching your criteria.</p>
          <p style="margin-top: 1rem; color: var(--text-color-light);">
            Try adjusting your search filters or broadening your search.
          </p>
        </div>`;
      return;
    }

    container.innerHTML = results.map(user => `
      <div class="user-card neumorphic">
        <img src="${user.profilePic}" 
             alt="${user.username}" 
             class="profile-pic"
             onerror="this.src='/uploads/default.jpg'">
        <h3>${user.username}</h3>
        <p class="college">${user.college || 'No college specified'}</p>
        ${user.preferences ? `
          <div class="preferences">
            ${user.preferences.budget ? 
              `<p>Budget: $${user.preferences.budget}/month</p>` : ''}
            ${user.preferences.location ? 
              `<p>Location: ${user.preferences.location}</p>` : ''}
            ${user.preferences.gender ? 
              `<p>Gender Preference: ${user.preferences.gender}</p>` : ''}
          </div>
        ` : ''}
        <button onclick="friends.sendRequest('${user._id}')" class="btn">
          Send Friend Request
        </button>
      </div>
    `).join('');
  }
};