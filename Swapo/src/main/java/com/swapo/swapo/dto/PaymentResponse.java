package com.swapo.swapo.dto;

public class PaymentResponse {
    private String initPoint;
    private String preferenceId;
    
    // Getters y Setters
    public String getInitPoint() { return initPoint; }
    public void setInitPoint(String initPoint) { this.initPoint = initPoint; }
    
    public String getPreferenceId() { return preferenceId; }
    public void setPreferenceId(String preferenceId) { this.preferenceId = preferenceId; }
}