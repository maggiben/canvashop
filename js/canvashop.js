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
}(this, function (jQuery) {
    "use strict";
    var CANVASHOP = (function() {
        function CANVASHOP(canvas) {
            ///////////////////
            // Internal init //
            ///////////////////
            this.jQuery = jQuery;
            this.version = '1.0';
            this.maxWidth = canvas.parentNode.clientWidth - 120;
            this.maxHeight = canvas.parentNode.clientHeight - 120;
            this.photo = $('#photo');
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.transformations = {
                angle: 0,
                scale: 0
            };
            this.filters = ['normal', 'vintage', 'lomo', 'clarity', 'sinCity', 'sunrise', 'crossProcess', 'orangePeel', 'love', 'grungy', 'jarques', 'pinhole', 'oldBoot', 'glowingSun', 'hazyDays', 'herMajesty', 'nostalgia', 'hemingway', 'concentrate'];
            this.TO_RADIANS = Math.PI/180;
            var that = this;


            CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
                if (preserveTransform) {
                    // Store the current transformation matrix
                    this.save();
                    // Use the identity matrix while clearing the canvas
                    this.setTransform(1, 0, 0, 1, 0, 0);
                }

                this.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (preserveTransform) {
                    // Restore the transform
                    this.restore();
                }
            };
        }
        CANVASHOP.prototype.fitCanvas = function(image) {
            var that = this;
            var imgWidth  = image.width;
            var imgHeight = image.height;
            var newWidth = 0;
            var newHeight = 0;
            var ratio = null;

            // Calculate the new image dimensions, so they fit
            // inside the maxWidth x maxHeight bounding box
            if (imgWidth >= that.maxWidth || imgHeight >= that.maxHeight) {
                // The image is too large,
                // resize it to fit a 500x500 square!
                if (imgWidth > imgHeight) {
                    // Wide
                    ratio = imgWidth / that.maxWidth;
                    newWidth = that.maxWidth;
                    newHeight = imgHeight / ratio;
                } else {
                    // Tall or square
                    ratio = imgHeight / that.maxHeight;
                    newHeight = that.maxHeight;
                    newWidth = imgWidth / ratio;
                }
            } else {
                newHeight = imgHeight;
                newWidth = imgWidth;
            }
            //trackTransforms(that.context);
            // Draw the dropped image to the canvas
            // with the new dimensions
            var size = that.newSize(imgWidth, imgHeight, 0);
            that.canvas.width = size.width;
            that.canvas.height = size.height;

            $(that.canvas).attr({
                width: newWidth,
                height: newHeight
            }).css({
                marginLeft: -(newWidth /  2),
                marginTop: -(newHeight / 2)
            });

        }
        CANVASHOP.prototype.initCanvas = function(image) {
            var that = this;
            var imgWidth  = image.width;
            var imgHeight = image.height;
            var newWidth = 0;
            var newHeight = 0;
            var ratio = null;
            // Calculate the new image dimensions, so they fit
            // inside the maxWidth x maxHeight bounding box
            if (imgWidth >= that.maxWidth || imgHeight >= that.maxHeight) {
                // The image is too large,
                // resize it to fit a 500x500 square!
                if (imgWidth > imgHeight) {
                    // Wide
                    ratio = imgWidth / that.maxWidth;
                    newWidth = that.maxWidth;
                    newHeight = imgHeight / ratio;
                } else {
                    // Tall or square
                    ratio = imgHeight / that.maxHeight;
                    newHeight = that.maxHeight;
                    newWidth = imgWidth / ratio;
                }
            } else {
                newHeight = imgHeight;
                newWidth = imgWidth;
            }
            //trackTransforms(that.context);
            // Draw the dropped image to the canvas
            // with the new dimensions
            var size = that.newSize(imgWidth, imgHeight, 0);
            that.canvas.width = size.width;
            that.canvas.height = size.height;

            $(that.canvas).attr({
                width: newWidth,
                height: newHeight
            }).css({
                marginLeft: -(newWidth /  2),
                marginTop: -(newHeight / 2)
            });

            $('#logw').append("size: w: " + size.width + " h: " + size.height + "\n")
            $('#logw').append("size: w: " + newWidth + " h: " + newHeight + "\n")
            $('#logw').append("max: w: " + that.maxWidth + " h: " + that.maxHeight + "\n")
            // Draw the dropped image to the canvas
            // with the new dimensions
            that.context.drawImage(image, 0, 0, newWidth, newHeight);
            // We don't need this any more
            image.remove();
            return;
        };
        ///////////////////////////////////////////////////////////////////////
        // Image filters                                                     //
        ///////////////////////////////////////////////////////////////////////
        CANVASHOP.prototype.filter = function() {
            var that = this;
            // Clone the canvas
            var canvas = $(that.canvas).clone();
            // Clone the image stored in the canvas as well
            canvas[0].getContext('2d').drawImage(that.canvas, 0, 0);
            // Add the clone to the page and trigger
            // the Caman library on it
            that.photo.find('canvas').remove().end().append(canvas);
            var effect = 'nostalgia';
            Caman(canvas[0], function () {
                // If such an effect exists, use it:
                if( effect in this){
                    this[effect]();
                    this.render();
                    // Show the download button
                    //showDownload(clone[0]);
                }
                else{
                    //hideDownload();
                }
            });
        };
        ///////////////////////////////////////////////////////////////////////
        // Image Transformations                                             //
        ///////////////////////////////////////////////////////////////////////
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
        CANVASHOP.prototype.scaleImage = function(context, image, x, y, factor) {
            // save the current co-ordinate system
            // before we screw with it
            context.save();
            // move to the middle of where we want to draw our image
            context.translate(x, y);
            // rotate around that point, converting our
            // angle from degrees to radians
            context.scale(factor, factor);
            // draw it up and to the left by half the width
            // and height of the image
            context.drawImage(image, -(image.width/2), -(image.height/2));
            // and restore the co-ords to how they were when we began
            context.restore();
        };
        CANVASHOP.prototype.newSize = function(width, height, angle){
            var rads = angle*Math.PI/180;
            var cos = Math.cos(rads);
            var sin = Math.sin(rads);
            var size = {
                width: 0,
                height: 0
            };
            if (sin < 0) {
                sin = -sin;
            }
            if (cos < 0) {
                cos = -cos;
            }
            size.width = height * sin + width * cos;
            size.height = height * cos + width * sin;
            return size;
        };
        ///////////////////////////////////////////////////////////////////////
        // File Handling                                                     //
        ///////////////////////////////////////////////////////////////////////
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
        };
        CANVASHOP.prototype.createInput = function(container){
            var input = document.createElement("input");
            input.setAttribute("multiple", "multiple");
            input.setAttribute("accept", true);
            input.setAttribute("type", "file");
            //input.setAttribute("name", that.options.name);
            $(input).css({
                position: 'absolute',
                // in Opera only 'browse' button
                // is clickable and it is located at
                // the right side of the input
                'top': '0px',
                'width': '22px',
                'margin-left': '-14px',
                'padding': '0px',
                'cursor': 'pointer',
                'opacity': 0
            });
            //$(that.options.uploaderSelector)[0].appendChild(input);
            $(container).append(input);
            // IE and Opera, unfortunately have 2 tab stops on file input
            // which is unacceptable in our case, disable keyboard access
            if (window.attachEvent){
                // it is IE or Opera
                input.setAttribute('tabIndex', "-1");
            }
            return input;
        };
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