package com.PrepaidSystem.project.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.PrepaidSystem.project.model.Payments;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payments, Long> {
    List<Payments> findByUser_UserId(Long userId);

    List<Payments> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);

    List<Payments> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
