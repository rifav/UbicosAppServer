
$(function(){

        //side navigation bar click events -- start

        //open the right-side-menu
        //$('#right-side-menu').click(function(e){
        $('#study-menu').click(function(e){
            $("#mySidenav").css("width", "350px");
        });

        //handle the tab menu button actions
        $('#tab-week1, #tab-week2, #tab-week3').click(function (e){

            handle_tab_menu_buttons($(this), $(this).attr('data-id'));

        });

        //highlight the tab menu buttons based on page id -- start
        //adding this only here will work on reload but not with back/forward clicking
        //make it a function and call it everytime as well
        if(global_current_pagenumber >= 2 && global_current_pagenumber <= 11) {
            console.log("current page number :: ", global_current_pagenumber);
            $('#page-controls a').removeClass('menu-button-selected');
            $("#tab-week1").addClass('menu-button-selected');
        }else if(global_current_pagenumber >= 12 && global_current_pagenumber <= 24)
        {
            console.log("current page number :: ", global_current_pagenumber);
            $('#page-controls a').removeClass('menu-button-selected');
            $("#tab-week2").addClass('menu-button-selected');
        }else if(global_current_pagenumber >= 25 && global_current_pagenumber <= 36){
            console.log("current page number :: ", global_current_pagenumber);
            $('#page-controls a').removeClass('menu-button-selected');
            $("#tab-week3").addClass('menu-button-selected');
        }

        //highlight the tab menu buttons based on page id -- end


        //close the right-side-menu
        $('.right-menu-closebtn').click(function(e){
             $("#mySidenav").css("width", "0px");
        });

        //event handler for all four higher level tabs e.g., general, week1, week2, week3
        $('.showLinkgeneral, .showLinkweek1, .showLinkweek2, .showLinkweek3 ').click(function (e) {
                //toggle the up/down image, except the current selected "a" tab, set uparrow/downarrow for the rest of the tabs -- start
                $(this).find('img').toggle();

                var navBars = ['showLinkgeneral', 'showLinkweek1', 'showLinkweek2', 'showLinkweek3']
                var selected = $(this).attr('class');

                navBars.splice( $.inArray(selected,navBars), 1);
                $.each(navBars, function(id, element){
                    $("a."+element+" img.uparrow").css("display","none");
                    $("a."+element+" img.downarrow").css("display","");
                })

                //toggle the up/down image -- end

                //expand the selected tab
                var className = $(this).attr('class').replace('showLink','').trim();
                //alert(className);
                //toggle the currently selected <ul> tag element
                $(this).next('.'+className).toggle();
                //remove active class for other <a> links
                $(this).toggleClass('active').siblings().removeClass('active');
                //remove active class for module <a> links
                $("#mySidenav a.nav").removeClass('active');

                //console.log($('#mySidenav ul').not('.'+className));
                //untoggle the other <ul> tag element
                $('#mySidenav ul').not('.'+className).each(function(id,element){
                    //if they are open, then untoggle them..else no need
                    if($(element).is(':visible')) {
                        $(element).toggle();
                    }
                });

            }
        );

        //event handler for each modules within each higher levels
        $('#mySidenav a.nav').off().on('touch click', function(){

            //highlight one module one at a time within respective <ul> tag
            $("#mySidenav a.nav").removeClass('active'); //remove all the active class so far
            console.log('activityindex.js line 62', $(this));
            $(this).toggleClass('active'); //then add active class in the current selected <a> tag

            //get the page id, load that page, save the page id as the last accessed page
            var pageID = $(this).attr("data-pageId");
            reloadPage(pageID); //the following function is defined in digTextBook.js
            localStorage.setItem("pageToBeRefreshed", pageID);//next reload will load this page

            //close the side navigation bar once a module is selected
            $("#mySidenav").css("width", "0px");

        });

        //side navigation bar click events -- end

})

var handle_tab_menu_buttons = function(container, pageID){

    $("#mySidenav").css("width", "0px"); //if the right side menu is open, close it
    //highlight the current selected tab menu button and non-highlight others
    $('#page-controls a').removeClass('menu-button-selected');
    $(container).addClass('menu-button-selected');
    //load the respective page
    reloadPage(pageID); //the following function is defined in digTextBook.js
    localStorage.setItem("pageToBeRefreshed", pageID);//next reload will load this page

}

