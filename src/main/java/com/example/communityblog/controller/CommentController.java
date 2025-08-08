package com.example.communityblog.controller;

import com.example.communityblog.model.Comment;
import com.example.communityblog.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment, @RequestParam Long blogId, @RequestParam Long authorId) {
        return commentService.addComment(comment, blogId, authorId);
    }

    @GetMapping("/blog/{blogId}")
    public List<Comment> getCommentsByBlogId(@PathVariable Long blogId) {
        return commentService.getCommentsByBlogId(blogId);
    }

    @DeleteMapping("/{id}/delete")
    public void deleteComment(@PathVariable Long id, @RequestParam Long authorId) {
        commentService.deleteComment(id, authorId);
    }
}