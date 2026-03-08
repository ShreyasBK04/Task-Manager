package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.enums.Priority;
import com.taskmanager.entity.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Filter by status
    Page<Task> findByStatus(Status status, Pageable pageable);

    // Filter by priority
    Page<Task> findByPriority(Priority priority, Pageable pageable);

    // Filter by status and priority
    Page<Task> findByStatusAndPriority(Status status, Priority priority, Pageable pageable);

    // Search by title (case-insensitive)
    Page<Task> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Search by title with status filter
    Page<Task> findByTitleContainingIgnoreCaseAndStatus(String title, Status status, Pageable pageable);

    // Search by title with priority filter
    Page<Task> findByTitleContainingIgnoreCaseAndPriority(String title, Priority priority, Pageable pageable);

    // Search by title with status and priority filter
    Page<Task> findByTitleContainingIgnoreCaseAndStatusAndPriority(
            String title, Status status, Priority priority, Pageable pageable);

    // Custom query: filter with all optional params
    @Query("SELECT t FROM Task t WHERE " +
            "(:title IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByFilters(
            @Param("title") String title,
            @Param("status") Status status,
            @Param("priority") Priority priority,
            Pageable pageable);
}