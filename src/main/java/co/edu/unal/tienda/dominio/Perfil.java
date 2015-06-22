package co.edu.unal.tienda.dominio;

import java.util.ArrayList;
import java.util.List;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.google.common.collect.ImmutableList;


@Entity
public class Perfil {
	String displayName;
	String mainEmail;
	
	private List<String> productKeysToAttend = new ArrayList<>(0);

	public List<String> getProductKeysToAttend() {
	        return ImmutableList.copyOf(productKeysToAttend);
	    }
	    
	public void addToProductKeysToAttend(String productKey) {
	        productKeysToAttend.add(productKey);
	    }
	    
	public void unregisterFromProduct(String productKey) {
	        if (productKeysToAttend.contains(productKey)) {
	            productKeysToAttend.remove(productKey);
	        } else {
	            throw new IllegalArgumentException("Invalid conferenceKey: " + productKey);
	        }
	    }

	@Id String userId;
    
    public Perfil (String userId, String displayName, String mainEmail) {
    	this.userId = userId;
    	this.displayName = displayName;
    	this.mainEmail = mainEmail;
    }
    
	public String getDisplayName() {
		return displayName;
	}

	public String getMainEmail() {
		return mainEmail;
	}

	public String getUserId() {
		return userId;
	}
	
	public void update(String displayName){
		if (displayName != null){
			this.displayName = displayName;
		}
	}

    private Perfil() {}
	
}
