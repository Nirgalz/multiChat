"use strict"

/**
 * Don't quite know where to put all this :P
 * (there isn't much for now, though)
 */

const keyListener = (function() {

    // Private context here to prevent global var pollution

    const html = {
        mainInput: {
            $el: document.getElementById("sendMessageText"),
            previousValue: ""
        }
    };


    return function() {
        console.log(html.mainInput);
        // on keyup to be triggered *after* the letter has been inserted into the textarea
        html.mainInput.$el.addEventListener("keyup", function(e) {
            /**
             * UGLY HACK
             * to check if nothing has changed.
             * Too lazy to put a listener on the 'ctrl' key -.-
             *
             * ctrl+enter should send a message, because it doesn't change the contents of the textarea.
             */
            let currentValue = this.$el.value;
            if(e.key === "Enter" && currentValue === this.previousValue) {
                sendMessage();
            }
            this.previousValue = currentValue;
        }.bind(html.mainInput));
    }
})()();// called on-the-go!