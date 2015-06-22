package co.edu.unal.tienda.form;

import java.util.Date;
import java.util.List;

import com.google.common.collect.ImmutableList;

public class ProductoForm {
	
    private String name;

    private String description;

    private List<String> topics;

    private Date startDate;

    private int amount;

    private ProductoForm() {}

    public ProductoForm(String name, String description, List<String> topics,
                          Date startDate, int amount) {
        this.name = name;
        this.description = description;
        this.topics = topics == null ? null : ImmutableList.copyOf(topics);
        this.startDate = startDate == null ? null : new Date(startDate.getTime());
        this.amount = amount;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getTopics() {
        return topics;
    }


    public Date getStartDate() {
        return startDate;
    }

    public int getAmount() {
        return amount;
    }
	

}
