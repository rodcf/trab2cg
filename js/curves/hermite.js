// Referencia: https://www.cs.helsinki.fi/group/goa/mallinnus/curves/curves.html

function hermite(points, hermiteTangentsDir) {

    var vertices = [];

    for (var i = 0; i < points.length - 1; i++) {

        var p0 = points[i].position;
        var p1 = points[i+1].position;
        var t0 = hermiteTangentsDir[i];
        var t1 = hermiteTangentsDir[i+1];

        p0 = [p0.x, p0.y, p0.z];
        p1 = [p1.x, p1.y, p1.z];

        for(var j = 0; j < maxSteps; j++) {

            var u = j/maxSteps;
            var m1 = [Math.pow(u,3),Math.pow(u,2),u,1];
            var m2 = [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]];
            var m3 = [p0, p1, t0, t1];

            var p = math.multiply(m1, math.multiply(m2,m3));
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

function drawHermite(points, hermiteTangentsDir, curves, scene) {

    var lineMaterial = new THREE.LineBasicMaterial({color: "black"});
    var lineGeometry = new THREE.Geometry();
    
    vertices = hermite(points, hermiteTangentsDir);
    var currentPos = new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2])

    for (var i = 0; i < vertices.length - 1; i++) {

        newPos = new THREE.Vector3(vertices[i][0], vertices[i][1], vertices[i][2]);
        drawLine(currentPos, newPos, lineGeometry, lineMaterial, curves, scene);
        currentPos = newPos;
    }
}