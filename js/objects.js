var well = document.getElementById('well');
well.addEventListener('click', putPoint, false);

lastStringNum = 0;
tableSize = 7;
pointsNum = 0;

function clearAll() {
    $("#workBlock span").remove();
    $('#pointersBlock span').remove();
    $('td input').val("");
    for (var i = tableSize - 1; i >= 7; i--) {
        $('tr').eq(i).remove();
    }
    $('#resultTable tbody tr').remove();
    $('#resultTable tbody').append("<tr><td><input type=\"text\" readonly></td><td><input type=\"text\" readonly></td></tr>");
    $('#resultTable tbody').append("<tr><td><input type=\"text\" readonly></td><td><input type=\"text\" readonly></td></tr>");
    lastStringNum = 0;
    pointsNum = 0;
    tableSize = 7;
}

clearAll();

function addStringIntoTable() {
    $('table tbody').eq(0).append('<tr><td><input type="text"></td><td><input type="text"></td></tr>');
    tableSize++;
}

function addPoint(x, y) {
    $('td input').eq(lastStringNum * 2).val(x - well.offsetLeft);
    $('td input').eq(lastStringNum * 2 + 1).val(y - well.offsetTop);
    lastStringNum++;

    if (lastStringNum == tableSize) { addStringIntoTable(); }

    $('#workBlock').append('<span class="glyphicon glyphicon-record point"></span>');
    $('#workBlock span').eq(pointsNum).offset({top:y + 44, left:x - 7});
    pointsNum++;

    $('#workBlock span').on('click', function () {
        index = $('#workBlock span').index(this);
        if (index >= 0) {
            for (var i = index; i < lastStringNum - 1; i++) {
                next = $('td input').eq(i * 2 + 2).val();
                $('td input').eq(i * 2).val(next);
                next = $('td input').eq(i * 2 + 3).val();
                $('td input').eq(i * 2 + 1).val(next);
            }
            $('td input').eq((lastStringNum - 1) * 2).val("");
            $('td input').eq((lastStringNum - 1) * 2 + 1).val("");
            lastStringNum--;
            
            this.remove();
            pointsNum--;
        }
    });
}

function putPoint(event) {
    addPoint(event.layerX, event.layerY);
}

function randomPoints() {
    clearAll();
    num = Math.floor(Math.random() * 15) + 5;
    for (var i = 0; i < num; i++) {
        x = Math.floor(Math.random() * well.clientWidth) + well.offsetLeft;
        y = Math.floor(Math.random() * well.clientHeight) + well.offsetTop;
        addPoint(x, y);
    }
}

//------------------------

var ACCURACY = 0.001;
var k;
var leftBorder;
var topBorder;
var rightBorder;
var bottomBorder;
var objects = [];
var facilities = [];
var clusters = [];
var logs = [];

function getK() {
    value = $('#k').val();

    if (value == "") {
        alert('Error: "Facility num" is empty');
        return 0;
    }

    value = value.replace(/,/g, ".");

    if (!isNaN(parseFloat(value)) && isFinite(value)) {
        var maybeK = parseFloat(value);
        if (maybeK == (maybeK ^ 0)) {
            if ((maybeK > 0) && (maybeK <= 1000)) {
                return maybeK;
            } else {
                alert('Error: "Facility num" must be from 1 to 1000!');
                return 0;
            }
        } else {
            alert('Error: "Facility num" isn\'t integer!');
            return 0;
        }
    } else {
        alert('Error: "Facility num" is incorrect!');
        return 0;
    }
}

function getObjects() {
    var maybeObjects = [];
    if (pointsNum == 0) {
        alert('Error: no objects!');
        return;
    }

    for (var i = 0; i < pointsNum; i++) {
        x = $('td input').eq(i * 2).val();
        y = $('td input').eq(i * 2 + 1).val();

        if ((x == "") || (y == "")) {
            if ((x == "") && (y == "")) {
                continue;
            } else {
                if (x == "") {
                    alert('Error: x coordinate of object #' + i + ' is empty');
                } else {
                    alert('Error: y coordinate of object #' + i + ' is empty');
                }
                return;
            }
        }

        x = x.replace(/,/g, ".");
        y = y.replace(/,/g, ".");

        if (!isNaN(parseFloat(x)) && isFinite(x)) {
            var x = parseFloat(x);
            if ((x < 0) || (x > well.clientWidth - 1)) {
                alert('Error: wrong x coordinate of object #' + i + '! It must be from 0 to ' + (wall.well.clientWidth - 1) + ', to fit in the field.');
                return;
            }
        } else {
            alert('Error: x coordinate of object #' + i + ' is incorrect!');
            return;
        }

        if (!isNaN(parseFloat(y)) && isFinite(y)) {
            var y = parseFloat(y);
            if ((y < 0) || (y > well.clientWidth - 1)) {
                alert('Error: wrong y coordinate of object #' + i + '! It must be from 0 to ' + (wall.well.clientWidth - 1) + ', to fit in the field.');
                return;
            }
        } else {
            alert('Error: y coordinate of object #' + i + ' is incorrect!');
            return;
        }

        maybeObjects.push({x: x, y: y, id: i});
    }

    return maybeObjects;
}

function defineBorders() {
    leftBorder   = objects[0].x;
    rightBorder  = objects[0].x;
    topBorder    = objects[0].y;
    bottomBorder = objects[0].y;

    for (var i = 0; i < objects.length; i++) {
        if (leftBorder   > objects[i].x) { leftBorder   = objects[i].x; }
        if (rightBorder  < objects[i].x) { rightBorder  = objects[i].x; }
        if (topBorder    > objects[i].y) { topBorder    = objects[i].y; }
        if (bottomBorder < objects[i].y) { bottomBorder = objects[i].y; }
    }
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function randomPoint() {
    return { x: (Math.random() * (rightBorder - leftBorder) + leftBorder),
             y: (Math.random() * (bottomBorder - topBorder) + topBorder) };
}

function randomFacilities() {
    var maybeFacilities = [];
    for (var i = 0; i < k; i++) {
        maybeFacilities.push(randomPoint());
    }
    return maybeFacilities;
}

function distanceSum() {
    var sum = 0;
    for (var i = 0; i < objects.length; i++) {
        var min = distance(objects[i], facilities[0]);
        for (var j = 1; j < k; j++) {
            var d = distance(objects[i], facilities[j]);
            if (d < min) {
                min = d;
            }
        }
        sum += min;
    }
    return sum;
}

function groupingPointsToClusters() {
    for (var j = 0; j < k; j++) {
        clusters[j] = [];
    }
    for (var i = 0; i < objects.length; i++) {
        var min = distance(objects[i], facilities[0]);
        var minId = 0;
        for (var j = 1; j < k; j++) {
            var d = distance(objects[i], facilities[j]);
            if (d < min) {
                min = d;
                minId = j;
            }
        }
        clusters[minId].push(objects[i]);
    }
}

function massCenter(cluster) {
    var c = { x: 0, y: 0 };
    for (var i = 0; i < cluster.length; i++) {
        c.x += cluster[i].x;
        c.y += cluster[i].y;
    }
    c.x /= cluster.length;
    c.y /= cluster.length;
    return c;
}

function moveFacilitiesToClustersMassCenters() {
    for (var i = 0; i < k; i++) {
        if (clusters[i].length > 0) {
            facilities[i] = massCenter(clusters[i]);
        } else {
            facilities[i] = randomPoint();
        }
    }
}

function clearLogs() {
    logs = [];
}

function addLog() {
    logs.push({f: facilities, c: clusters});
}


var step;
var color = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#800000', '#00ffff', '#ffff00', '#808080', '#008000', '#000080', '#800080', '#808000', '#008080', '#000000']

function seeResult() {
    step = logs.length;

    $('#start').removeClass('disabled');
    $('#prev').removeClass('disabled');
    $('#position').removeClass('disabled');
    $('#position span').text(step + ' of ' + logs.length);
    $('#next').addClass('disabled');
    $('#result').addClass('disabled');

    $('#pointersBlock span').remove();
    
    for (var i = 0; i < k; i++) {
        $('#pointersBlock').append('<span class="glyphicon glyphicon-map-marker facility"></span>');
        $('#pointersBlock span').eq(i).offset({top:logs[step - 1].f[i].y + 44, left:logs[step - 1].f[i].x + 6});

        for (var j = 0; j < logs[step - 1].c[i].length; j++) {
            $('#workBlock span').eq(logs[step - 1].c[i][j].id).css('color', color[i]);
        }
    }
}

function writeResult() {
    for (var i = 2; i < k; i++) {
        $('#resultTable tbody').append("<tr><td><input type=\"text\" readonly></td><td><input type=\"text\" readonly></td></tr>");    
    }
    for (var i = 0; i < k; i++) {
        $('#resultTable tbody tr td input').eq(i * 2).val(logs[logs.length - 1].f[i].x);
        $('#resultTable tbody tr td input').eq(i * 2 + 1).val(logs[logs.length - 1].f[i].y);
    }
    seeResult();
}

function mainAlgo() {
    k = getK();
    if (k == 0) {return;}

    objects = getObjects();
    if (objects.length == 0) {return;}

    defineBorders();

    facilities = randomFacilities();

    clearLogs();
    addLog();

    var currentDistanceSum = distanceSum();
    var previousDistanceSum = 0;

    do {
        groupingPointsToClusters();
        moveFacilitiesToClustersMassCenters();

        previousDistanceSum = currentDistanceSum;
        currentDistanceSum = distanceSum();

        addLog();
    } while (Math.abs(previousDistanceSum - currentDistanceSum) > ACCURACY);

    writeResult();
}
