package com.example.communityblog.repository;


import com.example.communityblog.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByBlogIdAndUserId(Long blogId, Long userId);

    int countByBlogId(Long blogId);

}
