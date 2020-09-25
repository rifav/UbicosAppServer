
$(function(){

        //side navigation bar click events -- start
        $('#right-side-menu').click(function(e){
            $("#mySidenav").css("width", "250px");
        });

        $('.right-menu-closebtn').click(function(e){
             $("#mySidenav").css("width", "0px");
        });

        $('.showGeneralLink').click(function (e) {
                $(this).next('.general').toggle();
                $(this).toggleClass('active').siblings().removeClass('active');
                $("#mySidenav a.nav").removeClass('active');

            }
        );
        $('.showWeek1Link').click(function (e) {
                $(this).next('.week1').toggle();
                $(this).toggleClass('active').siblings().removeClass('active');
                 $("#mySidenav a.nav").removeClass('active');

            }
        );
        $('.showWeek2Link').click(function (e) {
                $(this).next('.week2').toggle();
                $(this).toggleClass('active').siblings().removeClass('active');
                $("#mySidenav a.nav").removeClass('active');

            }
        );
        $('.showWeek3Link').click(function (e) {
                $(this).next('.week3').toggle();
                $(this).toggleClass('active').siblings().removeClass('active');
                 $("#mySidenav a.nav").removeClass('active');
            }
        );

        //side navigation bar click events -- end

        //binding side navigation bar button actions
        $('#mySidenav a.nav').off().on('touch click', function(){

            //highlight one module one at a time within <ul> tag
            //$(this).toggleClass('active').siblings().removeClass('active');
            //remove all the active class so far
            $("#mySidenav a.nav").not($(this)).removeClass('active');
            $(this).toggleClass('active');

            var pageID = $(this).attr("data-pageId");
            //second parameter doesn't matter in this version
            loadPage(pageID, $('.page:not(.previous):not(.next)'));

        });

})

