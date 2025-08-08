// API Configuration
const API_URL = 'http://localhost:8080/api';

// Global variables
let currentUser = null;
let allBlogs = [];
let currentBlog = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    loadBlogs();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('search-input').addEventListener('input', function(e) {
        filterBlogs(e.target.value);
    });
    
    // Sort functionality
    document.getElementById('sort-select').addEventListener('change', function(e) {
        sortBlogs(e.target.value);
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('create-blog-form').addEventListener('submit', handleCreateBlog);
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Authentication functions
function loadUserFromStorage() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateUI();
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            saveUserToStorage();
            updateUI();
            closeModal('login-modal');
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const bio = document.getElementById('signup-bio').value;
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, bio })
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            saveUserToStorage();
            updateUI();
            closeModal('signup-modal');
            showNotification('Account created successfully!', 'success');
        } else {
            showNotification('Signup failed. Email or username might already exist.', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    saveUserToStorage();
    updateUI();
    showNotification('Logged out successfully!', 'success');
}

function updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const username = document.getElementById('username');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    if (currentUser) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        username.textContent = currentUser.username;
        getStartedBtn.textContent = 'Write Your First Blog';
        getStartedBtn.onclick = showCreateBlog;
    } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
        getStartedBtn.textContent = 'Get Started';
        getStartedBtn.onclick = getStarted;
    }
}

// Blog functions
async function loadBlogs() {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/blogs`);
        if (response.ok) {
            allBlogs = await response.json();
            displayBlogs(allBlogs);
            updateStats();
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

function displayBlogs(blogs) {
    const grid = document.getElementById('blogs-grid');
    const noBlogs = document.getElementById('no-blogs');
    
    if (blogs.length === 0) {
        grid.innerHTML = '';
        noBlogs.classList.remove('hidden');
        return;
    }
    
    noBlogs.classList.add('hidden');
    
    grid.innerHTML = blogs.map(blog => `
        <div class="blog-card" onclick="showBlogDetail(${blog.id})">
            <h3>${escapeHtml(blog.title)}</h3>
            <p>${escapeHtml(truncateText(blog.content, 150))}</p>
            <div class="blog-meta">
                <span class="blog-author">By ${escapeHtml(blog.author.username)}</span>
                <span class="blog-date">${formatDate(blog.createAt)}</span>
            </div>
            <div class="blog-actions" onclick="event.stopPropagation()">
                <div class="blog-stats">
                    <span><i class="fas fa-heart"></i> <span id="likes-${blog.id}">0</span></span>
                    <span><i class="fas fa-comment"></i> <span id="comments-${blog.id}">0</span></span>
                </div>
                <div class="blog-buttons">
                    ${currentUser ? `<button class="btn btn-small btn-primary" onclick="toggleLike(${blog.id})">Like</button>` : ''}
                    ${currentUser && currentUser.id === blog.author.id ? `
                        <button class="btn btn-small btn-secondary" onclick="editBlog(${blog.id})">Edit</button>
                        <button class="btn btn-small" style="background: #dc3545; color: white;" onclick="deleteBlog(${blog.id})">Delete</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Load stats for each blog
    blogs.forEach(blog => {
        loadBlogStats(blog.id);
    });
}

async function loadBlogStats(blogId) {
    try {
        // Load like count
        const likeResponse = await fetch(`${API_URL}/likes/count/${blogId}`);
        if (likeResponse.ok) {
            const likeCount = await likeResponse.json();
            const likeElement = document.getElementById(`likes-${blogId}`);
            if (likeElement) likeElement.textContent = likeCount;
        }
        
        // Load comment count
        const commentResponse = await fetch(`${API_URL}/comments/blog/${blogId}`);
        if (commentResponse.ok) {
            const comments = await commentResponse.json();
            const commentElement = document.getElementById(`comments-${blogId}`);
            if (commentElement) commentElement.textContent = comments.length;
        }
    } catch (error) {
        console.error('Error loading blog stats:', error);
    }
}

async function handleCreateBlog(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to create a blog.', 'warning');
        return;
    }
    
    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    
    try {
        const response = await fetch(`${API_URL}/blogs/create?authorId=${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            closeModal('create-blog-modal');
            document.getElementById('create-blog-form').reset();
            showNotification('Blog created successfully!', 'success');
            loadBlogs();
        } else {
            showNotification('Failed to create blog. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating blog:', error);
        showNotification('Failed to create blog. Please try again.', 'error');
    }
}

async function showBlogDetail(blogId) {
    try {
        const response = await fetch(`${API_URL}/blogs/${blogId}`);
        if (response.ok) {
            currentBlog = await response.json();
            
            // Load comments
            const commentResponse = await fetch(`${API_URL}/comments/blog/${blogId}`);
            const comments = commentResponse.ok ? await commentResponse.json() : [];
            
            // Load like count
            const likeResponse = await fetch(`${API_URL}/likes/count/${blogId}`);
            const likeCount = likeResponse.ok ? await likeResponse.json() : 0;
            
            displayBlogDetail(currentBlog, comments, likeCount);
            showModal('blog-detail-modal');
        }
    } catch (error) {
        console.error('Error loading blog detail:', error);
        showNotification('Failed to load blog details.', 'error');
    }
}

function displayBlogDetail(blog, comments, likeCount) {
    const content = document.getElementById('blog-detail-content');
    const isOwner = currentUser && currentUser.id === blog.author.id;
    
    content.innerHTML = `
        <div class="blog-detail">
            <h1>${escapeHtml(blog.title)}</h1>
            <div class="blog-detail-meta">
                <div>
                    <strong>By ${escapeHtml(blog.author.username)}</strong>
                    <span> • ${formatDate(blog.createAt)}</span>
                </div>
                <div>
                    <span><i class="fas fa-heart"></i> ${likeCount}</span>
                    <span><i class="fas fa-comment"></i> ${comments.length}</span>
                </div>
            </div>
            
            ${currentUser ? `
                <div class="blog-detail-actions">
                    <button class="btn btn-primary" onclick="toggleLike(${blog.id})">
                        <i class="fas fa-heart"></i> Like
                    </button>
                    ${isOwner ? `
                        <button class="btn btn-secondary" onclick="editBlog(${blog.id})">Edit</button>
                        <button class="btn" style="background: #dc3545; color: white;" onclick="deleteBlog(${blog.id})">Delete</button>
                    ` : ''}
                </div>
            ` : ''}
            
            <div class="blog-detail-content">
                ${formatContent(blog.content)}
            </div>
            
            <div class="comments-section">
                <h3>Comments (${comments.length})</h3>
                
                ${currentUser ? `
                    <div class="comment-form">
                        <textarea id="comment-input" placeholder="Write a comment..." rows="3"></textarea>
                        <button class="btn btn-primary" onclick="addComment()">Post Comment</button>
                    </div>
                ` : ''}
                
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${escapeHtml(comment.author.username)}</span>
                                <div>
                                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                                    ${currentUser && currentUser.id === comment.author.id ? `
                                        <button class="btn btn-small" style="background: #dc3545; color: white; margin-left: 10px;" onclick="deleteComment(${comment.id})">Delete</button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="comment-content">${formatContent(comment.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

async function addComment() {
    if (!currentUser) {
        showNotification('Please login to comment.', 'warning');
        return;
    }
    
    const content = document.getElementById('comment-input').value.trim();
    if (!content) {
        showNotification('Please write a comment.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/comments/add?blogId=${currentBlog.id}&authorId=${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            showNotification('Comment added!', 'success');
            showBlogDetail(currentBlog.id); // Refresh the blog detail
        } else {
            showNotification('Failed to add comment.', 'error');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment.', 'error');
    }
}

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        const response = await fetch(`${API_URL}/comments/${commentId}/delete?authorId=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Comment deleted!', 'success');
            showBlogDetail(currentBlog.id); // Refresh the blog detail
        } else {
            showNotification('Failed to delete comment.', 'error');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification('Failed to delete comment.', 'error');
    }
}

async function toggleLike(blogId) {
    if (!currentUser) {
        showNotification('Please login to like posts.', 'warning');
        return;
    }
    
    try {
        // Try to add like first
        const response = await fetch(`${API_URL}/likes/add?blogId=${blogId}&userId=${currentUser.id}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Liked!', 'success');
        } else {
            // If add fails, try to remove like
            const removeResponse = await fetch(`${API_URL}/likes/remove?blogId=${blogId}&userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            
            if (removeResponse.ok) {
                showNotification('Unliked!', 'success');
            }
        }
        
        // Refresh stats
        loadBlogStats(blogId);
        if (currentBlog && currentBlog.id === blogId) {
            showBlogDetail(blogId); // Refresh if viewing detail
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Failed to update like.', 'error');
    }
}

async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
        const response = await fetch(`${API_URL}/blogs/${blogId}/delete?authorId=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Blog deleted!', 'success');
            closeModal('blog-detail-modal');
            loadBlogs();
        } else {
            showNotification('Failed to delete blog.', 'error');
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
        showNotification('Failed to delete blog.', 'error');
    }
}

function editBlog(blogId) {
    showNotification('Edit feature coming soon!', 'warning');
}

// Utility functions
function filterBlogs(searchTerm) {
    if (!searchTerm.trim()) {
        displayBlogs(allBlogs);
        return;
    }
    
    const filtered = allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displayBlogs(filtered);
}

function sortBlogs(sortBy) {
    let sorted = [...allBlogs];
    
    switch (sortBy) {
        case 'latest':
            sorted.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createAt) - new Date(b.createAt));
            break;
        case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    displayBlogs(sorted);
}

function updateStats() {
    // This would update the hero stats if you want to add them back
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
}

function showEmptyState() {
    const noBlogs = document.getElementById('no-blogs');
    noBlogs.classList.remove('hidden');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatContent(content) {
    return content.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = '';
}

function showLogin() {
    closeModal('signup-modal');
    showModal('login-modal');
}

function showSignup() {
    closeModal('login-modal');
    showModal('signup-modal');
}

function showCreateBlog() {
    if (!currentUser) {
        showNotification('Please login to create a blog.', 'warning');
        showLogin();
        return;
    }
    showModal('create-blog-modal');
}

function getStarted() {
    if (currentUser) {
        showCreateBlog();
    } else {
        showSignup();
    }
}

// Notification functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    document.getElementById('notification').classList.add('hidden');
}
