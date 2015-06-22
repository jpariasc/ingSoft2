package co.edu.unal.tienda.spi;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.response.ConflictException;
import com.google.api.server.spi.response.ForbiddenException;
import com.google.api.server.spi.response.NotFoundException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Work;
import com.googlecode.objectify.cmd.Query;

import co.edu.unal.tienda.Constants;
import co.edu.unal.tienda.dominio.Perfil;
import co.edu.unal.tienda.dominio.Producto;
import co.edu.unal.tienda.form.PerfilForm;
import co.edu.unal.tienda.form.ProductoForm;
import co.edu.unal.tienda.form.ProductoQueryForm;
import static co.edu.unal.tienda.service.OfyService.ofy;
import static co.edu.unal.tienda.service.OfyService.factory;

@Api(name = "tienda", version = "v1", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
        Constants.WEB_CLIENT_ID, Constants.API_EXPLORER_CLIENT_ID }, 
        description = "API para Tienda Virtual Backend application.")
public class TiendaApi {
	
	//entra 123@abc.com devuelve 123
    private static String extractDefaultDisplayNameFromEmail(String email) {
        return email == null ? null : email.substring(0, email.indexOf("@"));
    }


    // Declare this method as a method available externally through Endpoints
    @ApiMethod(name = "saveProfile", path = "profile", httpMethod = HttpMethod.POST)
    // The request that invokes this method should provide data that
    // conforms to the fields defined in ProfileForm

    public Perfil saveProfile(final User user, PerfilForm perfilForm) throws UnauthorizedException {
    	
        // If the user is not logged in, throw an UnauthorizedException
        if (user == null){
        	throw new UnauthorizedException("Se requiere Autorizacion");
        }
        
        // Get the userId and mainEmail
        String userId = user.getUserId();
        String mainEmail = user.getEmail();
        
        // Get the displayName sent by the request
        String displayName = perfilForm.getDisplayName();
        
        //Get the Profile from the datastore if it exists
        //otherwise create a new one
        Perfil profile = ofy().load().key(Key.create(Perfil.class, userId)).now();
        
        if (profile == null){
        	//populate the displayName with default values if not sent in the request
        	if(displayName == null){
        		displayName = extractDefaultDisplayNameFromEmail(user.getEmail());
        	}
        	// Now create a new Profile entity
        	profile = new Perfil(userId, displayName, mainEmail);
        } else {
        	//the Profile entity already exists, Update the Profile entity
        	profile.update(displayName);
        }
        
        //Save the entity in the datastore
        ofy().save().entity(profile).now();

        // Return the profile
        return profile;
    }

    
    @ApiMethod(name = "getProfile", path = "profile", httpMethod = HttpMethod.GET)
    public Perfil getProfile(final User user) throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Authorization required");
        }

        // load the Profile Entity
        String userId = user.getUserId(); //
        Key key = Key.create(Perfil.class, userId); //
        Perfil profile = (Perfil) ofy().load().key(key).now(); // load the Profile entity
        return profile;
    }
    
    
    private static Perfil getProfileFromUser(User user) {
        // First fetch the user's Profile from the datastore.
        Perfil profile = ofy().load().key(
                Key.create(Perfil.class, user.getUserId())).now();
        if (profile == null) {
            // Create a new Profile if it doesn't exist.
            String email = user.getEmail();
            profile = new Perfil(user.getUserId(),
                    extractDefaultDisplayNameFromEmail(email), email);
        }
        return profile;
    }

    @ApiMethod(name = "createProduct", path = "product", httpMethod = HttpMethod.POST)
    public Producto createProduct(final User user, final ProductoForm productoForm)
        throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Authorization required");
        }

        String userId = user.getUserId();

        Key<Perfil> profileKey = Key.create(Perfil.class, userId);

        final Key<Producto> productKey = factory().allocateId(profileKey, Producto.class);

        final long productId = productKey.getId();

        Perfil profile = getProfileFromUser(user);

        Producto product = new Producto(productId, userId, productoForm);

        ofy().save().entities(product, profile).now();

         return product;
         }
    
    @ApiMethod(
            name = "queryProducts",
            path = "queryProducts",
            httpMethod = HttpMethod.POST
    )
    public List<Producto> queryProducts(ProductoQueryForm productoQueryForm) {
        //Query query = ofy().load().type(Producto.class).order("name");
        //return query.list();
    	Iterable<Producto> productoIterable = productoQueryForm.getQuery();
    	List<Producto> result = new ArrayList<>(0);
    	List<Key<Perfil>> organizerKeyList = new ArrayList<>(0);
    	for (Producto producto : productoIterable){
    		organizerKeyList.add(Key.create(Perfil.class, producto.getOrganizerUserId()));
    		result.add(producto);
    	}
    	ofy().load().keys(organizerKeyList);
    	return result;
    }
    
    @ApiMethod(
    		name = "getProductsCreated",
    		path = "getProductsCreated",
    		httpMethod = HttpMethod.POST
    )
    public List<Producto> getProductsCreated(final User user)
    	throws UnauthorizedException {
    	if (user == null){
    		throw new UnauthorizedException("Autorization required");
    	}
    	String userId = user.getUserId();
    	Key userKey = Key.create(Perfil.class, userId);
    	return ofy().load().type(Producto.class).ancestor(userKey).order("name").list();
    }
    
    /////////// comprar un producto y ver productos comprados transacciones/////////////////////////////
    
    @ApiMethod(
            name = "getProduct",
            path = "product/{websafeProductKey}",
            httpMethod = HttpMethod.GET
    )
    public Producto getProduct(
            @Named("websafeProductKey") final String websafeProductKey)
            throws NotFoundException {
        Key<Producto> productKey = Key.create(websafeProductKey);
        Producto product = ofy().load().key(productKey).now();
        if (product == null) {
            throw new NotFoundException("No Product found with key: " + websafeProductKey);
        }
        return product;
    }
    
    public static class WrappedBoolean {

        private final Boolean result;
        private final String reason;

        public WrappedBoolean(Boolean result) {
            this.result = result;
            this.reason = "";
        }

        public WrappedBoolean(Boolean result, String reason) {
            this.result = result;
            this.reason = reason;
        }

        public Boolean getResult() {
            return result;
        }

        public String getReason() {
            return reason;
        }
    }
    
    
    @ApiMethod(
            name = "registerForProduct",
            path = "product/{websafeProductKey}/registration",
            httpMethod = HttpMethod.POST
    )
    public WrappedBoolean registerForProduct(final User user,
            @Named("websafeProductKey") final String websafeProductKey)
            throws UnauthorizedException, NotFoundException,
            ForbiddenException, ConflictException {
        // If not signed in, throw a 401 error.
        if (user == null) {
            throw new UnauthorizedException("Authorization required");
        }

        // Get the userId
        final String userId = user.getUserId();
        
        WrappedBoolean result = ofy().transact(new Work<WrappedBoolean>() {
            @Override
            public WrappedBoolean run() {
                try {

                // Get the product key
                Key<Producto> productKey = Key.create(websafeProductKey);

                // Get the Producto entity from the datastore
                Producto product = ofy().load().key(productKey).now();

                // 404 when there is no Producto with the given productId.
                if (product == null) {
                    return new WrappedBoolean (false,
                            "No Conference found with key: "
                                    + websafeProductKey);
                }

                // Get the user's Profile entity
                Perfil profile = getProfileFromUser(user);

                // Has the user already registered to attend this product?
                if (profile.getProductKeysToAttend().contains(
                        websafeProductKey)) {
                    return new WrappedBoolean (false, "compra OK");
                } else if (product.getAmountAvailable() <= 0) {
                    return new WrappedBoolean (false, "No available");
                } else {
     
                    profile.addToProductKeysToAttend(websafeProductKey);
                    product.bookProducts(1);

                    // Save the Producto and Profile entities
                    ofy().save().entities(profile, product).now();
                    // We are booked!
                    return new WrappedBoolean(true);
                }

                }
                catch (Exception e) {
                    return new WrappedBoolean(false, "Unknown exception");

                }
            }
        });
        // if result is false
        if (!result.getResult()) {
            if (result.getReason() == "Already registered") {
                throw new ConflictException("You have already registered");
            }
            else if (result.getReason() == "No available") {
                throw new ConflictException("There are no products available");
            }
            else {
                throw new ForbiddenException("Unknown exception");
            }
        }
        return result;
    }
    
    
    @ApiMethod(
            name = "getProductsToAttend",
            path = "getProductsToAttend",
            httpMethod = HttpMethod.GET
    )
    public Collection<Producto> getConferencesToAttend(final User user)
            throws UnauthorizedException, NotFoundException {
        // If not signed in, throw a 401 error.
        if (user == null) {
            throw new UnauthorizedException("Authorization required");
        }
        Perfil profile = ofy().load().key(Key.create(Perfil.class, user.getUserId())).now();
        if (profile == null) {
            throw new NotFoundException("Profile doesn't exist.");
        }
        List<String> keyStringsToAttend = profile.getProductKeysToAttend();
        List<Key<Producto>> keysToAttend = new ArrayList<>();
        for (String keyString : keyStringsToAttend) {
            keysToAttend.add(Key.<Producto>create(keyString));
        }
        return ofy().load().keys(keysToAttend).values();
    }
    

}
