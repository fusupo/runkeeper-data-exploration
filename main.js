$("document").ready(function() {

    var initial_data;

    var template = $('#template').html();
    Mustache.parse(template);

    var filenames;
    var xmls = [];

    var loadSomething = function() {
        //console.log(filenames.length);
        if (filenames.length > 0) {
            var xhr = $.get("data/" + filenames[0], function(e) {

                filenames.shift();

                var xml = e,
                    xmlDoc = $.parseXML(xml),
                    $xml = $(xmlDoc),
                    $title = $xml.find("trkseg time").first().text();
                var day = moment($title);
                //console.log(day.format("dddd, MMMM Do YYYY, h:mm:ss a"));

                xmls.push($xml);

                var m = $xml.find("trkseg trkpt"); //xmls[0].find("trkseg trkpt");
                var points = _.map(m, function(xxx) {
                    var obj = $(xxx);
                    return [parseFloat(obj.attr('lat')), parseFloat(obj.attr('lon'))];
                });

                // _.each(points, function(p) {
                //     var circle = L.circle([p[0], p[1]], 1, {
                //         color: 'red',
                //         fillColor: '#f03',
                //         fillOpacity: 0.5
                //     }).addTo(map);
                // });

                // var foo = points.splice(0, 25);
                // console.log(foo);

                var polyline = L.polyline(points, {
                    color: 'red',
                    weight: 1
                }).addTo(map);

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

        var rendered = Mustache.render(template, initial_data);
        $('#target').html(rendered);

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

    // Perform other work here ...

    // Set another completion function for the request above
    // jqxhr.always(function() {
    //     alert("second finished");
    // });

    var map = L.map('map').setView([37.8039, -122.2571], 15);
    //toner-lines
    //terrain-lines
    var layer = new L.StamenTileLayer("toner-background");
    map.addLayer(layer);

    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //     attribution: 'who cares',
    //     maxZoom: 18
    // }).addTo(map);


});