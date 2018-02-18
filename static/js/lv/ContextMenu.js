"use strict";

// singleton
const ContextMenu = {

    $el: null,

    visible: false,

    /**
     * Initializes singleton
     * @param $el - the DOM element that will contain the context menu.
     */
    init: function ($el) {
        this.$el = $el;

        this.registerListeners();
    },

    /**
     * Displays a customized context menu on the screen.
     * @param data - {
     *      type: "NEW_NODE",
     *      pos: DOM pointer of type {x:0, y:0}
     * }
     */
    displayMenu: function (data) {
        this.spawnHtml(data.type);
        this.reposition(data.pos);
        this.toggleMenu(true);
    },

    //

    /**
     * @private
     * Hides or displays the context menu.
     * @param bool - leave empty to toggle
     */
    toggleMenu: function (bool) {
        this.visible = (bool == null) ? !this.visible : bool;
        this.$el.style.display = this.visible ? "initial" : "none";
    },

    /**
     * @private
     * @param coords
     */
    reposition: function (coords) {
        const $el = this.$el;
        $el.style.left = coords.x + "px";
        $el.style.top = coords.y + "px";
    },
    /**
     * @private
     * @param type
     */
    spawnHtml: function (type) {
        this.$el.innerHTML = this.types[type].getHtml();
    },
    
    registerListeners: function () {
        // close context menu on mouseclick
        addEventListener("mousedown", function(e) {
            const clickedOnSelf = this.$el.contains(e.target);
            if(!clickedOnSelf) this.toggleMenu(false);
        }.bind(this));
        // close context menu on keydown ESC
        addEventListener("keydown", function(e) {
            if(e.keyCode === 27) this.toggleMenu(false);
        }.bind(this));
    }
};

ContextMenu.types = {
    "NEW_NODE": {
        html: null,

            icons: {
            "smile-o": "\uf118",
                "handshake-o": "\uf2b5",
                "bath": "\uf2cd",
                "snowflake-o": "\uf2dc",
                "ban": "\uf05e",
                "blind": "\uf29d",
                "copyright": "\uf1f9",
                "cogs": "\uf085",
                "times": "\uf00d",
                "check": "\uf00c",
                "cube": "\uf1b2",
                "eye": "\uf06e"
        },
        init: function() {
            this.html =
                "<h3>Add a reaction</h3>" +
                "<hr/>" +
                "<div id='ctx-newNode'>" +
                this.loadIcons() +
                "</div>";
        },
        loadIcons: function() {
            var name;
            var unicode;
            var output = "";
            for(name in this.icons) {
                unicode = this.icons[name];

                output +=
                    "<span class='item'>" +
                    "<span class='fa fa-"+name+" fa-fw' data-unicode='"+unicode+"'></span>" +
                    "</span>";
            }
            return output;
        },
        getHtml: function() {
            if (!this.html) this.init();
            return this.html;
        }

    }
};

ContextMenu.init(document.getElementById("contextMenu"));
ContextMenu.displayMenu({type:"NEW_NODE"});// debug