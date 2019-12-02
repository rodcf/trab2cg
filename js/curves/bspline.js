// Referencia: http://www2.cs.uregina.ca/~anima/408/Notes/Interpolation/UniformBSpline.htm

const maxSteps = 100;

function bspline(points) {

    var vertices = [];

    for (var i = 0; i < points.length - 3; i++) {

        var p0 = points[i].position;
        var p1 = points[i+1].position;
        var p2 = points[i+2].position;
        var p3 = points[i+3].position;

        p0 = [p0.x, p0.y, p0.z];
        p1 = [p1.x, p1.y, p1.z];
        p2 = [p2.x, p2.y, p2.z];
        p3 = [p3.x, p3.y, p3.z];

        for(var j = 0; j < maxSteps; j++) {

            var u = j/maxSteps;
            var m1 = [Math.pow(u,3),Math.pow(u,2),u,1];
            var m2 = [[-1, 3, -3, 1], [3, -6, 3 , 0], [-3, 0, 3, 0], [1, 4, 1, 0]];
            var m3 = [p0, p1, p2, p3];

            var p = math.multiply(1/6, math.multiply(m1, math.multiply(m2,m3)));
            vertices.push(p);
        }
    }
    return vertices;
}

function drawLine(currentPos, newPos, lineGeometry, lineMaterial, curves, scene) {

    lineGeometry.vertices.push(
        currentPos,
        newPos
    );
    var curve = new THREE.Line( lineGeometry, lineMaterial );
    curves.push(curve);
    scene.add(curve)
}

function drawBSpline(points, curves, scene) {

    var lineMaterial = new THREE.LineBasicMaterial({color: "black"});
    var lineGeometry = new THREE.Geometry();
    
    vertices = bspline(points);
    var currentPos = new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2])

    for (var i = 0; i < vertices.length - 1; i++) {

        newPos = new THREE.Vector3(vertices[i][0], vertices[i][1], vertices[i][2]);
        drawLine(currentPos, newPos, lineGeometry, lineMaterial, curves, scene);
        currentPos = newPos;
    }
}