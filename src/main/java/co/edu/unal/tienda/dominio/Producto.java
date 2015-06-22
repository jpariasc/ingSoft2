package co.edu.unal.tienda.dominio;

import static co.edu.unal.tienda.service.OfyService.ofy;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import co.edu.unal.tienda.form.ProductoForm;

import com.google.api.server.spi.config.AnnotationBoolean;
import com.google.api.server.spi.config.ApiResourceProperty;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;

@Entity
public class Producto {

    private static final List<String> DEFAULT_TOPICS = ImmutableList.of("Default", "Topic");

    @Id
    private long id;

    @Index
    private String name;

    private String description;

    /**
     * Holds Perfil key as the parent.
     */
    @Parent
    @ApiResourceProperty(ignored = AnnotationBoolean.TRUE)
    private Key<Perfil> profileKey;

    @ApiResourceProperty(ignored = AnnotationBoolean.TRUE)
    private String organizerUserId;

    /**
     * Topics related to this Producto.
     */
    @Index
    private List<String> topics;

    private Date startDate;
    
    private int amount;

    @Index
    private int amountAvailable;
    
    private Producto() {}

    public Producto(final long id, final String organizerUserId,
                      final ProductoForm conferenceForm) {
        Preconditions.checkNotNull(conferenceForm.getName(), "The name is required");
        this.id = id;
        this.profileKey = Key.create(Perfil.class, organizerUserId);
        this.organizerUserId = organizerUserId;
        
        updateWithConferenceForm(conferenceForm);
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    @ApiResourceProperty(ignored = AnnotationBoolean.TRUE)
    public Key<Perfil> getProfileKey() {
        return profileKey;
    }

    // Get a String version of the key
    public String getWebsafeKey() {
        return Key.create(profileKey, Producto.class, id).getString();
    }

    @ApiResourceProperty(ignored = AnnotationBoolean.TRUE)
    public String getOrganizerUserId() {
        return organizerUserId;
    }

    public String getOrganizerDisplayName() {
        Perfil organizer = ofy().load().key(getProfileKey()).now();
        if (organizer == null) {
            return organizerUserId;
        } else {
            return organizer.getDisplayName();
        }
    }

    /**
     * Returns a defensive copy of topics if not null.
     * @return a defensive copy of topics if not null.
     */
    public List<String> getTopics() {
        return topics == null ? null : ImmutableList.copyOf(topics);
    }

    /**
     * Returns a defensive copy of startDate if not null.
     * @return a defensive copy of startDate if not null.
     */
    public Date getStartDate() {
        return startDate == null ? null : new Date(startDate.getTime());
    }

    public int getAmount() {
        return amount;
    }

    public int getAmountAvailable() {
        return amountAvailable;
    }


    public void updateWithConferenceForm(ProductoForm productoForm) {
        this.name = productoForm.getName();
        this.description = productoForm.getDescription();
        List<String> topics = productoForm.getTopics();
        this.topics = topics == null || topics.isEmpty() ? DEFAULT_TOPICS : topics;

        Date startDate = productoForm.getStartDate();
        Calendar cal=Calendar.getInstance();
        Date date=cal.getTime();
        this.startDate = startDate == null ? date : new Date(startDate.getTime());
        
        int amountSold = amount - amountAvailable;
        if (productoForm.getAmount() < amountSold) {
            throw new IllegalArgumentException(amountSold + " todo vendido, "
                    + "but you tried to set amount to " + productoForm.getAmount());
        }
        
        this.amount = productoForm.getAmount();
        this.amountAvailable = this.amount - amountSold;
    }

    public void bookProducts(final int number) {
        if (amountAvailable < number) {
            throw new IllegalArgumentException("There are no products available.");
        }
        amountAvailable = amountAvailable - number;
    }

    public void giveBackProducts(final int number) {
        if (amountAvailable + number > amount) {
            throw new IllegalArgumentException("The number of products will exceeds.");
        }
        amountAvailable = amountAvailable + number;
    }

    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder("Id: " + id + "\n")
                .append("Name: ").append(name).append("\n");
        if (topics != null && topics.size() > 0) {
            stringBuilder.append("Topics:\n");
            for (String topic : topics) {
                stringBuilder.append("\t").append(topic).append("\n");
            }
        }
        if (startDate != null) {
            stringBuilder.append("StartDate: ").append(startDate.toString()).append("\n");
        }
        stringBuilder.append("Amount: ").append(amountAvailable).append("\n");
        return stringBuilder.toString();
    }

}
