// Referencia: https://github.com/thibauts/cubic-hermite-spline

function interpolate(t, points, tangents) {

    var n = points.length;    // number or points
    var d = 3; // vector dimensionality
    var v = []; // destination vector
  
    var t = t * (n - 1); // rescale t to [0, n-1]
    var i0 = t|0;        // truncate
    var i1 = i0 + 1;

    if(i0 > n-1) throw new Error('out of bounds');
    if(i0 === n-1) i1 = i0;

    var scale = i1 - i0;

    t = (t - i0) / scale;
    var t2 = t * t;
    var it = 1 - t;
    var it2 = it * it;
    var tt = 2 * t;
    var h00 = (1 + tt) * it2;
    var h10 = t * it2;
    var h01 = t2 * (3 - tt);
    var h11 = t2 * (t - 1);
    
    for(var i=0; i<d; i++) {

      v[i] = h00 * indexToXYZ(points[i0], i) +
             h10 * tangents[i0][i] * scale +
             h01 * indexToXYZ(points[i1], i) +
             h11 * tangents[i1][i] * scale;
    }
  
    return v;
}

function calcTangents(points) {

    var tangents = [];

    for (var i = 0; i < points.length - 1; i++) {

        var p0 = points[i].position;
        var p1 = points[i+1].position;
        var m0 = [];
        var m1 = [];
        
        if (i > 0) {

            m0 = [
                0.5 * (p1.x - points[i-1].position.x),
                0.5 * (p1.y - points[i-1].position.y),
                0.5 * (p1.z - points[i-1].position.z)
            ];
        }
        else {
        
            m0 = [
                p1.x - p0.x,
                p1.y - p0.y,
                p1.z - p0.z
            ];
        }
        if (i < points.length - 2) {   
            m1 = [
                0.5 * (points[i+2].position.x - p0.x),
                0.5 * (points[i+2].position.y - p0.y),
                0.5 * (points[i+2].position.z - p0.z)
            ];
        }
        else {
            m1 = [
                p1.x - p0.x,
                p1.y - p0.y,
                p1.z - p0.z
            ];
        }
        tangents[i] = m0;
        tangents[i+1] = m1;
    }
    return tangents;
}

function indexToXYZ(point, index) {

    if (index == 0)
        return point.position.x;
    
    if (index == 1)
        return point.position.y;
    
    return point.position.z;
}

function drawCatmullRom(points, curves, scene) {

    var lineMaterial = new THREE.LineBasicMaterial({color: "black"});
    var lineGeometry = new THREE.Geometry();
    var currentPos = points[0].position;
    var tangents = calcTangents(points);
    acc = 0.01;

    for (var t = 0; t < 1; t += acc) {

        var p = interpolate(t, points, tangents);
        newPos = new THREE.Vector3(p[0], p[1], p[2]);
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