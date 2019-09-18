$(document).ready(function() {

    //Яндекс карта

    /*<svg class="svg-sprite-icon svg-sprite-icon__point2 svg-sprite-icon__point2_map"><use xlink:href="static/images/svg/symbol/sprite.svg#point2"></use></svg>*/

    var myMap;

    function preinit() {
        //<?if (is_array($content['citymappoint']) && !empty($content['citymappoint'])) {?>
                init([44.4831277554, 34.155151282821]); // PHP -> Заранее задать центрирование города.
                        //<?=json_encode($content['citymappoint'])?>
        //<?} else {?>
            /*ymaps.geocode(
                'Ялта', // PHP -> <?=$content['current_city']?>
                {results: 1}
            ).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0),
                    scoords = firstGeoObject.geometry.getCoordinates();
                init(scoords);
            });*/
        //<?}?>
    }

    function init(scoords) {
        var myMap = new ymaps.Map('js-detail-yamap', {
                center: scoords,
                zoom: 17,
                controls: ['zoomControl', 'geolocationControl', 'fullscreenControl']
            }),
            customItemContentLayout = ymaps.templateLayoutFactory.createClass(
                '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>'
            ),
            clusterer = new ymaps.Clusterer({
                preset: 'islands#blackClusterIcons',
                gridSize: 80,
                clusterOpenBalloonOnClick: true,
                groupByCoordinates: false,
                // clusterDisableClickZoom: true,
                // clusterHideIconOnBalloonOpen: false,
                geoObjectHideIconOnBalloonOpen: false,
                // clusterBalloonContentLayoutWidth: 260,
                // clusterBalloonContentLayoutHeight: 220,
                // clusterBalloonContentLayout: 'cluster#balloonCarousel',
                // clusterBalloonItemContentLayout: customItemContentLayout
            }),
            MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="popup-map">'
                    + '<a class="popup-map__close">'
                    + '<svg class="svg-sprite-icon svg-sprite-icon__close"><use xlink:href="static/images/svg/symbol/sprite.svg#close"></use></svg>'
                    + '</a>'
                    + '$[[options.contentLayout observeSize maxWidth=240 maxHeight=310]]'
                    + '<div class="popup-map__triangle"></div>'
                +'</div>',
                {
                    build: function () {
                        this.constructor.superclass.build.call(this);
                        this._$element = $('.popup-map', this.getParentElement());
                        this.applyElementOffset();
                        this._$element.find('.popup-map__close').on('click', $.proxy(this.onCloseClick, this));
                    },
                    clear: function () {
                        this._$element.find('.popup-map__close').off('click');
                        this.constructor.superclass.clear.call(this);
                    },
                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
                        if(!this._isElement(this._$element)) return;
                        this.applyElementOffset();
                        this.events.fire('shapechange');
                    },
                    applyElementOffset: function () {
                        var h1 = this._$element[0].offsetHeight;
                        var h2 = this._$element.find('.popup-map__triangle')[0].offsetHeight;
                        var topPosition = h1 + h2;
                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(topPosition)
                        });
                    },
                    onCloseClick: function (e) {
                        e.preventDefault();
                        this.events.fire('userclose');
                    },
                    getShape: function () {
                        if(!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();
                        var h1 = this._$element[0].offsetHeight;
                        var h2 = this._$element.find('.popup-map__triangle')[0].offsetHeight;

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top],
                            [position.left + this._$element[0].offsetWidth, position.top + h1 + h2]
                        ]));
                    },
                    _isElement: function (element) {
                        return element && element[0] && element.find('.popup-map__triangle')[0];
                    }
                }
            ),
            MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                //'<div class="popup-map__image">$[properties.photo]</div>' +
                '<div class="popup-map__data">' +
                    '<div class="popup-map__name"><strong>$[properties.name]</strong></div>' +
                    '<div class="popup-map__type"><span>$[properties.type]</span></div>' +
                    '<div class="popup-map__address"><span>$[properties.address]</span></div>' +
                '</div>'
            ),
            points = [
                //<?if (isset($content['objects_map']) && !empty($content['objects_map'])) {
                    //foreach ($content['objects_map'] as $i => $item) {?>
                        {
                            //coordinades: [<?=$item['coordinates_x']?>, <?=$item['coordinates_y']?>],
                            coordinades: [44.4831277554, 34.155151282821],
                            name: 'Валентина Петровна №9 1-к',
                            address: 'г. Ялта, ул. Комунаров, д.4',
                            //type: <?=(strlen($item['type'])) ? "'".strtoupper($item['type'])."'" : "'объект'"?>,
                            type: 'номер в отеле',
                            //<?if (strlen($item['photo'])) {?>photo: '<?=$item['photo']?>',<?}?>
                        },

                    //<?}
                //}?>
            ],
            geoObjects = [];

        iconLayoutCustom = ymaps.templateLayoutFactory.createClass([
            '<div class="map-point-wrap"><svg class="svg-sprite-icon svg-sprite-icon__point svg-sprite-icon__point_map"><use xlink:href="static/images/svg/symbol/sprite.svg#point"></use></svg></div>'
        ].join('')),

        iconLayoutCustomSelected = ymaps.templateLayoutFactory.createClass([
            '<div class="map-point-wrap"><svg class="svg-sprite-icon svg-sprite-icon__point svg-sprite-icon__point_map"><use xlink:href="static/images/svg/symbol/sprite.svg#point-green"></use></svg></div>'
        ].join('')),

        ymaps.option.presetStorage.add('renderlife#mark', {
            iconLayout: iconLayoutCustom,
            iconShape: {
                type: 'Circle',
                coordinates: [0, -20],
                radius: 30
            }
        });
        ymaps.option.presetStorage.add('renderlife#mark_selected', {
            iconLayout: iconLayoutCustomSelected,
            iconImageSize: [35, 50],
            iconImageOffset: [-3, -42]
        });
        for(var i = 0, len = points.length; i < len; i++) {
            geoObjects[i] = new ymaps.Placemark(
                points[i].coordinades,
                {
                    type: points[i].type,
                    address: points[i].address,
                    name: points[i].name,
                    photo: points[i].photo,
                },
                {
                    balloonShadow: false,
                    balloonLayout: MyBalloonLayout,
                    balloonContentLayout: MyBalloonContentLayout,
                    balloonPanelMaxMapArea: 0,
                    balloonOffset: [130, -25],
                    preset: 'renderlife#mark',
                }
            );
            geoObjects[i].events.add('balloonopen', function (e) {
                e.originalEvent.currentTarget.options.set({preset: 'renderlife#mark_selected'});
            });
            geoObjects[i].events.add('balloonclose', function (e) {
                e.originalEvent.currentTarget.options.set({preset: 'renderlife#mark'});
            });
        }
        clusterer.add(geoObjects);
        myMap.geoObjects.add(clusterer);

        myMap.behaviors.disable('scrollZoom');

        $('.trade-point a').click(function(e){
            var th = $(this),
                objs = myMap.geoObjects.get(0).getGeoObjects();
            if (typeof points != 'undefined') {
                for (var i = 0; i < points.length; i++) {
                    if (points[i].name == th.text()) {
                        myMap.setCenter(points[i].coordinades, 10);
                    }
                }
            }
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].properties.get('name') == th.text()) {
                    objs[i].balloon.open();
                }
            }
        });
    }

    ymaps.ready(preinit);


})//END document.ready


