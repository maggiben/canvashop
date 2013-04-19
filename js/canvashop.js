(function (root, factory) {
    "use strict";
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('jQuery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery'], factory);
    } else {
        // Browser globals (root is window)
        root.CANVASHOP = factory(root.jQuery);
    }
}(this, function (jQuery, Routing, templateHelper, ajax, error) {
    "use strict";
    var CANVASHOP = (function() {
        function CANVASHOP(canvas) {
            ///////////////////
            // Internal init //
            ///////////////////
            this.jQuery = jQuery;
            this.version = '1.0';
            this.context = canvas.getContext('2d');
            this.TO_RADIANS = Math.PI/180;
            var that = this;
        }
        CANVASHOP.prototype.rotateImage = function(context, image, x, y, angle) {
            var TO_RADIANS = Math.PI/180;
            // save the current co-ordinate system
            // before we screw with it
            context.save();
            // move to the middle of where we want to draw our image
            context.translate(x, y);
            // rotate around that point, converting our
            // angle from degrees to radians
            context.rotate(angle * TO_RADIANS);
            // draw it up and to the left by half the width
            // and height of the image
            context.drawImage(image, -(image.width/2), -(image.height/2));
            // and restore the co-ords to how they were when we began
            context.restore();
        };
        CANVASHOP.prototype.loadImage = function(event) {
            var image = new Image();
            var deferred = new jQuery.Deferred();
            image.src = event.target.result;
            //img.alt = file.name;
            //img.title = escape(file.name);
            image.onload = function(event) {
                deferred.resolve(event);
            }
            return deferred.promise();
        };
        CANVASHOP.prototype.loadFile = function(file) {
        var reader = new FileReader();
        var deferred = new jQuery.Deferred();
        reader.onload = function(event) {
            deferred.resolve(event);
        }
        reader.readAsDataURL(file);
        return deferred.promise();
    }
        CANVASHOP.prototype.getVersion = function() {
            console.log(this.version);
            return this.version;
        };
        return CANVASHOP;
    }());
    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return CANVASHOP;
}));