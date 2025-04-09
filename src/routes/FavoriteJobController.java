package vn.hstore.jobhunter.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vn.hstore.jobhunter.domain.Job;
import vn.hstore.jobhunter.service.FavoriteJobService;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteJobController {

    private final FavoriteJobService favoriteJobService;

    @PostMapping("/{jobId}")
    public ResponseEntity<Job> addToFavorites(@RequestParam Long userId, @PathVariable Long jobId) {
        Job job = favoriteJobService.addToFavorites(userId, jobId);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Job> removeFromFavorites(@RequestParam Long userId, @PathVariable Long jobId) {
        Job job = favoriteJobService.removeFromFavorites(userId, jobId);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/{jobId}/toggle")
    public ResponseEntity<Job> toggleFavoriteJob(@RequestParam Long userId, @PathVariable Long jobId) {
        Job job = favoriteJobService.toggleFavoriteJob(userId, jobId);
        return ResponseEntity.ok(job);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getFavoriteJobs(@RequestParam Long userId) {
        return ResponseEntity.ok(favoriteJobService.getFavoriteJobs(userId));
    }
}
