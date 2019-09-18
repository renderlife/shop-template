$(document).ready(function () {

    // Расширяем компонент moment
    window['moment-range'].extendMoment(moment); 

    // Настройки сайта для js
    var setting = {};
    setting.maxDataPickerDay = 7;
    setting.dataPickerFormat = "DD.MM.YYYY";
    setting.start = moment();
    setting.applyButton = 'Применить';
    setting.cancelButton = 'Отмена';
    setting.end = moment().add(30, 'days');
    setting.daysOfWeekRu = [
        "Вс",
        "Пн",
        "Вт",
        "Ср",
        "Чт",
        "Пт",
        "Сб"
    ];
    setting.monthNamesRu = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
    ];

    svg4everybody({});

    $('#nav-icon3').click(function(){
      $(this).toggleClass('open');
    });

    // daterangepicker.com
    // Дата заезда/выезда, для главной страницы и страницы списка объектов
    $('.js-drpicker-single').daterangepicker({
        "singleDatePicker": true,
        "minDate": moment(),
        "maxDate": moment().add(365, 'days'),
        "autoUpdateInput": false,
        //"alwaysShowCalendars": true,
        "locale": {
            "format": setting.dataPickerFormat,
            "daysOfWeek": setting.daysOfWeekRu,
            "monthNames": setting.monthNamesRu,
            "firstDay": 1
        },
        //"startDate": '',
        //"startDate": setting.start,
        //"endDate": "12/08/2018"
    }, function(start, end, label) {
       $(this)["0"].element.val(start.format('DD.MM.YYYY'))
    })

    // Диапазон дат заезда/выезда, для детальной страницы
    $('.js-drpicker').daterangepicker({
        //"minYear": 2018,
        //"maxYear": 2019,
        "autoUpdateInput": false,
        "minDate": moment(),
        "maxDate": moment().add(365, 'days'),
        //"autoApply": true,
        "opens": "left",
        /*"maxSpan": {
            "days": setting.maxDataPickerDay
        },*/
        "locale": {
            "format": setting.dataPickerFormat,
            "separator": "-",
            "weekLabel": "W",
            "daysOfWeek": setting.daysOfWeekRu,
            "monthNames": setting.monthNamesRu,
            "firstDay": 1,
            "applyLabel": setting.applyButton,
            "cancelLabel": setting.cancelButton,
        },
        // Блокирование даты
        isInvalidDate: function(ele) {
            var currDate = moment(ele._d).format('DD.MM.YYYY')
            if (window.disableDates) {
                var disableDates = window.disableDates
                return disableDates.indexOf(currDate) != -1;
            }
        },
        // Стилизация дат
        isCustomDate: function(ele) {
            var currDate = moment(ele._d).format('DD.MM.YYYY')
            if (window.disableDates) {
                var disableDates = window.disableDates
                if (disableDates.indexOf(currDate) != -1) {
                    return 'reserv'
                }
            }
            if (window.fromDisableDates) {
                var fromDisableDates = window.fromDisableDates
                if (fromDisableDates.indexOf(currDate) != -1) {
                    return 'reserv-from'
                }
            } 
            if (window.toDisableDates) {
                var toDisableDates = window.toDisableDates
                if (toDisableDates.indexOf(currDate) != -1) {
                    return 'reserv-to'
                }
            } 
        }
        //"startDate": setting.start,
        //"endDate": ""
    }, function(start, end, label) {
        //console.log('Выбраны даты: ' + start.format('DD/MM/YYYY') + ' до ' + end.format('DD/MM/YYYY'));
    });

    // В фильтрах
    // а также устанавливаем значение инпута диапазона дат в поле заезд/выезд
    // вручную для того чтобы можно было показать плейсхолдер при очистке
    $('input.js-filter__date_from_to_input[name="date_from_to"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format(setting.dataPickerFormat) + '-' + picker.endDate.format(setting.dataPickerFormat));
    });

    // В форме бронирования объекта на детальной странице
    // при положительной валидации сообщение под input не выводится
    // поэтому его надо спрятать
    // а также устанавливаем значение инпута диапазона дат в поле заезд/выезд
    // вручную для того чтобы можно было показать плейсхолдер при очистке
    $('input.js-catalog-detail-order__input[name="date_from_to"]').on('apply.daterangepicker', function(ev, picker) {
        var pStartDate = picker.startDate.format(setting.dataPickerFormat)
        var pEndDate = picker.endDate.format(setting.dataPickerFormat)
        var isIntersection = false
        var range = moment.range(moment(pStartDate, 'DD-MM-YYYY'), moment(pEndDate, 'DD-MM-YYYY'));
 
        if (window.disableDates && range) {
            var disableDates = window.disableDates
            var selectDays = Array.from(range.by('days'))
            var selectDaysFormat = selectDays.map(function(item) {
              return item.format("DD.MM.YYYY")
            })
            var dif = selectDaysFormat.diff(disableDates)
            isIntersection = (selectDaysFormat.length != dif.length)
        }

        if (!isIntersection) {
            $(this).val(pStartDate + '-' + pEndDate)
            if ($(this).is(":valid")) {
                $(this).closest('.input-wrap').siblings('.invalid-feedback-fake').hide()
            }
        } else {
            // Открываем модалку и передаем в нее заголовок, сообщение и включаем кнопки
            var title = 'Внимание!'
            var textMessage = 'Вы выбрали даты которые ранее уже были забронированны. Выберите другие даты заезда и отъезда.'
            showModalAlert(title, textMessage, ['close'])
            $('input.js-catalog-detail-order__input[name="date_from_to"]').val('')
        }

        //scrollOrderForm();

        // Делаем два запроса чтобы обновить блок с ценами и блок с общей стоимостью
        // может в итоге всё таки оставлю один запрос
        getPriceForPeriod($(this).val(), 'price');
        getPriceForPeriod($(this).val(), 'total');
    });

    // Обновляем цены при загрузке страницы, если были переданы параметры дат заезда и выезда
    // сделал js ом чтобы не сбрасывать кеш компонента детальной страницы
    var query = getQueryParams(document.location.search)
    if (query.date_from_to) {
        getPriceForPeriod(query.date_from_to, 'price')
        getPriceForPeriod(query.date_from_to, 'total')
    }

    $('input[name="date_from_to"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        $(this).closest('.input-wrap').siblings('.invalid-feedback-fake').show();
        //scrollOrderForm();
    });

    $('input[name="number_of_guests"]').on('change', function() {
        if ($(this).is(":valid")) {
            $(this).closest('.input-wrap').siblings('.invalid-feedback-fake').hide();
        } else {
            $(this).closest('.input-wrap').siblings('.invalid-feedback-fake').show();
        }
    });

    // Установка псевдо псейс-холдеров
    if ($('.js-drpicker-single[name=date_from]').val() == '') {
        $('.js-drpicker-single[name=date_from]').val('Заезд');
    }

    if ($('.js-drpicker-single[name=date_to]').val() == '') {
        $('.js-drpicker-single[name=date_to]').val('Отъезд');
    }

    //$('.js-drpicker').val('');

    //Показываем ссылки к значкам разработчиков
    $('.js-developer-logo').hover(function() {
        $(this).find('.is-developer-logo__name_red').addClass('__color');
        $(this).find('.js-developer-logo__image').hide();
        $(this).find('.js-developer-logo__image_color').show();
        $(this).find('.js-developer-logo__desc').fadeIn();
    }, function() {
        $(this).find('.is-developer-logo__name_red').removeClass('__color');
        $(this).find('.js-developer-logo__image').show();
        $(this).find('.js-developer-logo__image_color').hide();
        $(this).find('.js-developer-logo__desc').fadeOut();
    });

    // Слик (слайдер) для тизера
    var $slickElement = $('.js-catalog-list-item__section-image-slider');

    $slickElement.on('init reInit afterChange', function(event, slick, currentSlide, nextSlide){
        //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
        var i = (currentSlide ? currentSlide : 0) + 1;
        var $status = $(this).siblings('.catalog-list-item__slider-paging-wrap-info').find('.js-catalog-list-item__slider-paging-info');
        $status.text(i + '/' + slick.slideCount);
    });

    $slickElement.slick({
        infinite: true,
        lazyLoad: 'ondemand'
    });

    // Кнопка Вверх
    /*function() {
        function e() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
            1 !== e ? u.fadeIn() : u.fadeOut()
        }

        function t() {
            f.isInViewport() ? u.fadeOut() : u.fadeIn()
        }

        function n() {
            p.scrollTop() > 700 ? u.fadeIn() : u.fadeOut()
        }
        var r = ".js-toTopButtonWrapper",
            s = $(r),
            d = ".js-toTopButton",
            u = $(".js-toTopButtonWrapper"),
            p = $(window),
            f = $("header#page-header");
        o.on("click", d, function() {
            return $(l + ("[" + c + "='1']")).click(), $("body,html").animate({
                scrollTop: 0
            }, 400), null
        }), a.isMainPage() && s.appendTo("body"), a.isMainPage() ? a.isMainPage() && (o.on(i.normalScrollMainPage, function() {
            t()
        }), o.on(i.scrollToPageSection, function(t) {
            var n = t.sectionIndex;
            e(n)
        })) : $(window).scroll(function() {
            n()
        })
    }()*/

    // Кнопка на верх
    var scrollTopShown = false;

    $(".js-scrollTop").click(function() {
      $("html, body").animate({ scrollTop: 0 }, 1000);
      return false;
    });

    if ($(window).scrollTop() > 500) {
      scrollTopShown = true;
      $('.scrollTop__wrapper').stop().fadeIn('500');
    }

    $(window).on('scroll', function() {
      if ($(window).scrollTop() > 500 && !scrollTopShown) {
        scrollTopShown = true;
        $('.scrollTop__wrapper').stop().fadeIn('fast');
      } else if ($(window).scrollTop() < 500 && scrollTopShown) {
        scrollTopShown = false;
        $('.scrollTop__wrapper').stop().fadeOut('fast');
      }
    });

    // Скролл по анкору
    function scrollToAnchor(id){
        var el = $("#" + id);
        $('html,body').animate({scrollTop: el.offset().top}, 1000);
    }

    // Навешиваем события на все ссылки с классом
    $(".js-scroll-link").click(function() {
        var idElToScroll = $(this).data('scroll_to');
        scrollToAnchor(idElToScroll);
    });

    // Кнопки +/- для формы количество
    $('body').on("click", ".dropdown-menu-person", function (e) {
        $(this).parent().is(".show") && e.stopPropagation();
    });

    $('.js-btn-number').click(function(e){
        e.preventDefault();

        fieldName = $(this).attr('data-field');
        type      = $(this).attr('data-type');
        var input = $("input[name='"+fieldName+"']");
        var currentVal = parseInt(input.val());
        if (!isNaN(currentVal)) {
            if(type == 'minus') {
                if(currentVal > input.attr('min')) {
                    input.val(currentVal - 1).change();
                }
                if(parseInt(input.val()) == input.attr('min')) {
                    $(this).attr('disabled', true);
                }
            } else if(type == 'plus') {
                if(currentVal < input.attr('max')) {
                    input.val(currentVal + 1).change();
                }
                if(parseInt(input.val()) == input.attr('max')) {
                    $(this).attr('disabled', true);
                }
            }
        } else {
            input.val(0);
        }
    });

    $('.js-input-number').focusin(function(){
       $(this).data('oldValue', $(this).val());
    });

    $('.js-input-number').change(function() {
        minValue =  parseInt($(this).attr('min'));
        maxValue =  parseInt($(this).attr('max'));
        valueCurrent = parseInt($(this).val());

        name = $(this).attr('name');
        if(valueCurrent >= minValue) {
            $(".js-btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
        } else {
            alert('Простите, но меньше выбрать нельзя');
            $(this).val($(this).data('oldValue'));
        }
        if(valueCurrent <= maxValue) {
            $(".js-btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
        } else {
            alert('Простите, но достигнут максимум');
            $(this).val($(this).data('oldValue'));
        }

        // Выводим текстовый результат
        var textResult = '';
        var gost = 0;
        var det = 0;
        var mlad = 0;
        var input = $('.js-input-number');
        $.each( input, function( key, value ) {
            type = $(value).attr('result');
            if (type == 'взрослые') {
                gost = gost + parseInt($(value).val());
            } else if (type == 'дети') {
                det = det + parseInt($(value).val());
            } else if (type == 'младенцы') {
                mlad = mlad + parseInt($(value).val());
            }
        });

        // Нельзя добавить детей и младенцев без хотябы 1 взрослого
        if (!gost && (mlad > 0 || det > 0) ) {
            setTimeout(function() {
                $('.js-input-group-adults .js-btn-number[data-type=plus]').click();
            }, 1);
        }

        // Если все поля 0, то возвращаем как было
        if (!gost && !det && !mlad) {
            textResult = '';
        }

        // Склоняем гостей
        gost += det;
        if (gost == 1) {
            textResult = gost + ' гость';
        } else if (gost > 1 && gost < 5) {
            textResult = gost + ' гостя';
        } else if (gost >= 5) {
            textResult = gost + ' гостей';
        }

        // Склоняем младенцев
        if (mlad == 1) {
            textResult += ', ' + mlad + ' младенец';
        } else if (mlad > 1 && mlad < 5) {
            textResult += ', ' + mlad + ' младенца';
        } else if (mlad >= 5) {
            textResult += ', ' + mlad + ' младенцев';
        }

        $('.js-input-person').val(textResult).change();
    });

    $(".js-input-number").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    // Так как бутстрап не может валидировать поля у которых есть атрибут readonly
    // мы делает своего рода свой кастомный readonly
    $(".readonly").on('keydown paste', function(e){
        e.preventDefault();
    });

    // Ленивая загрузка - скрипт библиотеки отключен
    //$("img.lazyload").lazyload();

    // Скроем сепаратор разделяющий чекбоксы при нажатии на кнопку расширенный фильтр
    $('.js-more-filter__link').click(function() {
        $('.js-btn-secondary-filter').toggleClass('mt-0');
    });

    // Форма бронирования суточных объектов на детальной странице
    $('.js-order-button').click(function(event) {
        event.preventDefault();
        var thisBut = this;

        var formOrder = $('.js-order-form');
        var formOrderDataJson = $(formOrder).serializeObject();
        
        // Для того чтобы вылезли сообщения валидации под инпутами нужно выключить у них артибут readonly на время
        formOrder.find('input:not(.js-input-number)').prop('readonly', false);

        // Админу не обязательно вводить кол-во гостей
        if (window.isAdmin && !formOrderDataJson.number_of_guests) {
            formOrderDataJson.number_of_guests = true
        }

        // Валидация
        if (formOrderDataJson.date_from_to && formOrderDataJson.number_of_guests) {
            if (window.isAdmin) {
                // Блокируем кнопку
                $(thisBut).attr("disabled", "disabled")
                $('#orderModal').find('input[name=name]').val('Админ')
                $('#orderModal').find('input[name=phone]').val('+7(999)999-99-99')
                $('.js-order-modal-button').click()
            } else {
               // Открываем модалку
                $('#orderModal').modal('toggle');
            } 
        } else {
            console.log(formOrderDataJson);
            // Ошибка валидации
            formOrder.addClass('is-invalid');
            formOrder.addClass('was-validated');
        }

        // Снова через 2 сек включаем атрибут readonly чтобы при повторном нажатии мобильному пользователю не была показана клавиатура
        setTimeout(function() {
            formOrder.find('input:not(.js-input-number)').prop('readonly', true);
        }, 2000);
        
    });

    // Форма бронирования месячных объектов на детальной странице
    $('.js-order-mount-button').click(function(event) {
        event.preventDefault();

        // Открываем модалку
        $('#orderModal').modal('toggle');
    });

    // Форма отправки заказа в модальном окне
    $('.js-order-modal-button').click(function(event) {
        event.preventDefault();
        var thisBut = this;

        // Блокируем кнопку
        $(thisBut).attr("disabled", "disabled")

        // Получаем стоимость из формы брони для отправки
        // а также серриализуем форму брони
        var formOrder = $('.js-order-form')

        // Заглушка для объектов по суточно
        if (formOrder != undefined) {
            var totalStr = $('.js-catalog-detail-order__total').data('total')
            $(formOrder).find('input[name=total]').val(totalStr)
            var formOrderData = $(formOrder).serialize()
        }

        var formModal = $(thisBut).closest('form')
        var formModalData = formModal.serialize()

        // Заглушка для объектов по суточно
        if (formOrder != undefined) {
            var mergeData = mergeValues(formOrderData, formModalData)
        } else {
            var mergeData = formModalData
        }

        // Добавляем класс валидации
        formModal.addClass('was-validated')

        // Серриализация для валидации
        var formModalJson = formModal.serializeObject()

        // Валидация
        if (formModalJson.name && formModalJson.phone) {
            // Отправка
            $.ajax({
                type: 'POST',
                url: "/ajax/ajaxSendOrder.php",
                dataType: "json",
                timeout: 10000,
                data: mergeData,
                success: function(data){
                    if (window.isAdmin) {
                        if (data.status == 'ok') {
                            window.location.href = window.location.href
                        } else {
                            alert('Ошибка отправки данных, попробуйте позже')
                        }
                    } else {
                        if (data.status == 'ok') {
                            formModal.find('.js-alert').fadeIn('fast')
                            formModal.find('input').attr("disabled", "disabled")
                            formModal.removeClass('was-validated')
                            setTimeout(function() {
                                formModal.find('input').val('')
                                $('#orderModal').modal('toggle')
                                formModal.find('.js-alert').fadeOut('fast')
                            }, 4000)
                        } else {
                            $(thisBut).removeAttr("disabled")
                            alert('Ошибка отправки данных, попробуйте позже')
                        }
                    }
                }
            });
        } else {
            // Ошибка валидации
            console.log('Введите имя и телефон');
            $(thisBut).removeAttr("disabled")
        }
    });

    // Форма отправки формы обратного звонка
    $('.js-call-me-modal-button').click(function(event) {
        event.preventDefault()
        event.stopPropagation()
        var thisBut = this

        // Блокируем кнопку
        $(thisBut).attr("disabled", "disabled")

        var formModal = $(thisBut).closest('form')

        //Добавим ID объекта и URL текущей страницы в форму
        formModal.find('input[name=url_source]').val(location.href)
        var object_id = $('.js-order-form').find('input[name=object_id]').val()
        formModal.find('input[name=object_id]').val(object_id)

        // Серриализация после добавления дополнительных данных
        var formModalData = formModal.serialize()

        // Серриализация для валидации
        var formModalJson = formModal.serializeObject()

        // Добавляем класс валидации
        formModal.addClass('was-validated')

        // Валидация
        if (formModalJson.phone && formModalJson.name) {
            // Отправка
            $.ajax({
                type: 'POST',
                url: "/ajax/ajaxSendOrder.php",
                dataType: "json",
                timeout: 10000,
                data: formModalData,
                success: function(data){
                    if (data.status == 'ok') {
                        formModal.find('.js-alert').fadeIn('fast')
                        formModal.find('input').attr("disabled", "disabled")
                        formModal.removeClass('was-validated')
                        setTimeout(function() {
                            formModal.find('input').val('')
                            $('#callModal').modal('toggle')
                            formModal.find('.js-alert').fadeOut('fast')
                        }, 4000)
                    } else {
                        $(thisBut).removeAttr("disabled")
                        alert('Ошибка отправки данных, попробуйте позже')
                    }
                }
            });
        } else {
            // Ошибка валидации
            console.log('Введите имя и телефон')
            $(thisBut).removeAttr("disabled")
        }
    });

    //Добавим ID объекта в форму
    $('#messageModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var object_id = button.data('object_id')
        var modal = $(this)
        modal.find('input[name=object_id]').val(object_id)
    })

    //Добавим ID объекта, статус, действие в форму подтверждения действия над бронью
    $('#actionConfirmModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var id = button.data('id')
        var status = button.data('status')
        var action = button.data('action')
        var cacheId = button.data('cache_id')
        var modal = $(this)
        modal.find('input[name=id]').val(id)
        modal.find('input[name=status]').val(status)
        modal.find('input[name=action]').val(action)
        modal.find('input[name=cache_id]').val(cacheId)
    })

    // Форма отправки сообщения
    $('.js-message-modal-button').click(function(event) {
        event.preventDefault();
        event.stopPropagation()
        var thisBut = this

        // Блокируем кнопку
        $(thisBut).attr("disabled", "disabled")

        var formModal = $(thisBut).closest('form')

        /*var object_id = $(thisBut).data(object_id)
        if (!object_id) {
            object_id = $('.js-order-form').find('input[name=object_id]').val()
        }
        formModal.find('input[name=object_id]').val(object_id)*/

        // Серриализация после добавления дополнительных данных
        var formModalData = formModal.serialize()

        // Серриализация для валидации
        var formModalJson = formModal.serializeObject()

        // Добавляем класс валидации
        formModal.addClass('was-validated')

        // Валидация
        if (formModalJson.phone && formModalJson.name && formModalJson.message) {
            $.ajax({
                type: 'POST',
                url: "/ajax/ajaxSendOrder.php",
                dataType: "json",
                timeout: 10000,
                data: formModalData,
                success: function(data){
                    if (data.status == 'ok') {
                        formModal.find('.js-alert').fadeIn('fast')
                        formModal.find('input').attr("disabled", "disabled")
                        formModal.find('textarea').attr("disabled", "disabled")
                        formModal.removeClass('was-validated')
                        setTimeout(function() {
                            formModal.find('input').val('')
                            formModal.find('textarea').val('')
                            $('#messageModal').modal('toggle')
                            formModal.find('.js-alert').fadeOut('fast')
                        }, 4000)
                    } else {
                        $(thisBut).removeAttr("disabled")
                        alert('Ошибка отправки данных, попробуйте позже')
                    }
                }
            });
        } else {
            // Ошибка валидации
            console.log('Введите имя, телефон и сообщение');
            $(thisBut).removeAttr("disabled")
        }
    });

    //Добавим название авто в форму
    $('#orderGeneralModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var car_name = button.data('car_name')
        var modal = $(this)
        modal.find('input[name=car_name]').val(car_name)
    })

    // Форма универсальной заявки с комментарием
    // - заказ авто
    $('.js-order-general-modal-button').click(function(event) {
        event.preventDefault();
        event.stopPropagation()
        var thisBut = this
        var formModal = $(thisBut).closest('form')
        var modalGeneral = $('#orderGeneralModal')
        var title = modalGeneral.find('.js-modal-title')

        // Блокируем кнопку
        $(thisBut).attr("disabled", "disabled")

        // Серриализация после добавления дополнительных данных
        var formModalData = formModal.serialize()

        // Серриализация для валидации
        var formModalJson = formModal.serializeObject()

        // Добавляем класс валидации
        formModal.addClass('was-validated')

        // Валидация
        if (formModalJson.phone && formModalJson.name && formModalJson.message) {
            $.ajax({
                type: 'POST',
                url: "/ajax/ajaxSendOrder.php",
                dataType: "json",
                timeout: 10000,
                data: formModalData,
                success: function(data){
                    if (data.status == 'ok') {
                        formModal.find('.js-alert').fadeIn('fast')
                        formModal.find('input').attr("disabled", "disabled")
                        formModal.find('textarea').attr("disabled", "disabled")
                        formModal.removeClass('was-validated')
                        setTimeout(function() {
                            formModal.find('input').val('')
                            formModal.find('textarea').val('')
                            modalGeneral.modal('toggle')
                            formModal.find('.js-alert').fadeOut('fast')
                        }, 4000)
                    } else {
                        $(thisBut).removeAttr("disabled")
                        alert('Ошибка отправки данных, попробуйте позже')
                    }
                }
            });
        } else {
            // Ошибка валидации
            console.log('Введите имя, телефон и сообщение');
            $(thisBut).removeAttr("disabled")
        }
    });

    // Форма отправки подтверждения или удаления брони
    $('.js-confirm-modal-button').click(function(event) {
        event.preventDefault()
        event.stopPropagation()
        var thisBut = this

        $(thisBut).attr("disabled", "disabled")

        var formModal = $(thisBut).closest('form')

        // Серриализация после добавления дополнительных данных
        var formModalData = formModal.serialize()

        // Серриализация для валидации
        var formModalJson = formModal.serializeObject()

        // Валидация
        if (formModalJson.id && formModalJson.action) {
            $.ajax({
                type: 'POST',
                url: "/ajax/ajaxActionReserv.php",
                dataType: "json",
                timeout: 10000,
                data: formModalData,
                success: function(data){
                    if (data.status == 'ok') {
                        formModal.find('.js-alert').fadeIn('fast')
                        setTimeout(function() {
                            formModal.find('input').val('')
                            $('#actionConfirmModal').modal('toggle')
                            formModal.find('.js-alert').fadeOut('fast')
                            window.location.href = window.location.href
                        }, 1500)
                    } else {
                        alert('Ошибка отправки данных, попробуйте позже')
                    }
                }
            });
        }
    });

    // Получени по ajax и обновление блока с ценами
    function getPriceForPeriod(period, action){
        var formMessage = $('.js-message-modal-form')

        // Осветляем блоки до получения данных
        if (action == 'price') {
            $('.js-catalog-detail-order__price').css({'opacity':0.22})
        } else {
            $('.js-catalog-detail-order__total-price').css({'opacity':0.22})
        }

        if (period && period.length > 0) {
            $.ajax({
                type: 'POST',
                url: "",
                dataType: "html",
                timeout: 10000,
                data: {
                    "date_from_to": period,
                    "action": action,
                },
                success: function(data){
                    if (action == 'price') {
                        $('.js-catalog-detail-order__price').html(data).css({'opacity':1})
                    } else {
                        $('.js-catalog-detail-order__total-price').html(data).css({'opacity':1})
                    }
                }
            });
        } else {
            // Ошибка валидации
            console.log('Ошибка')
        }
    }

    // Копирование реферальной ссылки
    $(".js-referral-copy").click(function(event) {
        event.preventDefault()
        event.stopPropagation()
        $('#js-referral-copy-textarea').select();
        document.execCommand('copy');
    });

    // Из за проблемы с датапикерами, а именно с их плейсхолдерами Заезд и Выезд
    // пришлость сделать сабмит формы через js чтобы при отправке формы с неустановленными
    // датапиккерами Заезд и Выезд, очищать value и передавать пустое значение
    // насколько я помню в датапикере настроить это не получилось
    $(".js-btn-secondary-filter, .js-btn-secondary-filter-detail").click(function() {
        var dataPicks = $(this).closest('form').find('.js-drpicker');
        $(dataPicks).each(function(index){
            /*if ($(this).val() == 'Заезд' || $(this).val() == 'Отъезд') {
                $(this).val('');
            }*/
            // [TODO - проверить нужен или не нужен этот код]
            // Возможно нужно было только в одиночных а двойной вдет себя по другому
            // плейсхолдер в нем работает нормально
            if ($(this).val() == 'Даты заезда/отъезда') {
                $(this).val('');
            }
        });
        event.preventDefault();
        $(this).closest('form').submit();
    });

    // Добавляем мультиселект
    $('.selectpicker').selectpicker();

    // Скрываем фейковый мультиселект
    $('.js-bootstrap-select-fake').hide();

    // Расширяем JQuery
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    
    // Кнопка очистки поля крайней даты
    $('.js-clear-date-edge').click(function(event) {
        event.preventDefault()
        $('input[name="date_edge"]').val('')
    })
});

function mergeValues(s1, s2) {
    var o1 = values(s1),
        o2 = values(s2);

    return $.param($.extend(o1, o2))
}

function values(s) {
    var result = {};
    $.each(s.split(/&/), function (i, t) {
        var split = t.split(/=/);
        result[split[0]] = decodeURIComponent(split[1]);
    })

    return result;
}

function scrollOrderForm () {
    var speed = 500;
    if ($(".js-order-form").length) {
        $('html, body').animate({
            scrollTop: $(".js-order-form").offset().top - 10,
        }, speed);
    }
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
}

function showModalAlert(titleText, alertText, buttonIndexShow) {
    var modalAlert = $('#actionAlert')
    var buttons = modalAlert.find('.js-action-alert-modal__buttons')
    var title = modalAlert.find('.js-modal-title')
    var message = modalAlert.find('.js-modal-message')
    title.text(titleText)
    message.text(alertText)
    modalAlert.modal('toggle')
    buttons.hide()
    $(buttonIndexShow).each(function(index, value) {
        modalAlert.find('.js-action-alert-modal__buttons_' + value).show()
    });
}