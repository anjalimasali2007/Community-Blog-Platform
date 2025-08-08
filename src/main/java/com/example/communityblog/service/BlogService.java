package com.example.communityblog.service;

import com.example.communityblog.model.Blog;
import com.example.communityblog.repository.BlogRepository;
import com.example.communityblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    public Blog createBlog(Blog blog, Long authorId) {
        blog.setAuthor(userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found!")));
        return blogRepository.save(blog);
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> getBlogsByAuthor(Long authorId) {
        return blogRepository.findByAuthorId(authorId);
    }

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found!"));
    }

    public Blog updateBlog(Blog updatedBlog, Long blogId, Long authorId) {
        Blog existingBlog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!existingBlog.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("You are not authorized to update this blog!");
        }

        existingBlog.setTitle(updatedBlog.getTitle());
        existingBlog.setContent(updatedBlog.getContent());
        return blogRepository.save(existingBlog);
    }

    public void deleteBlog(Long blogId, Long authorId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("You are not authorized to delete this blog!");
        }

        blogRepository.delete(blog);
    }
}
