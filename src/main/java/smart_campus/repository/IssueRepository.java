package smart_campus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import smart_campus.entity.Issue;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    // FILTER BY PRIORITY
    List<Issue> findByPriority(String priority);

    // SEARCH BY TITLE OR DESCRIPTION
    List<Issue> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description);
            List<Issue> findByStatus(String status);

List<Issue> findByCategory(String category);

List<Issue> findByPriorityAndStatusAndCategory(
        String priority,
        String status,
        String category);
}
