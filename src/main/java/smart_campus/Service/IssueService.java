package smart_campus.Service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import smart_campus.entity.Issue;
import smart_campus.exception.IssueNotFoundException;
import smart_campus.repository.IssueRepository;

@Service
public class IssueService {

    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    // CREATE
    public Issue createIssue(Issue issue) {

        issue.setStatus("OPEN");

        return issueRepository.save(issue);
    }

    // GET ALL
    public List<Issue> getAllIssues() {

        return issueRepository.findAll();
    }

    // PAGINATION
    public Page<Issue> getIssues(Pageable pageable) {

        return issueRepository.findAll(pageable);
    }

    // GET BY ID
    public Issue getIssueById(Long id) {

        return issueRepository.findById(id)
                .orElseThrow(() ->
                        new IssueNotFoundException(
                                "Issue not found with id: " + id));
    }

    // UPDATE
    public Issue updateIssue(Long id, Issue issue) {

        Issue existingIssue = getIssueById(id);

        existingIssue.setTitle(issue.getTitle());
        existingIssue.setDescription(issue.getDescription());
        existingIssue.setCategory(issue.getCategory());
        existingIssue.setPriority(issue.getPriority());
        existingIssue.setLocation(issue.getLocation());

        return issueRepository.save(existingIssue);
    }

    // DELETE
    public void deleteIssue(Long id) {

        Issue issue = getIssueById(id);

        issueRepository.delete(issue);
    }

    // FILTER BY PRIORITY
    public List<Issue> getIssuesByPriority(String priority) {

        return issueRepository.findByPriority(priority);
    }

    // UPDATE STATUS
    public Issue updateStatus(Long id, String status) {

        Issue issue = getIssueById(id);

        issue.setStatus(status);

        return issueRepository.save(issue);
    }

    // SEARCH
    public List<Issue> searchIssues(String keyword) {

        return issueRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        keyword, keyword);
    }
    public List<Issue> filterIssues(
        String priority,
        String status,
        String category) {

    if (priority != null && status != null && category != null) {
        return issueRepository
                .findByPriorityAndStatusAndCategory(
                        priority, status, category);
    }

    if (priority != null) {
        return issueRepository.findByPriority(priority);
    }

    if (status != null) {
        return issueRepository.findByStatus(status);
    }

    if (category != null) {
        return issueRepository.findByCategory(category);
    }

    return issueRepository.findAll();
}
}