package smart_campus.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import smart_campus.Service.IssueService;
import smart_campus.dto.IssueRequest;
import smart_campus.dto.IssueResponse;
import smart_campus.dto.IssueUpdateRequest;
import smart_campus.entity.Issue;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @RequestBody IssueRequest request) {

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setPriority(request.getPriority());
        issue.setLocation(request.getLocation());

        Issue created = issueService.createIssue(issue);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(created));
    }

    // GET ALL
    @GetMapping
    public List<IssueResponse> getAllIssues() {

        return issueService.getAllIssues()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // SEARCH
    @GetMapping("/search")
    public List<IssueResponse> searchIssues(
            @RequestParam String keyword) {

        return issueService.searchIssues(keyword)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // PAGINATION
    @GetMapping("/page")
    public Page<IssueResponse> getIssues(Pageable pageable) {

        return issueService.getIssues(pageable)
                .map(this::toResponse);
    }

    // FILTER BY PRIORITY
   @GetMapping("/filter")
public List<IssueResponse> filterIssues(
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String category) {

    return issueService
            .filterIssues(priority, status, category)
            .stream()
            .map(this::toResponse)
            .toList();
}
    // GET BY ID
    @GetMapping("/{id}")
    public IssueResponse getIssueById(@PathVariable Long id) {

        return toResponse(issueService.getIssueById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public IssueResponse updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueUpdateRequest request) {

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setPriority(request.getPriority());
        issue.setLocation(request.getLocation());

        return toResponse(issueService.updateIssue(id, issue));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {

        issueService.deleteIssue(id);

        return ResponseEntity.noContent().build();
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    public IssueResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return toResponse(issueService.updateStatus(id, status));
    }

    // ENTITY → DTO
    private IssueResponse toResponse(Issue issue) {

        IssueResponse response = new IssueResponse();

        response.setId(issue.getId());
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setCategory(issue.getCategory());
        response.setPriority(issue.getPriority());
        response.setStatus(issue.getStatus());
        response.setLocation(issue.getLocation());

        return response;
    }
}