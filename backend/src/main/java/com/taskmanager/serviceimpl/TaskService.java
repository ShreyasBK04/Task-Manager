package com.taskmanager.serviceimpl;

import com.taskmanager.dto.TaskRequestDTO;
import com.taskmanager.dto.TaskResponseDTO;
import com.taskmanager.entity.enums.Priority;
import com.taskmanager.entity.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {

    TaskResponseDTO createTask(TaskRequestDTO requestDTO);

    TaskResponseDTO getTaskById(Long id);

    Page<TaskResponseDTO> getAllTasks(Pageable pageable);

    Page<TaskResponseDTO> getTasksByFilters(String title, Status status, Priority priority, Pageable pageable);

    TaskResponseDTO updateTask(Long id, TaskRequestDTO requestDTO);

    TaskResponseDTO updateTaskStatus(Long id, Status status);

    void deleteTask(Long id);
}