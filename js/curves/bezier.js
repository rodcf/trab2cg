// Referencia: http://jsfiddle.net/rphv/3jkt16Ly/3/

function binomial(n, k) {

    var coeff = 1;
    for (var i = n - k + 1; i <= n; i++) coeff *= i;
    for (var i = 1; i <= k; i++) coeff /= i;
    return coeff;
}

function bezier(t, points) {

    var order = points.length - 1;

    var x = 0;
    var y = 0;
    var z = 0;

    for (i = 0; i <= order; i++) {
        x = x + (binomial(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (points[i].position.x));
        y = y + (binomial(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (points[i].position.y));
        z = z + (binomial(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (points[i].position.z));
    }

    return {
        x: x,
        y: y,
        z: z
    };
}

function drawBezier(points, curves, scene) {

    var lineMaterial = new THREE.LineBasicMaterial({color: "black"});
    var lineGeometry = new THREE.Geometry();
    var currentPos = points[0].position;
    var acc = 0.01;

    for (var i = 0; i < 1; i += acc) {

        var p = bezier(i, points);
        newPos = new THREE.Vector3(p.x, p.y, p.z)
        lineGeometry.vertices.push(
            currentPos,
            newPos
        );
        var curve = new THREE.Line( lineGeometry, lineMaterial );
        curves.push(curve);
        scene.add(curve)
        currentPos = newPos;
    }
}