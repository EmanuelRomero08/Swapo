package com.swapo.swapo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "trade_offers")
public class TradeOffer
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisor;

    @ManyToOne
    @JoinColumn(name = "receptor_id", nullable = false)
    private Usuario receptor;

    @ManyToOne
    @JoinColumn(name = "producto_ofrecido_id", nullable = false)
    private Producto productoOfrecido;

    @ManyToOne
    @JoinColumn(name = "producto_deseado_id", nullable = false)
    private Producto productoDeseado;

    private Double diferenciaDinero;

    @Enumerated(EnumType.STRING)
    private TradeStatus estado = TradeStatus.PENDIENTE;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public TradeOffer() {}

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Usuario getEmisor()
    {
        return emisor;
    }

    public void setEmisor(Usuario emisor)
    {
        this.emisor = emisor;
    }

    public Usuario getReceptor()
    {
        return receptor;
    }

    public void setReceptor(Usuario receptor)
    {
        this.receptor = receptor;
    }

    public Producto getProductoOfrecido()
    {
        return productoOfrecido;
    }

    public void setProductoOfrecido(Producto productoOfrecido)
    {
        this.productoOfrecido = productoOfrecido;
    }

    public Producto getProductoDeseado()
    {
        return productoDeseado;
    }

    public void setProductoDeseado(Producto productoDeseado)
    {
        this.productoDeseado = productoDeseado;
    }

    public Double getDiferenciaDinero()
    {
        return diferenciaDinero;
    }

    public void setDiferenciaDinero(Double diferenciaDinero)
    {
        this.diferenciaDinero = diferenciaDinero;
    }

    public TradeStatus getEstado()
    {
        return estado;
    }

    public void setEstado(TradeStatus estado)
    {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion()
    {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion)
    {
        this.fechaCreacion = fechaCreacion;
    }
}