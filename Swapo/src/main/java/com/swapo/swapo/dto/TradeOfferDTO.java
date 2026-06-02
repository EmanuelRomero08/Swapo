package com.swapo.swapo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TradeOfferDTO
{
    private Long id;
    private String emisorNombre;
    private String receptorNombre;
    private String productoOfrecidoNombre;
    private Double productoOfrecidoPrecio;
    private String productoDeseadoNombre;
    private Double productoDeseadoPrecio;
    private String estado;
    private String analisisIA;
    private LocalDateTime fechaCreacion;
    private Double diferenciaDinero;

    public Double getDiferenciaDinero() {
    return diferenciaDinero;
    }

    public void setDiferenciaDinero(Double diferenciaDinero) {
        this.diferenciaDinero = diferenciaDinero;
    }

    private String escrowStatus;

    public String getEscrowStatus() {
        return escrowStatus;
    }

    public void setEscrowStatus(String escrowStatus) {
        this.escrowStatus = escrowStatus;
    }
}

