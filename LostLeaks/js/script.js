
//** Global variable container
var MYAPP = {};

(function ($) {
    "use strict";

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// GLOBAL VARIABLES  //////
    ///////////////////////////////


    //** Variables for instagram feeds
    MYAPP.instaFeed = { count: 0, prefix: 'instagramFeed_', clientId: 'd6586b353e88498d9ade1f458d5bca65' }; //*** PUT YOUR OWN INSTAGRAM CLIENT_ID !!!

    //** Variables for auto animation of carousels. 
    //** true for starting auto animation when page loads, otherwise false.
    MYAPP.carouselsAuto = {
        featuredWorkCarousel: false, //** Featured Work in main page
        latestWorkCarousel: true, //** Lates Work carousel in main page
        crewMembersCarousel: false, //** Crew Members in Studio version and only on small screens
        testimonialsCarousel: true, //** Testimonials carousels
        browserSlider: true, //** Browser carousel in portfolio details Freelancer version
        portfolioFeaturedWorkCarousel: true, //** Featured work carousel in portfolio detail
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// EXECUTE ON SCRIPT LOAD    //////

    //** START LOADER ANIMATION
    if (typeof NProgress !== 'undefined') {
        $('body').addClass('loading');
        NProgress.start();
        setTimeout(function () { if (!MYAPP.isPageLoaded) NProgress.inc(); }, 500);
        setTimeout(function () { if (!MYAPP.isPageLoaded) NProgress.inc(); }, 1000);
        setTimeout(function () { if (!MYAPP.isPageLoaded) NProgress.inc(); }, 1500);
    }


    ////// END EXECUTE ON SCRIPT LOAD //////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////  WINDOW LOAD   //////
    $(window).load(function () {

        ////////////////////////////////////////////
        //** END LOADER ANIMATION
        MYAPP.isPageLoaded = true;
        if (typeof NProgress !== 'undefined') {
            NProgress.done();
        }
        $('#loader').remove();
        $('body').removeClass('loading');
        if ($('#page').css('opacity') < 1)
            $('#page').animate({ opacity: 1 }, 500);
        //** END LOADER ANIMATION
        ////////////////////////////////////////////

    });
    ////// END WINDOW LOAD
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// DOCUMENT READY //////
    jQuery(document).ready(function () {

        ///////////////////////////
        //** ONLY ON MOBILE DEVICES
        if (MYAPP.isMobile) {
            //** Do not auto start any carousel on mobile devices (perfomance reasons)
            for (var autoSetting in MYAPP.carouselsAuto)
                MYAPP.carouselsAuto[autoSetting] = false;

            //** Remove animations on mobile devices (performance reasons)
            $('.animate').each(function () { $(this).removeClass('animate'); });
            $('.animateFast').each(function () { $(this).removeClass('animateFast'); });
        }
        else
        { //** NOT on mobile
            $('.latestWorkContainer').addClass('notMobile');
        }
        //** END ONLY ON MOBILE DEVICES
        ///////////////////////////////

        //** Initialize the Tooltips
        $('.tooltip_top').tooltip({ placement: 'top' });
        $('.tooltip_bottom').tooltip({ placement: 'bottom' });
        $('.tooltip_left').tooltip({ placement: 'left' });
        $('.tooltip_right').tooltip({ placement: 'right' });
        //** END initialization of tooltips

        //** Latest blog masonry positioning
        imagesLoaded($('.blog_masonry'), function (instance) {
            $('.blog_masonry').masonry({
                columnWidth: '.article_container',
                itemSelector: '.article_container'
            });
        });
        //** END Latest blog masonry


        ////////////////////////////////////////////
        //*** Start carousels ***

        ////////////////////////////////////////////
        //** Featured Work Carousel
        imagesLoaded($('.fwCarousel'), function (instance) {
            $('.fwCarousel').startTransparencyCarousel(3, { auto: MYAPP.carouselsAuto['featuredWorkCarousel'] });
        });
        //** END Featured Work Carousel
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        // LATEST WORK -  EXPAND TO PORTFOLIO     //

        //** Start Our latest work carousel
        imagesLoaded($('.latestWorkCarousel'), function (instance) {
            $('.latestWorkCarousel').startTransparencyCarousel(5, { auto: MYAPP.carouselsAuto['latestWorkCarousel'] });
        });

        $(document).on('tap', '.latestWorkCarousel li', function (e) {
            e.preventDefault();
            if ($('body').hasClass('modal_open')) { return false; }
            var currentPortfolioItem = new PortfolioItem($(this));
            currentPortfolioItem.Show();
        });

        if (window.location.hash && window.location.hash.indexOf('!') === 1) {
            //** If url contains a hashbang
            var portfolioId = window.location.hash.slice(1).replace('!', '');
            var currentPortfolioItemContent = $('.latestWorkCarousel [data-id="' + portfolioId + '"]');
            var currentPortfolioItem;
            if ($(currentPortfolioItemContent).length > 0) {
                currentPortfolioItem = new PortfolioItem(currentPortfolioItemContent);
                currentPortfolioItem.Show();
            }
        }


        

        // END LATEST WORK - EXPAND TO PORTFOLIO  //
        ////////////////////////////////////////////



        ////////////////////////////////////////////
        // CREW MEMBERS SLIDER (ON SMALL SCREENS) //
        $(window).on('resize', function () {

            if ($(window).width() < 768) {

                //** Clone only one time the avatars used for the slider
                if ($('.ournewslider').length < 1) {
                    var slider = $('.crewAvatarsFixed').clone().addClass('ournewslider');
                    $('.crewAvatarsFixed').prev('.crewAvatarsSlider').prepend(slider);
                }

                var slider = ('.ournewslider');

                //** Crew Avatars
                imagesLoaded($(slider), function (instance) {
                    $(slider).carouFredSel({
                        items: 1,
                        auto: MYAPP.carouselsAuto['crewMembersCarousel'],
                        responsive: true,
                        scroll: {
                            items: 1,
                            fx: 'scroll',
                            onBefore: function (data) {
                                $($(data.items.visible[0])).tab('show');
                            },
                            easing: "cubic"
                        },
                        pagination: {
                            container: '.sliderPagination',
                            anchorBuilder: function (nr, item) { return '<a href="#"></a>'; }
                        },
                        prev: { button: function () { return $(this).closest('.crewAvatarsSlider').find('.Prev'); }, key: "left" },
                        next: { button: function () { return $(this).closest('.crewAvatarsSlider').find('.Next'); }, key: "right" }
                    });
                });
            }
        });



        //** Testimonials slider
        imagesLoaded($('.testimonials'), function (instance) {
            var tcarousel = $('.testimonials');
            $('.testimonials').carouFredSel({
                items: 1,
                auto: MYAPP.carouselsAuto['testimonialsCarousel'],
                responsive: true,
                scroll: {
                    items: 1,
                },
                pagination: {
                    container: '.sliderPagination',
                    anchorBuilder: function (nr, item) { return '<a href="#"></a>'; }
                },
                onCreate: function () {
                    // INCREASE HEIGHT ON RESIZE
                    $(window).on('resize', function () {
                        tcarousel.parent().add(tcarousel).css('height', tcarousel.children().first().height() + 'px');
                    }).trigger('resize');
                }
            });
        });


        //*** END Start carousels ***
        ////////////////////////////////////////////


        //** Animate scroll for ALL local anchors
        $("a[href^='#']").click(function () {
            $($(this).attr('href')).animatescroll();
            return false;
        });
        //** END Animate scrolls for local anchors

        ////////////////////////////////////////////
        //** MAIN MENU LOGIC **

        $('.menu_trigger').on('click', function (e) {
            e.stopPropagation();
            $('body').addClass('menuOpened');
        });
        $('.menu').on('click', function (e) {
            if (e.target.id === 'menuClose')
                $('body').removeClass('menuOpened');
            else
                e.stopPropagation();
        });
        $(document).on('click', ".menuOpened #page", function () {
            $('body').removeClass('menuOpened');
        });
        $(document).on('click', ".menuOpened a", function (e) {
            e.preventDefault();
        });

        $('#mainMenu li a').click(function () {
            $("#mainMenu li a").removeClass('active');
            $(this).addClass('active');
            var el = $(this).attr('href');
            $(el).animatescroll();
            setTimeout(function () { $('body').removeClass('menuOpened'); }, 1200);
            return false;
        });

        var lastId,
            topMenu = $("#mainMenu"),
        // All list items
            menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
            scrollItems = menuItems.map(function () {
                var item = $($(this).attr("href"));
                if (item.length) {
                    return item;
                }
            });

        $(window).scroll(function () {
            var fromTop = $(this).scrollTop();
            // Set an extra padding if the horizontal fixed menu is visible
            var currentPadding = ($('#header').hasClass('menuStyle2') || $('#header').hasClass('menuStyle3')) ? $('#header .menu').height() : 0;
            // Get id of current scroll item
            var cur = scrollItems.map(function () {
                if ($(this).offset().top - currentPadding <= fromTop) {
                    return this;
                }
            });
            // Get the id of the current element
            cur = cur[cur.length - 1];
            var id = cur && cur.length ? cur[0].id : "";
            if (lastId !== id) {
                lastId = id;
                topMenu.find("a").removeClass("active");
                menuItems
                    .parent()
                    .end().filter("[href=#" + id + "]").addClass("active");
            }
        });

        //** Make the menu smaller if not at the top of the window
        $(window).scroll(function () {
            if ($(this).scrollTop() > MYAPP.menuScrollSmall) {
                $('#header').addClass('smaller');
            } else {
                $('#header').removeClass('smaller');
            }
        });

        //** END MAIN MENU **
        ////////////////////////////////////////////

        ////////////////////////////////////////////
        //** MAIN SLIDER (REVOLUTION) **  mainSliderContainer
        MYAPP.revapi = $('.mainSlider').revolution(
            {
                delay: 5000,
                startwidth: 1920,
                startheight: 895,
                fullWidth: "on",
                //forceFullWidth: "on",
                navigationType: "none",
                navigationArrows: "solo",
                soloArrowLeftHalign:"center", 
                soloArrowRightHalign: "center",
                soloArrowLeftValign: "bottom", 
                soloArrowRightValign: "bottom",
                navigationHAlign: "center", 
                navigationVAlign: "bottom",
                soloArrowLeftHOffset: "-40",
                soloArrowRightHOffset: "40",
                onHoverStop: "on",
                stopAtSlide: (MYAPP.isMobile ? 1 : -1),
                stopAfterLoops: (MYAPP.isMobile ? 0 : -1),
            });
        $('.mainSlider .Prev').on('click', function () { MYAPP.revapi.revprev(); });
        $('.mainSlider .Next').on('click', function () { MYAPP.revapi.revnext(); });
        //MYAPP.menuScrollSmall = MYAPP.revapi.height() || 0;
        //** END MAIN SLIDER 
        ////////////////////////////////////////////

        ////////////////////////////////////////////
        //** Magnific popup initializations
        $('.magPopupImg').magnificPopup({ type: 'image', zoom: { enabled: true } });
        $('.magPopupUl').magnificPopup({ delegate: 'li img', type: 'image', gallery: { enabled: true }, zoom: { enabled: true } });
       
        //** END Magnific popup
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        //** PARALLAX initializations
        $('*[data-parallax-speed]').each(function () { $(this).parallax("50%", $(this).data('parallax-speed')); });
        //** END PARALLAX
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        //** INSTAGRAM pictures
        $('.instagramList').each(function () {
            //** Set an unique ID for the item
            var currentID = MYAPP.instaFeed.prefix + ++MYAPP.instaFeed.count;
            $(this).attr('id', currentID);

            var currentFeed = new Instafeed({
                clientId: MYAPP.instaFeed.clientId,
                accessToken: $(this).data('accesstoken'),
                target: currentID,
                get: $(this).data('get'),
                tagName: $(this).data('tagname'),
                locationid: $(this).data('locationid'),
                userId: $(this).data('userid'),
                sortBy: $(this).data('sortby'),
                links: 'true',
                resolution: 'thumbnail',
                template: '<a href="{{link}}" target="_blank" class="scaleRotateImg ' + $(this).data('itemclass') + '"><img src="{{image}}" ' + (MYAPP.isMobile ? ' ' : ' class="animate"') + '/></a>',
                limit: $(this).data('limit')
            });
            //** Get the photos
            try { currentFeed.run(); } catch (ex) { }

        });
        //** END INSTAGRAM pictures
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        //** CONTACT FORM SUBMIT
        $('.contactForm').on('submit', function (e) {
            e.preventDefault(); //** Prevent the post submit
            $('#contactResponse .alert').alert('close');
            //collect input field values
            var user_name = $('input[name=name]').val();
            var user_email = $('input[name=email]').val();
            var user_message = $('textarea[name=message]').val();

            //simple validation at client's end
            //we simply change border color to red if empty field using .css()
            var proceed = true;
            if (user_name == "") {
                $('input[name=name]').css('border-color', 'red');
                proceed = false;
            }
            if (user_email == "") {
                $('input[name=email]').css('border-color', 'red');
                proceed = false;
            }
            if (user_message == "") {
                $('textarea[name=message]').css('border-color', 'red');
                proceed = false;
            }

            //everything looks good! proceed...
            if (proceed) {
                $('.contactForm .contactBusy').css({'display':'block'});
                //data to be sent to server
                var post_data = { 'name': user_name, 'email': user_email, 'message': user_message };

                //Ajax post data to server
                $.post('contact.php', post_data, function (data) {
                    $('.contactForm .contactBusy').css({ 'display': 'none' });
                    $('#contactResponse').html(data);
                    $('#contactResponse').alert();
                    //reset values in all input fields
                    $('#contactForm input').val('');
                    $('#contactForm textarea').val('');

                }).fail(function (err) {  //load any error data
                    $('.contactForm .contactBusy').css({ 'display': 'none' });
                    $('#contactResponse').html('<div class="alert alert-danger alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error! </strong>' + err.statusText + '</div>');
                    $('#contactResponse').alert();
                });
            }
        });

        //** END CONTACT SUBMIT
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        //** APPEAR WHEN SCROLLED INTO VIEW (NOT FOR MOBILE)

        //** Make all .sectionInfo appear from bottom (change default data-appear-direction="none")
        $('.sectionInfo').attr('data-appear', 'fade-in').attr('data-appear-direction', 'bottom');

        if (!MYAPP.isMobile) {
            $('*[data-appear="fade-in"]').each(function () {
                //** Set values or defaults
                var appearDelay = $(this).data('appear-delay') || 0;
                var appearDirection = $(this).data('appear-direction') || 'none';//** Default to none

                //** Prepare for transition (hide and offset)
                $(this).css({ opacity: '0', 'visibility': 'hidden' });
                switch (appearDirection) {
                    case 'top': $(this).css({ position: 'relative', top: -$(this).height() / 2 + 'px' }); break;
                    case 'right': $(this).css({ position: 'relative', right: -$(this).width() / 2 + 'px' }); break;
                    case 'bottom': $(this).css({ position: 'relative', bottom: -$(this).height() / 2 + 'px' }); break;
                    case 'left': $(this).css({ position: 'relative', left: -$(this).width() / 2 + 'px' }); break;
                }


                //** Show when comes into view from scrolling down
                $(this).waypoint(function (direction) {
                    $(this).css({ 'visibility': 'visible' });

                    if (direction == 'down') {
                        switch (appearDirection) {
                            case 'top': $(this).delay(appearDelay).animate({ 'opacity': 1, 'top': 0 }, 800); break;
                            case 'right': $(this).delay(appearDelay).animate({ 'opacity': 1, 'right': 0 }, 800); break;
                            case 'bottom': $(this).delay(appearDelay).animate({ 'opacity': 1, 'bottom': 0 }, 800); break;
                            case 'left': $(this).delay(appearDelay).animate({ 'opacity': 1, 'left': 0 }, 800); break;
                            default: $(this).delay(appearDelay).animate({ 'opacity': 1 }, 800); //** none (just appear without slide in)
                        }
                        $(this).waypoint('destroy');
                    }
                }, {
                    offset: function () {
                        switch (appearDirection) {
                            case 'top': return $.waypoints('viewportHeight') - $(this).height(); break;
                            case 'bottom': return $.waypoints('viewportHeight'); break;
                            default: return $.waypoints('viewportHeight') - Math.min($(this).height() / 2, 150); break; //** Left or right
                        }
                    }
                });
            });
        };
        //** END APPEAR WHEN SCROLLED INTO VIEW
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        //** YOUTUBE PLAYER

        $('.youtubeVideo').each(function () {
            var myPlayer = $(this).mb_YTPlayer();
            $(this).find($('.playVideo')).removeClass('arrow_triangle-right').addClass('icon_pause');
            $(this).find($('.playVideo')).on('click', function () {
                if (myPlayer.getPlayer().getPlayerState() == 1) {
                    myPlayer.pauseYTP();
                    $(this).removeClass('icon_pause').addClass('arrow_triangle-right');
                }
                else {
                    myPlayer.playYTP();
                    $(this).removeClass('arrow_triangle-right').addClass('icon_pause');
                }
            });
            if (MYAPP.isIE)
                $(this).find($('.youtubeVideo .fullScreenVideo')).css({ cursor: 'not-allowed' });
            else
                $(this).find($('.fullScreenVideo')).on('click', function () { $(myPlayer).fullscreen(); });
            $(this).find($('.muteVideo')).on('click', function () {
                //$(myPlayer).toggleVolume();
                if ($(this).hasClass('icon_volume-high_alt')) {
                    $(myPlayer).unmuteYTPVolume();
                    $(this).removeClass('icon_volume-high_alt').addClass('icon_vol-mute_alt');
                }
                else {
                    $(myPlayer).muteYTPVolume();
                    $(this).removeClass('icon_vol-mute_alt').addClass('icon_volume-high_alt');
                }
            });
            $(this).find($('.volDownVideo')).on('click', function () { $(myPlayer).muteYTPVolume(); });
            $(this).find($('.volUpVideo')).on('click', function () { $(myPlayer).unmuteYTPVolume(); });
        });
            
        //** END YOUTUBE PLAYER
        ////////////////////////////////////////////

        ////////////////////////////////////////////
        //** LOCAL VIDEO PLAYER

        $('.video.localVideo').each(function () {
            var that = $(this);
            var myPlayer = $(this).find('video').get(0);
            //** Play/Pause button
            $(this).find($('.playVideo')).on('click', function () {
                if (myPlayer.paused) myPlayer.play();
                else myPlayer.pause();
            });
            //** Attach to play event
            $(myPlayer).on('play', function () { $(that).find($('.playVideo')).removeClass('arrow_triangle-right').addClass('icon_pause'); });
            //** Attach to pause event
            $(myPlayer).on('pause', function () { $(that).find($('.playVideo')).removeClass('icon_pause').addClass('arrow_triangle-right'); });
            //** FullScreen button
            $(this).find($('.fullScreenVideo')).on('click', function () {
                if (myPlayer.requestFullscreen) {
                    myPlayer.requestFullscreen();
                } else if (myPlayer.mozRequestFullScreen) {
                    myPlayer.mozRequestFullScreen(); // Firefox
                } else if (myPlayer.webkitRequestFullscreen) {
                    myPlayer.webkitRequestFullscreen(); // Chrome and Safari
                }
            });
            //** Mute/Unmute button    
            $(this).find($('.muteVideo')).on('click', function () {
                if (myPlayer.muted) myPlayer.muted = false;
                else myPlayer.muted = true;
            });
            //** Attach to volumechange event
            $(myPlayer).on('volumechange', function ()
            {
                if (myPlayer.muted) { $(that).find($('.muteVideo')).removeClass('icon_vol-mute_alt').addClass('icon_volume-high_alt'); }
                else { $(that).find($('.muteVideo')).removeClass('icon_volume-high_alt').addClass('icon_vol-mute_alt'); }
            });
        });

        //** END LOCAL VIDEO PLAYER
        ////////////////////////////////////////////

    });

    ////// END DOCUMENT READY //////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// GLOBAL FUNCTIONS //////

    ///////////////////////////////
    //** GLOBAL HELPERS
    MYAPP.isPageLoaded = false;
    (function (a) { (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);
    MYAPP.isMobile = jQuery.browser.mobile;
    MYAPP.menuScrollSmall = 0; //** Is recalculated after main slider initialization; Used for making horizontal menu shorter
    //MYAPP.isMobile = (window.orientation !== undefined);

    
    MYAPP.isIE = (function () {
        var undef, rv = -1; // Return value assumes failure.
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var trident = ua.indexOf('Trident/');

        if (msie > 0) {
            // IE 10 or older => return version number
            rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        } else if (trident > 0) {
            // IE 11 (or newer) => return version number
            var rvNum = ua.indexOf('rv:');
            rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
        }

        return ((rv > -1) ? rv : undef);
    }());
    //** GLOBAL HELPERS
    ///////////////////////////////


    ///////////////////////////////
    //** SCROLL ANIMATION

    // defines easing effects
    $.easing['jswing'] = $.easing['swing'];
    $.extend($.easing, {
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    });


    $.fn.animatescroll = function (options) {

        // fetches options
        var opts = $.extend({}, $.fn.animatescroll.defaults, options);
        if (opts.element === "html,body") {
            // Get the distance of particular id or class from top
            var offset = this.offset().top;
            // Calculate padding according to presence of menu
            var currentPadding = ($('#header').hasClass('menuStyle2') || $('#header').hasClass('menuStyle3')) ? 60 : 0;
            // Scroll the page to the desired position
            $(opts.element).stop().animate({ scrollTop: offset - (opts.padding + currentPadding)}, opts.scrollSpeed, opts.easing);
        }
        else {
            // Scroll the element to the desired position
            $(opts.element).stop().animate({ scrollTop: this.offset().top - this.parent().offset().top + this.parent().scrollTop() - opts.padding }, opts.scrollSpeed, opts.easing);
        }
    };

    // default options
    $.fn.animatescroll.defaults = {
        easing: "swing", //"easeInOutBack",
        scrollSpeed: 1200,
        padding: 0,
        element: "html,body"
    };

    //** END SCROLL ANIMATIONS
    ///////////////////////////////


    /////////////////////////////////////////////////
    //** START CAROUSELS WITH TRANSPARENCY SIDEWAYS

    $.fn.startTransparencyCarousel = function (maxItems, options) {
        // fetches options
        var opts = $.extend({}, $.fn.startTransparencyCarousel.defaults, options);
        var carousel = $(this);

        //** Sets the visible items function according to maximum no of items
        opts.items.visible = function (visibleItems) {
            if (visibleItems <= 1 || visibleItems >= maxItems)
                return maxItems;
            return visibleItems + 1;
        };

        //** Set the initial transparency for the items on the sides
        opts.onCreate = function (data) {
            // HIGHGLIGHT THE CENTER ITEMS
            if (data.items.slice(1, -1).length === 0) {
                data.items.stop().css({ 'opacity': 1 });
            }
            else {
                data.items.stop().css({ 'opacity': 0.2 });
                data.items.slice(1, -1).stop().css({ 'opacity': 1 });
            }
            // INCREASE HEIGHT ON RESIZE
            $(window).on('resize', function () {
                carousel.parent().add(carousel).height(carousel.children().first().height());
            }).trigger('resize');
        };

        //** Start the carousel
        carousel.carouFredSel(opts);
    };

    //** Default options for transparency carousels
    $.fn.startTransparencyCarousel.defaults = {
            direction: "left",
            responsive: false,
            width: "100%",
            height: 'auto',
            auto: false,
            items: {
                visible: function (visibleItems) {
                    if (visibleItems <= 1 || visibleItems >= 3) { return 3; }
                    return visibleItems + 1;
                },
                width: '370'
            },
            swipe: {
                onTouch: true,
                onMouse: true
            },
            scroll: {
                items: 1,
                onBefore: function (data) {
                    data.items.visible.stop().animate({ 'opacity': 0.2 });
                    data.items.visible.slice(1, -1).stop().animate({ 'opacity': 1 });
                },
                easing: "cubic",
                pauseOnHover: true
            },
            onCreate: function (data) {
                // HIGHGLIGHT THE CENTER ITEMS
                data.items.stop().css({ 'opacity': 0.2 });
                data.items.slice(1, -1).stop().css({ 'opacity': 1 });

                // INCREASE HEIGHT ON RESIZE
                $(window).on('resize', function () {
                    carousel.parent().add(carousel).height(carousel.children().first().height());
                }).trigger('resize');
            },
            prev: { button: function () { return $(this).closest('.carouselContainer').find('.Prev'); }, key: "left" },
            next: { button: function () { return $(this).closest('.carouselContainer').find('.Next'); }, key: "right" }
        };

    //** END START CAROUSELS WITH TRANSPARENCY
    /////////////////////////////////////////////////


    /////////////////////////////////////////////////
    //** PORTFOLIO DETAIL DISPLAY

    var PortfolioItem = function (listItem) {
        //** If a detail is already active, ignore clicks
        if ($('body').hasClass('modal_open')) { return false; }

        $('body').addClass('modal_open'); //** Mark folio detail as active
        if (MYAPP.carouselsAuto['latestWorkCarousel'])
            $('.latestWorkCarousel').trigger('stop', true); //** stop the carousel auto scroll

        //** Compute positions and remember some of the caller's properties
        this.scroll_top = $(window).scrollTop();
        this.pos_top = listItem.offset().top - $(window).scrollTop();
        this.pos_left = listItem.offset().left - $(window).scrollLeft();
        this.pos = listItem.position();
        this.height = listItem.height();
        this.width = listItem.width();
        this.center_left = ($(window).width() - this.width) / 2;
        this.center_top = ($(window).height() - this.height) / 2;
        this.listItem = listItem;
        this.callerOpacity = listItem.css('opacity');

        //** Make the caller invisible
        listItem.removeClass('animate');
        listItem.css('opacity', '0');


        //** Add the container for the portfolio detail and put a copy of the caller content in it
        $('body').append("<div class='untitledModal' style='position:fixed; opacity:1; top:" + this.pos_top + "px; left:" + this.pos_left +
            "px;width:" + this.width + "px; height:" + this.height + "px;'></div>");
        $('.untitledModal').append(this.listItem.html());
        //this.callerBackground = $('.untitledModal').css('background-color');
        $('.untitledModal').append("<span class='typing_loader'></span>");
        $('html').addClass('overflowHidden');//.css('overflow', 'hidden');
    };

    //** Called to show the portfolio item
    PortfolioItem.prototype.Show = function (completeCallback) {
        if (this.listItem.data("id"))
            window.location.hash = "!" + this.listItem.data("id");
        else
            window.location.hash = "";

        var _portfolioItem = this;
        //** Add an opening class for modal and get the background color used for animation on close
        this.callerBackground = $(".untitledModal").addClass("opening").css('background-color');

        //** Move to center and wait for the portfolio to load
        $(".untitledModal").animate({
            left: this.center_left,
            top: this.center_top
        }, 500, function () {
            $.ajax({
                url: _portfolioItem.listItem.data('target'),
                context: document.body,
                cache: false,
                success: function (data) {
                    $('.untitledModal').empty();

                    var d = $(data).css('opacity', 0);

                    $(".untitledModal").animate({
                        left: 0,
                        top: 0,
                        width: $(window).width(),
                        height: $(window).height(),
                        backgroundColor: 'white'

                    }, 500, function () {
                        //** After the box grew to the entire window
                        $(".untitledModal").removeClass("opening");
                        $(".untitledModal").append(d);
                        $(".untitledModal .portfolioDetail").animate({ opacity: 1 });
                        $(".untitledModal").css({ 'width': '100%', 'height': '100%' });
                        //** Add event handlers
                        $('.closePortfolio').on('click', function () { _portfolioItem.Close(); });
                        //$('.prevPortfolio').on('click', function () { _portfolioItem.Change('previous'); });
                        //$('.nextPortfolio').on('click', function () { _portfolioItem.Change('next'); });
                        $('.prevPortfolio').on('click', function () {
                            _portfolioItem.Close(function () {
                                if (_portfolioItem.listItem.prev()[0] !== undefined) {
                                    var newPortfolioItem = new PortfolioItem(_portfolioItem.listItem.prev());
                                    newPortfolioItem.Show();
                                }
                            });
                        });
                        $('.nextPortfolio').on('click', function () {
                            _portfolioItem.Close(function () {
                                if (_portfolioItem.listItem.next()[0] !== undefined) {
                                    var newPortfolioItem = new PortfolioItem(_portfolioItem.listItem.next());
                                    newPortfolioItem.Show();
                                }
                            });
                        });

                        if (completeCallback !== undefined) completeCallback();
                    });
                }
            });
        });

    };

    //** Function to execute on close portfolio
    PortfolioItem.prototype.Close = function (completeCallback) {
        window.location.hash = "";

        var _portfolioItem = this;
        $(".untitledModal").addClass("opening");

        $(".untitledModal .portfolioDetail").animate({ 'opacity': 0 }, 300, function () {
            //** Scroll the main page back to previous position (now is on top because overflow)
            $('html').removeClass('overflowHidden');//.css('overflow', 'auto');
            window.scroll(0, _portfolioItem.scroll_top);
            //** Delete current detail and shrink to center
            $(".untitledModal").empty();
            $(".untitledModal").append("<span class='typing_loader'></span>");
            $(".untitledModal").animate({ left: _portfolioItem.center_left, top: _portfolioItem.center_top, width: _portfolioItem.width, height: _portfolioItem.height, backgroundColor: _portfolioItem.callerBackground }, 500,
                function () {
                    //** After moved to center, put the caller content into the box and move it to its final position
                    $(".untitledModal").append(_portfolioItem.listItem.html());
                    $(".untitledModal").animate({ left: _portfolioItem.pos_left, top: _portfolioItem.pos_top }, 500,
                function () {
                    //** Fade out and delete the detail container, and show back the caller
                    $(".untitledModal").animate({ opacity: 0 }, 200,
                        function () {
                            $(".untitledModal").remove();
                            $('body').removeClass('modal_open');
                            if (MYAPP.carouselsAuto['latestWorkCarousel'])
                                $('.latestWorkCarousel').trigger('play', true);
                            _portfolioItem.listItem.addClass('animate').css('opacity', _portfolioItem.callerOpacity);
                            if (completeCallback !== undefined) completeCallback();
                            //_portfolioItem = null;
                        });
                });
                });
        });
    };

    //** Function to execute on prev/next portfolio
    //** direction is <previous> or <next>
    PortfolioItem.prototype.Change = function (direction) {
        event.preventDefault();
        var currentListItem = this.listItem;

        this.Close(function () {
            var newPortfolioItem;
            if (direction === 'previous') {
                if (currentListItem.prev()[0] !== undefined)
                    newPortfolioItem = new PortfolioItem(currentListItem.prev());
            }
            else if (currentListItem.next()[0] !== undefined)
                newPortfolioItem = new PortfolioItem(currentListItem.next());

            if (newPortfolioItem !== undefined) newPortfolioItem.Show();
        });
    };


    //** END PORTFOLIO DETAIL DISPLAY
    /////////////////////////////////////////////////

    

})(jQuery);

//** TAP
!function (a, b) { "use strict"; var c, d, e = "._tap", f = "._tapActive", g = "tap", h = 40, i = 400, j = "clientX clientY screenX screenY pageX pageY".split(" "), k = { count: 0, event: 0 }, l = function (a, c) { var d = c.originalEvent, e = b.Event(d); e.type = a; for (var f = 0, g = j.length; g > f; f++) e[j[f]] = c[j[f]]; return e }, m = function (a) { if (a.isTrigger) return !1; var b = k.event, c = Math.abs(a.pageX - b.pageX), d = Math.abs(a.pageY - b.pageY), e = Math.max(c, d); return a.timeStamp - b.timeStamp < i && h > e && (!b.touches || 1 === k.count) && o.isTracking }, n = function (a) { if (0 === a.type.indexOf("touch")) { a.touches = a.originalEvent.changedTouches; for (var b = a.touches[0], c = 0, d = j.length; d > c; c++) a[j[c]] = b[j[c]] } a.timeStamp || (a.timeStamp = (new Date).getTime()) }, o = { isEnabled: !1, isTracking: !1, enable: function () { o.isEnabled || (o.isEnabled = !0, c = b(a.body).on("touchstart" + e, o.onStart).on("mousedown" + e, o.onStart).on("click" + e, o.onClick)) }, disable: function () { o.isEnabled && (o.isEnabled = !1, c.off(e)) }, onStart: function (a) { a.isTrigger || (n(a), a.touches && (k.count = a.touches.length), o.isTracking || (o.isTracking = !0, k.event = a, a.touches ? c.on("touchend" + e + f, o.onEnd).on("touchcancel" + e + f, o.onCancel) : c.on("mouseup" + e + f, o.onEnd))) }, onEnd: function (a) { var c; a.isTrigger || (n(a), m(a) && (c = l(g, a), d = c, b(k.event.target).trigger(c), a.preventDefault()), o.onCancel(a), c && !c.isDefaultPrevented() && a.touches && k.event.target.click()) }, onCancel: function (a) { a && "touchcancel" === a.type && a.preventDefault(), o.isTracking = !1, c.off(f) }, onClick: function (a) { return !a.isTrigger && d && d.isDefaultPrevented() && d.target === a.target && d.pageX === a.pageX && d.pageY === a.pageY && a.timeStamp - d.timeStamp < i ? (d = null, !1) : void 0 } }; b(a).ready(o.enable) }(document, jQuery);