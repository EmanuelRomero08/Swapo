package com.swapo.swapo.repository;

import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.model.TradeStatus;
import com.swapo.swapo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;

@Repository
public interface TradeOfferRepository extends JpaRepository<TradeOffer, Long>
{
    List<TradeOffer> findByEmisor(Usuario emisor);
    List<TradeOffer> findByReceptor(Usuario receptor);
    List<TradeOffer> findByEstado(TradeStatus estado);
    Optional<TradeOffer> findByPaymentId(String paymentId);
    

}