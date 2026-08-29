package smart_campus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import smart_campus.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}