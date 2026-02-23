package com.app.todoapp.controller;

import com.app.todoapp.models.Task;
import com.app.todoapp.services.TaskService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }
    @GetMapping
    public String getTasks( Model model){
        List<Task> tasks =taskService.getAllTasks();
        model.addAttribute("tasks",tasks);
        return "tasks";
    }

@PostMapping
public String createTask(@RequestParam String title){
    taskService.createTask(title);
    return "redirect:/";
}
    @GetMapping("/{id}/delete")
    public String deleteTasks(@PathVariable Long id){
       taskService.deleteTask(id);
        return "redirect:/";
    }

    @GetMapping("/{id}/toggle")
    public String toggleTasks(@PathVariable Long id){
        taskService.toggleTask(id);
        return "redirect:/";
    }
}