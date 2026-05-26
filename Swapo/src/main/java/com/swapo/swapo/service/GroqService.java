package com.swapo.swapo.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

@Service
public class GroqService
{
    @Value("${groq.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String analizarTrueque(String productoOfrecido, double precioOfrecido, String productoDeseado, double precioDeseado, double diferenciaDinero)
    {
        try
        {
            double valorTotalOfrecido = precioOfrecido + diferenciaDinero;
            String prompt = String.format(
                    "Eres SWAPO IA, un asistente experto en trueques de tecnología. " +
                            "Eres consistente y honesto. Analiza este trueque:\n\n" +
                            "OFERTA DEL USUARIO:\n" +
                            "- Producto que ofrece: %s (valor: $%.0f COP)\n" +
                            "- Dinero extra que ofrece: $%.0f COP\n" +
                            "- VALOR TOTAL QUE OFRECE: $%.0f COP\n\n" +
                            "QUIERE RECIBIR:\n" +
                            "- Producto: %s (valor: $%.0f COP)\n\n" +
                            "RESPONDE EXACTAMENTE CON ESTE FORMATO (UNA SOLA LÍNEA):\n" +
                            "[✅ JUSTO / ⚠️ POCO JUSTO / ❌ INJUSTO] - [explicación corta]\n\n" +
                            "REGLAS:\n" +
                            "- Si valor total ofrecido es igual al producto deseado: JUSTO\n" +
                            "- Si diferencia es menor a 15%%: JUSTO\n" +
                            "- Si diferencia entre 15%% y 30%%: POCO JUSTO\n" +
                            "- Si diferencia mayor a 30%%: INJUSTO",
                    productoOfrecido, precioOfrecido, diferenciaDinero, valorTotalOfrecido,
                    productoDeseado, precioDeseado
            );
            return llamarGroq(prompt);
        }
        catch (Exception e)
        {
            return "⚠️ NO DISPONIBLE - No se pudo analizar el trueque, intenta de nuevo";
        }
    }

    public String analizarComparacion(String productoA, double precioA, String specsA, String productoB, double precioB, String specsB)
    {
        try {
            String prompt = String.format(
                    "Eres SWAPO IA, un asesor experto en tecnología. Sé detallado y útil.\n\n" +
                            "Compara estos dos productos:\n" +
                            "PRODUCTO A: %s - $%.0f COP - %s\n" +
                            "PRODUCTO B: %s - $%.0f COP - %s\n\n" +
                            "RESPONDE EN ESPAÑOL con este formato:\n" +
                            "🏆 GANADOR: [A o B]\n" +
                            "POR QUE?: [explica por qué, menciona precio, rendimiento, specs clave]\n" +
                            "RELACIÓN PRECIO-VALOR: [cuál ofrece más por tu dinero]\n" +
                            "💡 RECOMENDACIÓN FINAL: [qué deberías comprar y por qué]\n" +
                            "IMPORTANTE Si hay una mejor opcion recomienda la opcion espesifica o espesificas aunque sean de otra parte recomienda el modelo o producto que crees que podria ser mejor"+
                            "Intenta que no sobre pase las 20 o 30 lineas",
                    productoA, precioA, specsA, productoB, precioB, specsB
            );

            return llamarGroq(prompt);

        }
        catch (Exception e)
        {
            return "🏆 GANADOR: Empate\n ANÁLISIS: No se pudo analizar\n RELACIÓN PRECIO-VALOR: Revisa las specs\n RECOMENDACIÓN: Prueba de nuevo";
        }
    }

    public String validarProducto(String nombre, String descripcion, String categoria, String cpu, String gpu, String ram, String ssd, double precio, String vendedorNombre, String imagenPath)
    {
        try
        {
            String prompt = String.format(
                    "Eres SWAPO IA, un sistema de seguridad para trueques y ventas de tecnología. " +
                            "Debes detectar posibles ESTAFAS o INCONSISTENCIAS.\n\n" +
                            "DATOS DEL PRODUCTO:\n" +
                            "Nombre: %s\n" +
                            "Descripción: %s\n" +
                            "Categoría: %s\n" +
                            "CPU: %s\n" +
                            "GPU: %s\n" +
                            "RAM: %s\n" +
                            "SSD: %s\n" +
                            "Precio: $%.0f COP\n" +
                            "Vendedor: %s\n\n" +
                            "RESPONDE EXACTAMENTE CON ESTE FORMATO:\n" +
                            "SEGURIDAD: [🔴 PELIGRO / 🟡 SOSPECHOSO / 🟢 SEGURO]\n" +
                            "RAZÓN: [explicación corta]\n" +
                            "RECOMENDACIÓN: [qué debe hacer el comprador]\n\n" +
                            "REGLAS:\n" +
                            "1. Si el precio es menor al 30%% del valor normal → PELIGRO\n" +
                            "2. Si el nombre no coincide con las especificaciones → SOSPECHOSO\n" +
                            "3. Si la descripción es muy corta o genérica → SOSPECHOSO\n" +
                            "4. Si todo es coherente y precio razonable → SEGURO",
                    nombre, descripcion, categoria, cpu, gpu, ram, ssd, precio, vendedorNombre
            );

            return llamarGroq(prompt);

        } catch (Exception e) {
            return "SEGURIDAD: 🟡 SOSPECHOSO\nRAZÓN: No se pudo analizar\nRECOMENDACIÓN: Revisa manualmente";
        }
    }

    private String llamarGroq(String prompt) throws Exception
    {
        URL url = new URL(API_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setDoOutput(true);

        JsonObject body = new JsonObject();
        body.addProperty("model", "llama-3.3-70b-versatile");
        body.addProperty("temperature", 0.7);
        body.addProperty("max_tokens", 1500);

        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", prompt);

        com.google.gson.JsonArray messages = new com.google.gson.JsonArray();
        messages.add(message);
        body.add("messages", messages);

        try (OutputStream os = conn.getOutputStream())
        {
            os.write(body.toString().getBytes());
            os.flush();
        }

        StringBuilder response = new StringBuilder();
        try (Scanner scanner = new Scanner(conn.getInputStream())) {
            while (scanner.hasNext())
            {
                response.append(scanner.nextLine());
            }
        }

        JsonObject jsonResponse = JsonParser.parseString(response.toString()).getAsJsonObject();
        String resultado = jsonResponse.getAsJsonArray("choices").get(0).getAsJsonObject().getAsJsonObject("message").get("content").getAsString();

        resultado = resultado.replace("**", "").replace("__", "").replace("\n", " ").trim();

        return resultado;
    }
}