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


    // SELEZIONE IMMAGINE BACKGROUND
    document.getElementById("background-button").addEventListener("click", function () {
        openMediaUploader(function (urls) {
            document.getElementById("background").value = urls[0];
            document.getElementById("background-preview").innerHTML = `<img src="${urls[0]}" alt="Anteprima" class="preview-image">`;
        });
    });


    // SELEZIONE IMMAGINI GALLERIA
    document.getElementById("roller-button").addEventListener("click", function () {
        let galleryFrame = wp.media({
            title: "Seleziona immagini per la galleria",
            button: { text: "Inserisci nella galleria" },
            library: { type: "image" },
            multiple: true
        });
    
        galleryFrame.on("open", function () {
            let selection = galleryFrame.state().get("selection");
            let ids = document.getElementById("roller").value.split(",");
    
            ids.forEach(id => {
                if (id) {
                    let attachment = wp.media.attachment(id);
                    attachment.fetch();
                    selection.add(attachment);
                }
            });
        });
    
        galleryFrame.on("select", function () {
            let selection = galleryFrame.state().get("selection");
            let urls = [];
            let ids = [];
    
            selection.each(function (attachment) {
                urls.push(attachment.attributes.url);
                ids.push(attachment.id);
            });
    
            console.log(urls); // Debug per verificare gli URL selezionati
    
            if (urls.length > 0) {
                document.getElementById("roller").value = ids.join(",");
    
                let previewContainer = document.getElementById("roller-preview");
                previewContainer.innerHTML = "";
    
                urls.forEach(url => {
                    let imgElement = document.createElement("img");
                    imgElement.src = url;
                    imgElement.alt = "Anteprima";
                    imgElement.classList.add("preview-image");
                    previewContainer.appendChild(imgElement);
                });
            }
        });
    
        galleryFrame.open();
    });
    
    
    
    


    document.getElementById("save-button").addEventListener("click", function () {
        let title = document.getElementById("title").value;
        let background = document.getElementById("background").value;
        let expiration = document.getElementById("expiration").value;
        let paragraph = document.getElementById("paragraph").value;
        let rollerImages = document.getElementById("roller").value; // URL immagini separati da virgole

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
                paragraph: paragraph,
                images: rollerImages // Passa le immagini selezionate come stringa
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
