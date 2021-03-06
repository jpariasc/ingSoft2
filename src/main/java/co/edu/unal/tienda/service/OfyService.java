package co.edu.unal.tienda.service;

import co.edu.unal.tienda.dominio.Perfil;
import co.edu.unal.tienda.dominio.Producto;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;

public class OfyService {
	/**
     * This static block ensure the entity registration.
     */
    static {
        factory().register(Perfil.class);
        factory().register(Producto.class);
    }

    /**
     * Use this static method for getting the Objectify service object in order to make sure the
     * above static block is executed before using Objectify.
     * @return Objectify service object.
     */
    public static Objectify ofy() {
        return ObjectifyService.ofy();
    }

    /**
     * Use this static method for getting the Objectify service factory.
     * @return ObjectifyFactory.
     */
    public static ObjectifyFactory factory() {
        return ObjectifyService.factory();
    }

}
