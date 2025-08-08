package com.example.communityblog.service;


import com.example.communityblog.model.Blog;
import com.example.communityblog.model.Comment;
import com.example.communityblog.repository.BlogRepository;
import com.example.communityblog.repository.CommentRepository;
import com.example.communityblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Comment comment, Long blogId, Long autherId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        comment.setBlog(blog);
        comment.setAuthor(userRepository.findById(autherId)
                .orElseThrow(() -> new RuntimeException("Auther not found")));
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByBlogId(Long blogId) {
        return commentRepository.findByBlogId(blogId);
    }

    public void deleteComment(Long commentId, Long autherId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(autherId)) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
