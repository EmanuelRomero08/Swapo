package com.swapo.swapo.service;

import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.model.TradeStatus;
import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.TradeOfferRepository;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.swapo.swapo.dto.TradeOfferDTO;

import java.util.List;

@Service
public class TradeOfferService
{
    @Autowired
    private TradeOfferRepository tradeOfferRepository;

    @Autowired
    private UsuarioRepository usuarioRepository; // Para buscar los nombres reales

    @Transactional
    public TradeOffer crearPropuesta(TradeOffer oferta)
    {
        /*Usuario emisorCompleto = usuarioRepository.findById(oferta.getEmisor().getId()).orElseThrow(() -> new RuntimeException("Emisor no encontrado con ID: " + oferta.getEmisor().getId()));

        Usuario receptorCompleto = usuarioRepository.findById(oferta.getReceptor().getId()).orElseThrow(() -> new RuntimeException("Receptor no encontrado con ID: " + oferta.getReceptor().getId()));

        oferta.setEmisor(emisorCompleto);
        oferta.setReceptor(receptorCompleto);

         */
        oferta.setEstado(TradeStatus.PENDIENTE);

        return oferta;
    }

    @Transactional
    public TradeOffer aceptarPropuesta(Long id)
    {
        TradeOffer oferta = tradeOfferRepository.findById(id).orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

        oferta.setEstado(TradeStatus.ACEPTADO);

        return tradeOfferRepository.save(oferta);
    }

    public TradeOfferDTO crearOfertaLimpia(TradeOffer oferta, String mensajeIA)
    {
        TradeOfferDTO dto = new TradeOfferDTO();
        dto.setId(oferta.getId());

        if (oferta.getEmisor() != null)
        {
            dto.setEmisorNombre(oferta.getEmisor().getUsername());
        }
        if (oferta.getReceptor() != null)
        {
            dto.setReceptorNombre(oferta.getReceptor().getUsername());
        }

        if (oferta.getProductoOfrecido() != null)
        {
            dto.setProductoOfrecidoNombre(oferta.getProductoOfrecido().getNombre());
            dto.setProductoOfrecidoPrecio(oferta.getProductoOfrecido().getPrecio());
        }
        if (oferta.getProductoDeseado() != null)
        {
            dto.setProductoDeseadoNombre(oferta.getProductoDeseado().getNombre());
            dto.setProductoDeseadoPrecio(oferta.getProductoDeseado().getPrecio());
        }

        dto.setEstado(oferta.getEstado().toString());
        dto.setAnalisisIA(mensajeIA);
        dto.setFechaCreacion(oferta.getFechaCreacion());

        return dto;
    }

    public List<TradeOffer> obtenerTodas() {
        return tradeOfferRepository.findAll();
    }
}