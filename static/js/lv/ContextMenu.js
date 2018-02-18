"use strict";

// singleton
const ContextMenu = {

    $el: null,

    currentMenu: null,
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
     *      type: "ADD_REACTION",
     *      coords: DOM pointer of type {x:0, y:0}
     * }
     */
    displayMenu: function (type, coords) {
        this.currentMenu = this.menuTypes[type];
        this.spawnHtml(coords);
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
     * @param type
     */
    spawnHtml: function (coords) {
        const $el = this.$el;

        $el.innerHTML = this.currentMenu.getHtml();
        $el.style.left = coords.x + "px";
        $el.style.top = coords.y + "px";
    },

    clickedOnSelf: function (event) {
        return this.$el.contains(event.target);
    },
    
    registerListeners: function () {
        // close context menu on mouseclick
        addEventListener("mousedown", function(e) {
            if(!this.clickedOnSelf(e)) this.toggleMenu(false);// clicked outside
        }.bind(this));
        addEventListener("mouseup", function(e) {
            if(this.clickedOnSelf(e)) {
                const closeMenu = this.currentMenu.mousedown(e);
                if(closeMenu) this.toggleMenu(false);
            }
        }.bind(this));

        // close context menu on keydown ESC
        addEventListener("keydown", function(e) {
            if(e.keyCode === 27) this.toggleMenu(false);
        }.bind(this));
    }
};

ContextMenu.menuTypes = {
    "ADD_REACTION": {
        html: null,
        getHtml: function() {
            if (!this.html) this.init();
            return this.html;
        },
        /**
         *
         * @param event
         * @returns {boolean}action complete - the context menu should be closed if true.
         */
        mousedown: function (event) {
            if(event.target.attributes["data-unicode"]) {
                const unicode = event.target.attributes["data-unicode"].value;
                this.mainAction(unicode);
                return true;
            }
            return false;
        },
        mainAction: function (unicode) {
            // add node
            alert("will add " + unicode);
        },

        init: function() {
            this.html =
                "<h3>Add a reaction</h3>" +
                "<hr/>" +
                "<div id='ctx-addReaction'>" +
                    this.loadIcons() +
                "</div>";
        },
        icons: {
            "smile-o": "\uf118",
            "handshake-o": "\uf2b5",
            "bath": "\uf2cd",
            "snowflake-o": "\uf2dc",
            "blind": "\uf29d",
            "copyright": "\uf1f9",
            "check": "\uf00c",
            "times": "\uf00d",
            "ban": "\uf05e",
            "cogs": "\uf085",
            "cube": "\uf1b2",
            "eye": "\uf06e"
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
        }
    }
};

ContextMenu.init(document.getElementById("contextMenu"));