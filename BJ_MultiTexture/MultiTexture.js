// TexturedQuad.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' v_TexCoord = a_TexCoord;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    ' vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
    ' vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
    ' gl_FragColor = color0 * color1;\n' +
    '}\n';

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Set the vertex information
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information.');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Set the texture
    if (!initTextures(gl, n)) {
        console.log('Failed to initialize the texture.');
        return;
    }
}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // Vertex coordinates, texture coordinates
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);
    var n = 4;  // The number of vertices

    // Create the buffer object
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    // Get the storage location of a_Position, assign, and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position.');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    // Repeat for a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord.');
        return -1;
    }

    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    var texture0 = gl.createTexture();   // Create texture objects
    var texture1 = gl.createTexture();

    if (!texture0 || !texture1) {
        console.log('Failed to create the texture object.');
        return false;
    }

    // Get the storage location of u_Sampler
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler0 || !u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler.');
        return false;
    }

    // Create the image object
    var image0 = new Image();
    var image1 = new Image();
    if (!image0 || !image1) {
        console.log('Failed to create the image objects.');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function () { loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
    image1.onload = function () { loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };

    // Tell the browser to load an image
    image0.src = 'sky.jpg';
    image1.src = 'circle.gif';

    return true;
}

var g_TexUnit0 = false;
var g_TexUnit1 = false;

function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    // Flip the image's y-axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Make the texture unit active
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        g_TexUnit0 = true;
    }
    else if (texUnit == 1) {
        gl.activeTexture(gl.TEXTURE1);
        g_TexUnit1 = true;
    }

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set the texture unit number to the sampler
    gl.uniform1i(u_Sampler, texUnit);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the rectangle
    if (g_TexUnit0 && g_TexUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}