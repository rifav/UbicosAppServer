var global_current_pagenumber = 1 //initial page number; gets updated with page change //used for logging
var type = '' //card type
var activity_id //activity id for the selected tool
var host_url = window.location.host

window.onerror = function(message, file, line) {
  console.log('An error occured at line ' + line + ' of ' + file + ': ' + message);
  enterLogIntoDatabase('error', 'error' , 'An error occured at line ' + line + ' of ' + file + ': ' + message, 9999)
  //alert('an error')
  return false;
};

/*
    This variable is key in the functioning of the page navigation functionality.
    It is also used in: activityindex.js
*/

var NUM_PAGES = 36;

//load all init function required for the digital textbook to load here
$(function(){



    // Load first pages
    // TODO the URL should indicate which page to be loaded instead of always loading pages 1 and 2
    loadPage(1, $('.page:not(.previous):not(.next)'));
    loadPage(2, $('.page.next'));

    //If we start loading the cards dynamically, this needs to be called after the brainstorm card is built
    setupBrainstorm();

    //check for the last accessed page in the local storage
    if(localStorage.getItem("pageToBeRefreshed")){
        var pageToBeRefreshed = localStorage.getItem("pageToBeRefreshed");
        console.log("last accessed page (digTextBook.js)::", pageToBeRefreshed);
        reloadPage(pageToBeRefreshed);
    }

//        //console.log("here");
//        //personality edit -- TODO move it later -- capture the changes, and reflect on the p-tag
//        $('.page').off().on('click','#editPersonalityBtn', function(event){
//             //console.log("button clicked");
////             $("#matchedPersonality").css("display", "none");
////             $("#editPersonality").css("display", "");
//               $("#matchedPersonality").toggle();
//               $("#editPersonality").toggle();
//        });

});

//this method loads a specific page, adjusts previous/next page accordingly
//this method is called two times:
//1) in digtextbook.js - load the last accessed page
//2) in activityindex.js - when a page is selected from the side navigation bar
var reloadPage = function(pageToLoad){
    global_current_pagenumber = pageToLoad;
    var gotoPage = pageToLoad;
    var container = $('#textbook-content');

    // Update the current page
    loadPage(
        gotoPage,
        $('.page:not(.previous):not(.next)'),
        function(){
            // Update container class if this is the last or the first page
            var containerClass = ''
            if(gotoPage == 1) containerClass = 'first';
            else if(gotoPage == NUM_PAGES) containerClass = 'last'; // NUM_PAGES is defined in digTtextBook.js
            container.attr('class',containerClass);
            // update page number
            $("#page-control-number").text('Page ' + gotoPage + '/' + NUM_PAGES);
        });
     //Update previous and next
    loadPage(parseInt(gotoPage)+1, $('.page.next'));
    loadPage(gotoPage-1, $('.page.previous'));

    //TODO: update the side navigation bar current status
    //idenfity the a tag with the page id
    //console.log($($('#mySidenav a[data-pageId="'+gotoPage+'"]')[0]));
    //then add active class in the current selected <a> tag -- not working
    //$($('#mySidenav a[data-pageId="'+gotoPage+'"]')[0]).toggleClass('active');

}


//this method is used for page navigation i.e., previous/next buttons
var movePage = function(moveToNext){

    var container = $('#textbook-content'),
        pageToHide = $('.page:not(.previous):not(.next)', container), // This the current page, which will be hidden
        pageToShow, // This is the page that will be shown next
        pageToReplace, // this is the page whose content will need to be updated
        currentNewClass, // this is the new class that will be applied to the current page
        currentPageNum, // Page number of the page that will be shown
        replacePageNum, // Number of the new page to be dynamically loaded
        noMoreClass; // Class that will be added to container if
    if(moveToNext === true){
        pageToShow = $('.page.next', container);
        pageToReplace = $('.page.previous', container);
        currentNewClass = 'previous';
        replaceNewClass = 'next';
        currentPageNum = parseInt(pageToShow.data('page'));
        replacePageNum = currentPageNum + 1;
        noMoreClass = 'last';
    } else {
        pageToShow = $('.page.previous', container);
        pageToReplace = $('.page.next', container);
        currentNewClass = 'next';
        replaceNewClass = 'previous';
        currentPageNum = parseInt(pageToShow.data('page'));
        replacePageNum = currentPageNum - 1;
        noMoreClass = 'first';
    }


    global_current_pagenumber = currentPageNum; //
    localStorage.setItem("pageToBeRefreshed", currentPageNum);
    $("#page-control-number").text('Page ' + currentPageNum + '/' + NUM_PAGES);


    //close any card with page navigation
    if(type!=''){
        $('.card.' + type).removeClass('active');
    }

    // Do swaps
    pageToHide.attr('class','page').addClass(currentNewClass); // Turn the current page into either next or previous
    pageToShow.attr('class','page');
    pageToReplace.attr('class','page').addClass(replaceNewClass);

    // Replace page to replace content
    loadPage(
        replacePageNum,
        pageToReplace,
        function(){
            container.attr('class','');
        },
        function(){
            container.attr('class', noMoreClass);
        });

    //scrolling to the top:
    $('html, body').animate({scrollTop: '0px'}, 0);
};

var loadPage = function(pageNum, pageContainer, successFn, notFoundFn){
    //console.log('next page (loadPage Function)', pageNum)

    loadHTML(
        API_URL.pagesBase + '/' + pageNum + '.html',
        function(data){

            var pageHTML = $(data) //convert data into jquery object
            //console.log(pageHTML)

            if($('img', pageHTML)){
                var imgsrc = $('img', pageHTML).attr('src') //get the image src from the html i.e. '/act2/1.png'
                $('img', pageHTML).attr('src', API_URL.picsBase + imgsrc); //append the base url in the front
            }

            pageContainer.html(pageHTML);
            pageContainer.data('page', pageNum);

            if(successFn){
                successFn();
            }

            bindActivityButtons();
        },
        function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                console.dir('Page not found');
                if (notFoundFn){
                    notFoundFn();
                }
            }
        }
    );
}

var loadHTML = function(url, successFn, errorFn){
    $.ajax({
        method: 'GET',
        url: url,
        success:successFn,
        error:errorFn
    });
};


//button actions for the left hand side curriculum pages and right hand side card buttons
var bindActivityButtons = function(){

    //left hand side curriculum button actions -- start
    $('.page a').off().on('touch click', function(){
        // Get button type to open appropriate view
        //console.log('this', this)
        //console.log('$(this)', $(this))

        var activityButton = $(this);

        //type of activity - gallery/brainstorm/video etc
        type = activityButton.attr('class').replace('activity-button','').trim();
        console.log('type::', type)

        //for brainstorm different instances - start
        if(type.indexOf("msf")>=0){
            type = type.split(" ")[0];
            console.log(type);
        }
        if(type.indexOf("bs")>=0){
            type = type.split(" ")[0];
            console.log(type);
        }
        //for brainstorm different instances - start


        //id of each each activity
        var id = activityButton.attr('data-id');
        activity_id = id;
        console.log('activity id::', id)

        //individual_act_id = id; //passing it to individual_gallery.js

        // Disable current card and enable new card
        $('.card.active').removeClass('active');
        $('.card.' + type).addClass('active');

        // based on the activity type, update titles in html
        $('.card.' + type + ' h1').text(activityButton.attr('data-heading'));

//        ------------------------------based on different tools-----------------------
        // TODO: make the following if dynamic

//        --------------------------VIDEO/WHITEBOARD-----------------------
        // if video tab is active get the video url and display in video.html
        //display the video url in a new tab instead of the card
        if(type == 'video' || type == 'whiteboard'){
            //lastOpenedTool = 'video';
            $('.card.active').removeClass('active');
            var video_url = activityButton.attr('data-video-url');
            window.open(video_url, '_blank'); //open any external video in a new window
        }
//        ------------------------------TABLE-----------------------
        //if the table tab is active
        if($('.card.table').hasClass('active')){
             //lastOpenedTool = 'table';

             $('input[name="table-id"]').attr('value', id)
             //$('.card.' + type + ' h1').text(activityButton.attr('data-heading'));

             //persistence checker and populate or clear the table according to that
             if(localStorage.getItem('table'+$('input[name="table-id"]').val())){
                 var points = localStorage.getItem('table'+$('input[name="table-id"]').val());

                 //if table 3 has 3 pairs, and table 2 has 2 pairs, coming back to table 2 from table 3 shows the third coloumn from table3
                 //so clear everything and populate with the values
                 clearTableStatus();
                 //table already populated before, so display them in the table
                 persistTableStatus(points)

              }else{

                //used to clear the table for different instance of the table
                clearTableStatus();
              }

              //if the card is already extended, put it back to normal
              card_extension_close();
        }
//        ---------------------Chat card-----------------------
        if($('.card.chatCard').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();

             loadFeed(id); //load the chat feed based on the activity id

             console.log('card opened');
        }
//        ---------------------badge card-----------------------
        if($('.card.badgeCard').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();

             console.log('card opened');
        }
//        --------------------Khan academy card-----------------------
        if($('.card.khanacademy').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();
             var video_url = activityButton.attr('data-video-url');
             load_ka_card(id, video_url); //defined in kaform.js
             console.log('card opened');
        }
//        ---------------------image upload card-----------------------
        if($('.card.upload').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();

             $('#upload-img input[name="act-id"]').attr('value', id);
             $("input[name='group-id']").attr('value', 1); //TODO automate in the backend

             //https://stackoverflow.com/questions/52430558/dynamic-html-image-loading-using-javascript-and-django-templates
             $('img#default').attr('src', API_URL.picsBase + "/default.png");
             // end of the solution

             //clear the success message (once displayed it stays on, so clear it for the next access to the card)
             $('.upload-success-msg').hide();
             //put the default image in its original frame after an image is uploaded
             $("#gallery-upload-div img").width('450px').height('300px');
        }
//        ---------------------display (only) individual discussion -----------------------
         if($('.card.self-gallery').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();

             //when a user opens this card, load the image this user uploaded and
             //display all the comments made by other students
             loadSelfImageFeed(id);


        }
//        ---------------------individual discussion-----------------------

         if($('.card.individual').hasClass('active')){

            //if the card is already extended, put it back to normal
            card_extension_close();

            //when a user opens this card, load with appropriate images and comments wrt the current user
            loadIndividualFeed(id);

        }
//       ------------------------------ GALLERY (group discussion) -----------------------
        // if gallery div is active, load the gallery
        if($('.card.gallery').hasClass('active')){

            card_extension();

            //update the heading in the card
            $('#gallery-description').text(activityButton.attr('data-description') +
            ' Use the badge option on the top-right corner to get an idea about how to help others.');

            loadGalleryFeed(id);

        }
//        ------------------------------ANSWER-----------------------
        if($('.card.multQues').hasClass('active')){

            //update this section based on curriculum

            //if the card is already extended, put it back to normal
            card_extension_close();
        }

//        ------------------------------MORE INFO (TALK MOVES)-----------------------
        if($('.card.moreinfo').hasClass('active')){

             //update this section based on curriculum
             //if the card is already extended, put it back to normal
             card_extension_close();
        }

//        ------------------------------BRAINSTORM-----------------------
        if($('.card.brainstorm').hasClass('active')){

            //update the heading
            //console.log('brainstorm heading:: ', activityButton.attr('data-heading'))
            //$('.card.' + type + ' h1').text(activityButton.attr('data-heading')); //update the title of each page


            //update the description
           //console.log(activityButton.attr('data-description'));
           if(activityButton.attr('data-description')){
                $('.card.' + type + ' p#brainstorm-description').text(activityButton.attr('data-description'));
            }

            //update the id
            $('input[name="brainstorm-id"]').attr('value', id)

            loadIdeaToWorkspace();

            //if the card is already extended, put it back to normal
            card_extension_close();
        }

        //user logging
        //enterLogIntoDatabase('activity select', type , 'activity-id-'+id, global_current_pagenumber);
    });
    //left hand side curriculum button actions -- end

    //right hand side card button actions -- start
    $('.close-card').on('touch click', function(){

        var classNameWhichisClosed = $(this).offsetParent()[0].className.split(" ")[1]
        //user logging
        //enterLogIntoDatabase('card close', classNameWhichisClosed, 'none', global_current_pagenumber);
        $(this).closest('.card').removeClass('active');

    });

    $('.extend-card').on('touch click', function(){

        var width = $(".card").width() / $('.card').parent().width() * 100
        width = width/2;
        console.log('width ::', width);

        if (width == 50){
            $('.card').css({'width':'100%'});
        }else{
            $('.card').css({'width':'50%'});
        }
        //var classNameWhichisExtended = $(this).offsetParent()[0].className.split(" ")[1]
        //enterLogIntoDatabase('card extend', classNameWhichisExtended, 'none', global_current_pagenumber);

    });
    //right hand side card button actions -- end

};

//
var card_extension = function(){

    $('.card').css({'width':'100%'});

}

var card_extension_close = function(){

    var width = $(".card").width() / $('.card').parent().width() * 100
    width = width/2;

    if (width == 100){
        $('.card').css({'width':'50%'});
    }


}

