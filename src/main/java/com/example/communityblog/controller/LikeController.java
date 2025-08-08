package com.example.communityblog.controller;

import com.example.communityblog.model.Like;
import com.example.communityblog.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/add")
    public Like addLike(@RequestParam Long blogId, @RequestParam Long userId) {
        return likeService.addLike(blogId, userId);
    }

    @DeleteMapping("/remove")
    public void unlikeBlog(@RequestParam Long blogId, @RequestParam Long userId) {
        likeService.unlikeBlog(blogId, userId);
    }

    @GetMapping("/count/{blogId}")
    public int countLikesForBlog(@PathVariable Long blogId) {
        return likeService.countLikesForBlog(blogId);
    }
}
