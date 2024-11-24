package com.example.backend.repo;

import com.example.backend.model.Opravilo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OpraviloRepo extends JpaRepository<Opravilo, Long> {
        List<Opravilo> findByAktivnostContainingIgnoreCase(String aktivnost);

        List<Opravilo> findBydatumCas(LocalDateTime cas);
        
        // Poišče opravila za določenega uporabnika
        List<Opravilo> findByUporabnikId(Long uporabnikId);
        List<Opravilo> findByReminderMethodAndDatumCasBetween(
                String reminderMethod, LocalDateTime start, LocalDateTime end
        );


}
