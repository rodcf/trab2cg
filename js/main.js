// UFRJ - Departamento de Ciência da Computação
// Computação Gráfica - 2019.2
// Trabalho 2
//
// Título: Visualizador de Curvas
// 
// Autor: Rodrigo Carvalho de Figueiredo
// Data: 02/12/2019
// 
// Descrição:
//
// Desenha uma dos quatro tipos de curva (Bezier, Catmull-Rom, B-Spline e Hermite)
// levando em conta os pontos de controle adicionados pelo usuário ao clicar
// com o botão direito no canvas. 
// O usuário pode então escolher dentre as opções de mostrar os pontos de controle 
// e o polígono de controle além de poder mudar o tipo de curva desenhada dinamicamente.
// Além disso, os pontos de controle inseridos podem ser movidos com o botão esquerdo,
// de forma que a curva desenhada é ajustada automaticamente à nova posição dos pontos de controle.
//
// Usa a biblioteca three.js para lidar com toda a parte gráfica, além de dragcontrols.js para
// lidar com o movimento dos pontos de controle na cena e math.js para algumas operações.

var camera, scene, renderer, controls;
var geometry, canvas;

var mouse = new THREE.Vector3();
var vec = new THREE.Vector3();
var mousePos = new THREE.Vector3();
var points = [];
var supportLines = [];
var curves = [];
var hermiteTangentsObjects = [];
var hermiteTangentsDir = [];
var curveTypeSelection = 1;
var showControlPoints = true;
var showControlPolygon = true;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

	geometry = new THREE.BufferGeometry();
    geometry.drawRange.count = 1;
    
    var vertices = new Array( 10000 ).fill( 0 ); // use an array with enough space and init with 0 values
    
    var positionAttribute = new THREE.Float32BufferAttribute( vertices, 3 );
    positionAttribute.usage = THREE.DynamicDrawUsage;
    geometry.setAttribute( 'position', positionAttribute );
    
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
    
    canvas = document.getElementById("canvas");
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;

    var lines = new THREE.Line( geometry, material );
    lines.frustumCulled = false;
    scene.add( lines );

    renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);
    document.body.appendChild( renderer.domElement );
    
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'contextmenu', onContextMenu, false );
    
    window.addEventListener( 'resize', onWindowResize, false );

    controls = new THREE.DragControls( points, camera, renderer.domElement );

    controls.addEventListener( 'drag', function ( event ) {
        draw();
    } );
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onContextMenu( event ) {

	event.preventDefault();
}

function onDocumentMouseDown( event ) {

    event.preventDefault();
    
    switch ( event.which ) {
        
        case 3: // right mouse click

            var coord = getMouseWorldCoord();
            addControlPoint( coord );
            break;
    }
}

function setCurveTypeSelection(value) {

    curveTypeSelection = value;
    draw();
}

function setShowControlPoints() {

    showControlPoints = !showControlPoints;
    toggleControlPoints();
}

function setShowControlPolygon() {

    showControlPolygon = !showControlPolygon;
    toggleControlPolygon(); 
}

function onDocumentKeyDown(event) {

    var keyCode = event.which;

    if (keyCode == 49) { // tecla 1
        curveTypeSelection = 1;
    }
    else if (keyCode == 50) { // tecla 2
        curveTypeSelection = 2;
    }
    else if (keyCode == 51) { // tecla 3
        curveTypeSelection = 3;
    }
    else if (keyCode == 52) { // tecla 4
        curveTypeSelection = 4;
    }
    else if (keyCode == 67) { // tecla C
        removeLastPoint();
        return;
    }
    else if (keyCode == 80) { // tecla P
        showControlPoints = !showControlPoints;
        document.getElementById("showControlPoints").checked = showControlPoints;
        toggleControlPoints();
        return;
    }
    else if (keyCode == 79) { // tecla O
        showControlPolygon = !showControlPolygon;
        document.getElementById("showControlPolygon").checked = showControlPolygon;
        toggleControlPolygon();
        return;
    }
    draw();
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function addControlPoint( coord ) {

    var geometry = new THREE.CircleGeometry(0.015);
    var material = new THREE.MeshBasicMaterial( { color: "red", transparent: true, opacity: 0.5 } );
    var circle = new THREE.Mesh( geometry, material );
    circle.position.x = coord.x;
    circle.position.y = coord.y;
    circle.position.z = coord.z;

    points.push(circle);

    if(showControlPoints)
        scene.add( circle );

    draw();
}

function removeLastPoint() {

    scene.remove(points.pop());
    hermiteTangentsDir.pop();
    draw();
}

function toggleControlPoints() {

    if(showControlPoints) {
        addObjects(points);
        controls.activate();
    }
    
    else {
        removeObjects(points);
        controls.deactivate();
    }
    draw();
}

function toggleControlPolygon() {

    if(showControlPolygon)
        addObjects(supportLines);
    
    else
        removeObjects(supportLines);

    draw();
}

function getMouseWorldCoord() {

    var x = event.offsetX;
    var y = event.offsetY;

    vec.set(
        ( x / window.innerWidth ) * 2 - 1,
        - ( y / window.innerHeight ) * 2 + 1,
        0.5 );

    vec.unproject( camera );

    vec.sub( camera.position ).normalize();

    var distance = - camera.position.z / vec.z;

    mousePos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    return mousePos;
}

function draw() {

    removeObjects(supportLines);
    removeObjects(curves);
    removeObjects(hermiteTangentsObjects);
    var numPoints = points.length;

    if( numPoints > 1 ) {

        if (showControlPolygon)
            drawControlPolygon();

        if (curveTypeSelection == 1)
            drawBezier(points, curves, scene); // Em bezier.js
        
        if (curveTypeSelection == 2)
            drawCatmullRom(points, curves, scene); // Em catmullrom.js
        
        if (numPoints > 3 && curveTypeSelection == 3) 
            drawBSpline(points, curves, scene); // Em bspline.js

        if (curveTypeSelection == 4) {
            drawHermiteTangents();
            drawHermite(points, hermiteTangentsDir, curves, scene); // Em hermite.js
        }
    }
}

function drawHermiteTangents() {
    
    for(var i = 0; i < points.length; i++) {

        var currentPos = points[i].position;

        if (hermiteTangentsDir[i])
            var dir = new THREE.Vector3(hermiteTangentsDir[i][0], hermiteTangentsDir[i][1], hermiteTangentsDir[i][2]);

        else {
            var dir = new THREE.Vector3(getRandomArbitrary(-1,1),getRandomArbitrary(-1,1),0);
            dir.normalize();
            hermiteTangentsDir.push([dir.x, dir.y, dir.z]);
        }

        var tangent = new THREE.ArrowHelper( dir, currentPos, 0.1, 0x0000ff );
        hermiteTangentsObjects.push(tangent);
        scene.add(tangent);
    }
}

function drawControlPolygon() {

    var lineMaterial = new THREE.LineBasicMaterial({color: 0xC0C0C0});
    var lineGeometry = new THREE.Geometry();

    for(var i = 0; i < points.length - 1; i++) {
                
        lineGeometry.vertices.push(
            points[i].position,
            points[i+1].position
        );
        var line = new THREE.Line( lineGeometry, lineMaterial );

        supportLines.push(line);
        scene.add(line);
    }
}

function addObjects(objectList) {

    objectList.forEach(obj => scene.add(obj));
}

function removeObjects(objectList) {

    objectList.forEach(obj => scene.remove(obj));
    objectList = [];
}

function animate() {

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}