document.addEventListener("DOMContentLoaded", function () {
    let mediaUploader;

    function openMediaUploader(callback, multiple = false) {
        if (mediaUploader) {
            mediaUploader.open();
            return;
        }

        mediaUploader = wp.media({
            title: "Seleziona un'immagine",
            button: { text: "Usa questa immagine" },
            multiple: multiple
        });

        mediaUploader.on("select", function () {
            let attachments = mediaUploader.state().get("selection").toArray();
            let urls = attachments.map(file => file.attributes.url);
            callback(urls);
        });

        mediaUploader.open();
    }

    document.getElementById("background-button").addEventListener("click", function () {
        openMediaUploader(function (urls) {
            document.getElementById("background").value = urls[0];
            document.getElementById("background-preview").innerHTML = `<img src="${urls[0]}" alt="Anteprima" class="preview-image">`;
        });
    });

    document.getElementById("save-button").addEventListener("click", function () {
        let title = document.getElementById("title").value;
        let background = document.getElementById("background").value;
        let expiration = document.getElementById("expiration").value;
        let paragraph = document.getElementById("paragraph").value;

        if (!title) {
            alert("Il titolo è obbligatorio!");
            return;
        }

        // Invio dati al server via AJAX
        jQuery.ajax({
            type: "POST",
            url: ajax_object.ajax_url,
            data: {
                action: "custom_admin_create_post",
                title: title,
                background: background,
                expiration: expiration,
                paragraph: paragraph
            },
            success: function (response) {
                if (response.success) {
                    alert("Post creato con successo! ID: " + response.data);
                } else {
                    alert("Errore: " + response.data);
                }
            },
            error: function () {
                alert("Errore durante la creazione del post.");
            }
        });
    });
});
