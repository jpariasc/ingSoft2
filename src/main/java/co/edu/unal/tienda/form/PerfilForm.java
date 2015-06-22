package co.edu.unal.tienda.form;

public class PerfilForm {
	/**
     * Any string user wants us to display him/her on this system.
     */
    private String displayName;

    private PerfilForm() {}

    public PerfilForm(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
