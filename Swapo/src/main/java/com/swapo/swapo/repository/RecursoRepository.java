package com.swapo.swapo.repository;

import com.swapo.swapo.model.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface RecursoRepository extends JpaRepository<Recurso ,Long>
{ }
