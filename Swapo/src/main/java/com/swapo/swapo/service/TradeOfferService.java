package com.swapo.swapo.service;

import com.swapo.swapo.model.Producto;
import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.model.TradeStatus;
import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.ProductoRepository;
import com.swapo.swapo.repository.TradeOfferRepository;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.swapo.swapo.dto.TradeOfferDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TradeOfferService
{
    @Autowired
    private TradeOfferRepository tradeOfferRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ValidadorTruequeService validadorTruequeService;

    @Transactional
    public TradeOffer crearPropuesta(String emisorNombre, String receptorNombre,
                                     Long productoOfrecidoId, Long productoDeseadoId,
                                     Double diferenciaDinero)
    {
        Usuario emisor = usuarioRepository.findByUsername(emisorNombre)
                .orElseThrow(() -> new RuntimeException("Emisor no encontrado: " + emisorNombre));
        Usuario receptor = usuarioRepository.findByUsername(receptorNombre)
                .orElseThrow(() -> new RuntimeException("Receptor no encontrado: " + receptorNombre));

        Producto productoOfrecido = productoRepository.findById(productoOfrecidoId)
                .orElseThrow(() -> new RuntimeException("Producto ofrecido no encontrado"));
        Producto productoDeseado = productoRepository.findById(productoDeseadoId)
                .orElseThrow(() -> new RuntimeException("Producto deseado no encontrado"));

        TradeOffer oferta = new TradeOffer();
        oferta.setEmisor(emisor);
        oferta.setReceptor(receptor);
        oferta.setProductoOfrecido(productoOfrecido);
        oferta.setProductoDeseado(productoDeseado);
        oferta.setDiferenciaDinero(diferenciaDinero != null ? diferenciaDinero : 0);
        oferta.setEstado(TradeStatus.PENDIENTE);

        return tradeOfferRepository.save(oferta);
    }

    @Transactional
    public TradeOffer aceptarPropuesta(Long id)
    {
        TradeOffer oferta = tradeOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));
        oferta.setEstado(TradeStatus.ACEPTADO);
        return tradeOfferRepository.save(oferta);
    }

    @Transactional
    public TradeOffer rechazarPropuesta(Long id)
    {
        TradeOffer oferta = tradeOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));
        oferta.setEstado(TradeStatus.RECHAZADO);
        return tradeOfferRepository.save(oferta);
    }

    public TradeOfferDTO crearOfertaLimpia(TradeOffer oferta, String mensajeIA)
    {
        TradeOfferDTO dto = new TradeOfferDTO();
        dto.setId(oferta.getId());
        dto.setFechaCreacion(oferta.getFechaCreacion());
        dto.setEstado(oferta.getEstado().toString());
        dto.setAnalisisIA(mensajeIA);

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

        return dto;
    }

    public List<TradeOfferDTO> obtenerTodasDTO()
    {
        List<TradeOffer> ofertas = tradeOfferRepository.findAll();
        return ofertas.stream().map(o -> crearOfertaLimpia(o, validadorTruequeService.validarTrueque(o))).collect(Collectors.toList());
    }

    public List<TradeOffer> obtenerTodas()
    {
        return tradeOfferRepository.findAll();
    }

    @Transactional
    public void eliminarPropuesta(Long id)
    {
        TradeOffer oferta = tradeOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));
        tradeOfferRepository.delete(oferta);
    }
}