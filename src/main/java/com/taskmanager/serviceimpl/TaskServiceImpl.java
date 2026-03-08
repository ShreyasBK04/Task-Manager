package com.taskmanager.serviceimpl;

import com.taskmanager.dto.TaskRequestDTO;
import com.taskmanager.dto.TaskResponseDTO;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.enums.Priority;
import com.taskmanager.entity.enums.Status;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Override
    public TaskResponseDTO createTask(TaskRequestDTO requestDTO) {
        log.debug("Creating new task with title: {}", requestDTO.getTitle());
        Task task = taskMapper.toEntity(requestDTO);
        Task savedTask = taskRepository.save(task);
        log.info("Task created successfully with id: {}", savedTask.getId());
        return taskMapper.toResponseDTO(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDTO getTaskById(Long id) {
        log.debug("Fetching task with id: {}", id);
        Task task = findTaskById(id);
        return taskMapper.toResponseDTO(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getAllTasks(Pageable pageable) {
        log.debug("Fetching all tasks with pagination: {}", pageable);
        return taskRepository.findAll(pageable)
                .map(taskMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getTasksByFilters(String title, Status status, Priority priority, Pageable pageable) {
        log.debug("Fetching tasks with filters - title: {}, status: {}, priority: {}", title, status, priority);
        return taskRepository.findByFilters(title, status, priority, pageable)
                .map(taskMapper::toResponseDTO);
    }

    @Override
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO requestDTO) {
        log.debug("Updating task with id: {}", id);
        Task task = findTaskById(id);
        taskMapper.updateEntityFromDTO(requestDTO, task);
        Task updatedTask = taskRepository.save(task);
        log.info("Task updated successfully with id: {}", updatedTask.getId());
        return taskMapper.toResponseDTO(updatedTask);
    }

    @Override
    public TaskResponseDTO updateTaskStatus(Long id, Status status) {
        log.debug("Updating status for task id: {} to {}", id, status);
        Task task = findTaskById(id);
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        log.info("Task status updated for id: {} to {}", id, status);
        return taskMapper.toResponseDTO(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        log.debug("Deleting task with id: {}", id);
        Task task = findTaskById(id);
        taskRepository.delete(task);
        log.info("Task deleted successfully with id: {}", id);
    }

    private Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }
}