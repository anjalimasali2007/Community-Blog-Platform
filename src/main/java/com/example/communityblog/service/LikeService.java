package com.example.communityblog.service;

import com.example.communityblog.model.Like;
import com.example.communityblog.repository.BlogRepository;
import com.example.communityblog.repository.LikeRepository;
import com.example.communityblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    public Like addLike(Long blogId, Long userId){
        if (likeRepository.findByBlogIdAndUserId(blogId, userId).isPresent()){
            throw new RuntimeException("Blog already liked by this user!");
        }

        Like like = new Like();
        like.setBlog(blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found!")));
        like.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        return likeRepository.save(like);
    }

    public void unlikeBlog(Long blogId, Long userId){
        Like like = likeRepository.findByBlogIdAndUserId(blogId, userId)
                .orElseThrow(() -> new RuntimeException("Like not found!"));
        likeRepository.delete(like);
    }

    public int countLikesForBlog(Long blogId){
        return likeRepository.countByBlogId(blogId);
    }
}
