    <script type="text/javascript">

    var maxWidth = 500;
    var maxHeight = 500;
    var TO_RADIANS = Math.PI/180;

    $(document).ready(function () {
        $('#rotate').click(function(){

        });
        console.log("INIT")
        //initCanvas();
        initControls();
    });

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
    function initControls() {

        var myImage = null;
        var angle = 0;
        var scale = 1;
        var input = createInput($("#file div"));
        $(input).on('change', function(event) {
            $.when(loadFile(event.target.files[0]))
            .then(function(data){
                $.when(loadImage(data))
                .then(function(image){
                    console.log("image is ready")
                    console.log(image)
                    myImage = image.srcElement;
                    initCanvas(image.srcElement)
                })
            })
        });
        $(".edit").on("click", function(){
            var action = $(this).attr("data-transform");
            switch(action) {
                case "rotate":
                    console.log("rotate image");
                    //drawRotatedImage(context, imageObj, 64, 64, 45);
                    var canvas = document.getElementById('image')
                    var context = canvas.getContext('2d');
                    context.clear(true);
                    angle += 45;
                    drawRotatedImage(context, myImage, canvas.width/2, canvas.height/2, angle)
                    break;
                case "scale":
                    console.log("scale image");
                    var factor = parseInt($(this).attr("data-factor"), 10);
                    console.log(factor)
                    var canvas = document.getElementById('image')
                    var context = canvas.getContext('2d');
                    context.clear(true);
                    scale += (factor * 0.1);
                    drawScaledImage(context, myImage, canvas.width/2, canvas.height/2,  scale)
                    break;
            }
        });

    }
    function getContext() {
        return document.getElementById('image').getContext('2d');
    }
    function initCanvas(image) {
        var imgWidth  = image.width;
        var imgHeight = image.height;

        // Calculate the new image dimensions, so they fit
        // inside the maxWidth x maxHeight bounding box

        if (imgWidth >= maxWidth || imgHeight >= maxHeight) {

            // The image is too large,
            // resize it to fit a 500x500 square!

            if (imgWidth > imgHeight) {

                // Wide
                ratio = imgWidth / maxWidth;
                newWidth = maxWidth;
                newHeight = imgHeight / ratio;

            } else {

                // Tall or square
                ratio = imgHeight / maxHeight;
                newHeight = maxHeight;
                newWidth = imgWidth / ratio;

            }

        } else {
            newHeight = imgHeight;
            newWidth = imgWidth;
        }

        // Create the original canvas.

        var canvas = document.getElementById('image');
        var context = canvas.getContext('2d');
        trackTransforms(context);

        // Draw the dropped image to the canvas
        // with the new dimensions
        //context.drawImage(image, 0, 0, newWidth, newHeight);
        //resizeCanvasContainer(canvas, imgWidth, imgHeight, 45)
        var size = newSize(imgWidth, imgHeight, 0);
        canvas.width = size.width;
        canvas.height = size.height;

        $(canvas).attr({
            width: size.width,
            height: size.height
        }).css({
            marginTop: -size.height/2,
            marginLeft: -size.width/2
        });

        // Draw the dropped image to the canvas
        // with the new dimensions
        context.drawImage(image, 0, 0, newWidth, newHeight);

        // We don't need this any more
        image.remove();

        return;
    }
    function reDraw(canvas) {
        var context = canvas.getContext('2d');
        trackTransforms(context);
        // Clear the entire canvas
        var p1 = context.transformedPoint(0,0);
        var p2 = context.transformedPoint(canvas.width,canvas.height);
        context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    }
    function resizeCanvasContainer(canvas, width, height, angle){
        var newWidth,newHeight;
        var rads=angle*Math.PI/180;
        var cos = Math.cos(rads);
        var sin = Math.sin(rads);

        if (sin < 0) { sin = -sin; }
        if (cos < 0) { cos = -cos; }

        newWidth = height * sin + width * cos;
        newHeight = height * cos + width * sin;

        console.log("width: %s, height: %s", newWidth, newHeight);
        /*
        canvas.width = newWidth + 'px';
        canvas.height = newHeight + 'px';
        */
        return {
            width: newWidth,
            height: newHeight
        };
    }
    function newSize(width, height, angle){
        var rads = angle*Math.PI/180;
        var cos = Math.cos(rads);
        var sin = Math.sin(rads);
        var size = {
            width: 0,
            height: 0
        };
        if (sin < 0) { sin = -sin; }
        if (cos < 0) { cos = -cos; }
        size.width = height * sin + width * cos;
        size.height = height * cos + width * sin;

        console.log(size);
        return size;
    }
    function loadImage(event) {
        var img = new Image();
        var deferred = new jQuery.Deferred();
        img.src = event.target.result;
        img.alt = file.name;
        img.title = escape(file.name);
        img.onload = function(event) {
            deferred.resolve(event);
        }
        return deferred.promise();
    }
    function loadFile(file) {
        var reader = new FileReader();
        var deferred = new jQuery.Deferred();
        reader.onload = function(event) {
            deferred.resolve(event);
        }
        reader.readAsDataURL(file);
        return deferred.promise();
    }
    function createInput(container){
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
    }
    function drawRotatedImage(context, image, x, y, angle) {
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
    }
    function drawScaledImage(context, image, x, y, factor) {
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
    }
    // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(ctx){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        var transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }
    </script>