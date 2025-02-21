<?php
/*
* Plugin Name:       Custom Admin User Page
* Description:       Custom plugin to manage access of admin entity of a website.
* Version:           0.0.5
* Author:            Matteo Grisenti
* License:           GPL v2 or later
*/

if (!defined('ABSPATH')) {
    exit;
}

// Aggiunge una voce di menu personalizzata nella dashboard
function custom_admin_menu_page() {
    add_menu_page(
        'Custom Admin Page',       
        'Admin Page',              
        'manage_options',          
        'custom-admin-page',       
        'custom_admin_page_content', 
        'dashicons-admin-generic', 
        2                          
    );
}
add_action('admin_menu', 'custom_admin_menu_page');

// Carica script e stili
function custom_admin_enqueue_assets($hook) {
    if ($hook !== 'toplevel_page_custom-admin-page') {
        return;
    }

    // Carica Media Uploader di WordPress
    wp_enqueue_media();

    // Carica il CSS e JS
    wp_enqueue_style('custom-admin-style', plugin_dir_url(__FILE__) . 'css/custom-admin.css');
    wp_enqueue_script('custom-admin-script', plugin_dir_url(__FILE__) . 'js/custom-admin.js', array('jquery'), '1.0', true);

    // Passiamo l'URL AJAX al JS
    wp_localize_script('custom-admin-script', 'ajax_object', array('ajax_url' => admin_url('admin-ajax.php')));
}
add_action('admin_enqueue_scripts', 'custom_admin_enqueue_assets');


// Creazione post tramite AJAX
function custom_admin_create_post() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Non hai i permessi per eseguire questa operazione.');
    }

    // Ricezione dei dati dal form
    $title = sanitize_text_field($_POST['title']);
    $background = esc_url_raw($_POST['background']);
    $expiration = sanitize_text_field($_POST['expiration']); // Data di scadenza
    $paragraph = sanitize_textarea_field($_POST['paragraph']);

    // Creazione del post
    $post_data = array(
        'post_title'    => $title,
        'post_content'  => "<h1>$title</h1><p>$paragraph</p>",
        'post_status'   => 'publish',
        'post_type'     => 'post',
    );

    $post_id = wp_insert_post($post_data);

    if ($post_id) {
        // Impostazione dell'immagine di sfondo come immagine in evidenza
        if (!empty($background)) {
            $attachment_id = attachment_url_to_postid($background);
            if ($attachment_id) {
                set_post_thumbnail($post_id, $attachment_id);
            }
        }

        // Salvataggio della data di scadenza
        if (!empty($expiration)) {
            update_post_meta($post_id, '_expiration_date', $expiration);
        }

        // Salvataggio degli altri campi personalizzati
        update_post_meta($post_id, 'background_image', $background);
        update_post_meta($post_id, 'paragraph', $paragraph);

        wp_send_json_success("Post creato con successo! ID: $post_id");
    } else {
        wp_send_json_error('Errore nella creazione del post.');
    }
}
add_action('wp_ajax_custom_admin_create_post', 'custom_admin_create_post');



// Contenuto della pagina personalizzata
function custom_admin_page_content() {
    ?>
    <div class="wrap">
        <h1>Configurazione Admin</h1>
        <form id="custom-admin-form">
            <div class="form-row">
                <label for="title">Titolo:</label>
                <input type="text" id="title" name="title" required>
            </div>

            <div class="form-row">
                <label>Immagine di sfondo:</label>
                <button type="button" id="background-button">Seleziona immagine</button>
                <input type="hidden" id="background" name="background">
                <div id="background-preview" class="image-preview"></div>
            </div>

            <div class="form-row">
                <label>Immagini Roller:</label>
                <button type="button" id="roller-button">Seleziona immagini</button>
                <input type="hidden" id="roller" name="roller">
                <div id="roller-preview" class="image-preview"></div>
            </div>

            <div class="form-row">
                <label for="expiration">Data di scadenza:</label>
                <input type="date" id="expiration" name="expiration">
            </div>

            <div class="form-row">
                <label for="paragraph">Paragrafo:</label>
                <textarea id="paragraph" name="paragraph"></textarea>
            </div>

            <button type="button" id="save-button">Salva</button>
        </form>
    </div>
    <?php
}
