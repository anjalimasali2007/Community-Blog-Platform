package com.example.communityblog.controller;

import com.example.communityblog.model.Blog;
import com.example.communityblog.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping("/create")
    public Blog createBlog(@RequestBody Blog blog, @RequestParam Long authorId) {
        return blogService.createBlog(blog, authorId);
    }

    @GetMapping
    public List<Blog> getAllBlogs() {
        return blogService.getAllBlogs();
    }

    @GetMapping("/author/{authorId}")
    public List<Blog> getBlogsByAuthor(@PathVariable Long authorId) {
        return blogService.getBlogsByAuthor(authorId);
    }

    @GetMapping("/{id}")
    public Blog getBlogById(@PathVariable Long id) {
        return blogService.getBlogById(id);
    }

    @PutMapping("/{id}/update")
    public Blog updateBlog(@RequestBody Blog updatedBlog, @PathVariable Long id, @RequestParam Long authorId) {
        return blogService.updateBlog(updatedBlog, id, authorId);
    }

    @DeleteMapping("/{id}/delete")
    public void deleteBlog(@PathVariable Long id, @RequestParam Long authorId) {
        blogService.deleteBlog(id, authorId);
    }
}
