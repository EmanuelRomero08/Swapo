package com.swapo.swapo;

import com.swapo.swapo.model.Producto;
import com.swapo.swapo.repository.RecursoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SwapoApplication
{
	public static void main(String[] args)
	{
		SpringApplication.run(SwapoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(RecursoRepository repository)
	{
		return args ->
		{
			Producto p1 = new Producto();

			p1.setNombre("Poco x7 pro");
			p1.setDescripcion("Celular de alto rendimiento");
			p1.setPrecio(1800000.0);
			p1.setStock(5);
			p1.setMarca("Xiaomi");

			repository.save(p1);

			System.out.println("--- Sprint 1 Check: Producto guardado en MySQL ---");
		};
	}
}
