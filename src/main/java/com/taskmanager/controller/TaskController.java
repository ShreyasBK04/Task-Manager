package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.TaskRequestDTO;
import com.taskmanager.dto.TaskResponseDTO;
import com.taskmanager.entity.enums.Priority;
import com.taskmanager.entity.enums.Status;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    /**
     * POST /api/v1/tasks
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponseDTO>> createTask(
            @Valid @RequestBody TaskRequestDTO requestDTO) {
        log.info("REST request to create task: {}", requestDTO.getTitle());
        TaskResponseDTO createdTask = taskService.createTask(requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdTask, "Task created successfully"));
    }

    /**
     * GET /api/v1/tasks/{id}
     * Get a task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> getTaskById(@PathVariable Long id) {
        log.info("REST request to get task with id: {}", id);
        TaskResponseDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(task, "Task retrieved successfully"));
    }

    /**
     * GET /api/v1/tasks
     * Get all tasks with optional filtering, searching, and pagination
     * Query params: page, size, sortBy, sortDir, title, status, priority
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskResponseDTO>>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority) {

        log.info("REST request to get tasks - page: {}, size: {}, title: {}, status: {}, priority: {}",
                page, size, title, status, priority);

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TaskResponseDTO> tasks;
        if (title != null || status != null || priority != null) {
            tasks = taskService.getTasksByFilters(title, status, priority, pageable);
        } else {
            tasks = taskService.getAllTasks(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(tasks, "Tasks retrieved successfully"));
    }

    /**
     * PUT /api/v1/tasks/{id}
     * Update a task completely
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO requestDTO) {
        log.info("REST request to update task with id: {}", id);
        TaskResponseDTO updatedTask = taskService.updateTask(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task updated successfully"));
    }

    /**
     * PATCH /api/v1/tasks/{id}/status
     * Update only the status of a task
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        log.info("REST request to update status of task id: {} to {}", id, status);
        TaskResponseDTO updatedTask = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task status updated successfully"));
    }

    /**
     * DELETE /api/v1/tasks/{id}
     * Delete a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        log.info("REST request to delete task with id: {}", id);
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }
}