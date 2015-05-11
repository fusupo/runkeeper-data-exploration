$("document").ready(function() {

    var initial_data;

    var template = $('#template').html();
    Mustache.parse(template);

    var filenames;
    var xmls = [];

    var t_data = [];

    var loadSomething = function() {
        if (filenames.length > 0) {
            var xhr = $.get("data/" + filenames[0], function(e) {

                filenames.shift();

                var xml = e,
                    xmlDoc = $.parseXML(xml),
                    $xml = $(xmlDoc),
                    $title = $xml.find("trkseg time").first().text();
                var day = moment($title);
                var b = day.clone();

                t_data.push({
                    date: day.startOf('day').toDate(),
                    value: b.hour() + (b.minute() / 60)
                });

                xmls.push($xml);

                var m = $xml.find("trkseg trkpt"); //xmls[0].find("trkseg trkpt");
                var points = _.map(m, function(xxx) {
                    var obj = $(xxx);
                    return [parseFloat(obj.attr('lat')), parseFloat(obj.attr('lon'))];
                });

                //
                var times = _.map(m, function(xxx) {
                    var obj = $(xxx);
                    var t = moment(obj.find("time").text());
                    return t;
                });
                var durs = _.map(times, function(t, idx, l) {
                    if (idx > 0) {
                        return t.diff(l[idx - 1]);
                    }
                });
                var dists = _.map(points, function(p, idx, l) {
                    if (idx > 0) {
                        var p1 = l[idx - 1];
                        var a = p[0] - p1[0];
                        var b = p[1] - p1[1];
                        var c = Math.abs(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
                        return c * 1000;
                    }
                });
                var rates = _.map(dists, function(d, idx, l) {
                    if (idx > 0) {
                        if (durs[idx] === 0) {
                            return 1;
                        } else {
                            return 10000 * (d / durs[idx]);
                        }
                    }
                });

                //console.log(_.min(rates), _.max(rates));
                var scale = chroma.scale(['green', 'yellow', 'orange', 'red']).domain([0.25, 0.45]); //[_.min(rates), _.max(rates)]);
                var polylines = _.map(rates, function(r, idx, l) {
                    if (idx > 0) {
                        return L.polyline([points[idx - 1], points[idx]], {
                            color: scale(r).hex(),
                            weight: 2,
                            opacity: 0.5
                        });
                    }
                });

                polylines.shift();

                // var polyline = L.polyline([
                //     [37.810496, -122.254968],
                //     [37.801749, -122.261607]
                // ], {
                //     color: 'red',
                //     weight: 5
                // }).addTo(map);

                // polyline.on('mouseover', function(e) {
                //     console.log(b.format('MMMM Do YYYY, h:mm:ss a'));
                //     this.weight = 20;
                //     this.setStyle({
                //         color: 'red',
                //         weight: 10
                //     });
                // });

                // polyline.on('mouseout', function(e) {
                //     this.setStyle({
                //         color: 'red',
                //         weight: 5
                //     });
                // });

                L.featureGroup(polylines)
                    .bindPopup('Hello world!')
                    .on('click', function() {
                        alert('Clicked on a group!');
                    })
                    .addTo(map);

                loadSomething();

            });
        } else {

            // var m = xmls[0].find("trkseg trkpt");
            // var points = _.map(m, function(xxx) {
            //     var obj = $(xxx);
            //     return [obj.attr('lat'), obj.attr('lon')];
            // });

            // _.each(points, function(p) {
            //     var circle = L.circle([p[0], p[1]], 1, {
            //         color: 'red',
            //         fillColor: '#f03',
            //         fillOpacity: 0.5
            //     }).addTo(map);
            // });

            MG.data_graphic({
                title: "Over A Large Span of Days",
                data: t_data,
                target: '#time4',
                width: 600,
                height: 200,
                right: 40,
                chart_type: 'point'
            });

        }
    };

    var jqxhr = $.get("data/cardioActivities.csv", function(e) {
        // var parsed = $.csv.toArray(e, function(err, res) {
        //     console.log(res);
        // });
        initial_data = (Papa.parse(e, {
            // delimiter: "",	// auto-detect
            // newline: "",	// auto-detect
            header: true
                // dynamicTyping: false,
                // preview: 0,
                // encoding: "",
                // worker: false,
                // comments: false,
                // step: undefined,
                // complete: undefined,
                // error: undefined,
                // download: false,
                // skipEmptyLines: false,
                // chunk: undefined,
                // fastMode: undefined,
                // beforeFirstChunk: undefined
        }));

        filenames = _.filter(_.pluck(initial_data.data, 'GPX File'), function(v) {
            return v;
        });

        // var files = _.map(fileNames, function(fileName) {
        //     return {
        //         url: "data/" + fileName,
        //         execute: false
        //     };
        // });

        // var rendered = Mustache.render(template, initial_data);
        // $('#target').html(rendered);

        loadSomething();
        //console.log(files);

        // basket
        //     .require(files)
        //     .then(function() {
        //         console.log('loaded');
        //     });
    });
    //.done(function() {
    //     alert("second success");
    // }).fail(function() {
    //     alert("error");
    // }).always(function() {
    //     alert("finished");
    // });

    ///////////
    var map = L.map('map').setView([37.8039, -122.2571], 15);
    //toner-lines
    //terrain-lines
    var layer = new L.StamenTileLayer("toner-background");
    map.addLayer(layer);
    ///////////

    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //     attribution: 'who cares',
    //     maxZoom: 18
    // }).addTo(map);


});