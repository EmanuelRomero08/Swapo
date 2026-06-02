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

    @Column(name = "payment_id")
    private String paymentId; // ID de la transacción en Mercado Pago

    @Column(name = "escrow_status")
    private String escrowStatus; // 'PENDIENTE', 'RETENIDO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'

    @Column(name = "sender_confirmed_shipment")
    private boolean senderConfirmedShipment; 

    @Column(name = "receiver_confirmed_shipment")
    private boolean receiverConfirmedShipment; 

    @Column(name = "sender_confirmed_receipt")
    private boolean senderConfirmedReceipt; 

    @Column(name = "receiver_confirmed_receipt")
    private boolean receiverConfirmedReceipt; 

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getEscrowStatus() { return escrowStatus; }
    public void setEscrowStatus(String escrowStatus) { this.escrowStatus = escrowStatus; }

    public boolean isSenderConfirmedShipment() { return senderConfirmedShipment; }
    public void setSenderConfirmedShipment(boolean senderConfirmedShipment) { this.senderConfirmedShipment = senderConfirmedShipment; }

    public boolean isReceiverConfirmedShipment() { return receiverConfirmedShipment; }
    public void setReceiverConfirmedShipment(boolean receiverConfirmedShipment) { this.receiverConfirmedShipment = receiverConfirmedShipment; }

    public boolean isSenderConfirmedReceipt() { return senderConfirmedReceipt; }
    public void setSenderConfirmedReceipt(boolean senderConfirmedReceipt) { this.senderConfirmedReceipt = senderConfirmedReceipt; }

    public boolean isReceiverConfirmedReceipt() { return receiverConfirmedReceipt; }
    public void setReceiverConfirmedReceipt(boolean receiverConfirmedReceipt) { this.receiverConfirmedReceipt = receiverConfirmedReceipt; }
}
