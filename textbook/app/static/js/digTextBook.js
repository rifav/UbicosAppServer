var current_pagenumber = 1 //initial page number; gets updated with page change
var type = '' //card type
var groupArray = ['A', 'B','C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
var activity_id
var lastOpenedTool


window.onerror = function(message, file, line) {
  console.log('An error occured at line ' + line + ' of ' + file + ': ' + message);
  enterLogIntoDatabase('error', 'error' , 'An error occured at line ' + line + ' of ' + file + ': ' + message, 9999)
  //alert('an error')
  return false;
};

/*
    This variable is key in the functioning of the page navigation functionality.
    It is also used in:
    * activityindex.js
*/
var NUM_PAGES = 18;


$(function(){

    //localStorage.clear();
    var host_url = window.location.host

    $('.close-card').on('touch click', function(){

        var classNameWhichisClosed = $(this).offsetParent()[0].className.split(" ")[1]
        //user logging
        enterLogIntoDatabase('card close', classNameWhichisClosed, 'none', current_pagenumber)
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

        var classNameWhichisExtended = $(this).offsetParent()[0].className.split(" ")[1]
        enterLogIntoDatabase('card extend', classNameWhichisExtended, 'none', current_pagenumber)

    });


    //update activity feed with history of messages
    loadFeed(0); //call function from activity.js //0 means all; 1 means todays chat


    // Load first pages
    // TODO the URL should indicate which page to be loaded instead of always loading pages 1 and 2
    loadPage(1, $('.page:not(.previous):not(.next)'));
    loadPage(2, $('.page.next'));

    // If we start loading the cards dynamically, this needs to be called after the brainstorm card is built
    setupBrainstorm();

    loadActivityIndex();

    //toggle between activity feed and index
    $('#main-view-toggle').click(function(){
        var hidden = $('.main-view:hidden');
        $('.main-view:visible').fadeOut('fast', function(){
            hidden.fadeIn('fast');
        });
        $(this).toggleClass('pressed');

        //TODO: add user log
        enterLogIntoDatabase('click', 'activity index', 'none', current_pagenumber)
    });

    $('#feed-toggle').click(function() {
            $(this).toggleClass('pressedf');
            if ($(this).hasClass("pressedf")){
            //call function from activity.js //0 means all; 1 means todays chat
                loadFeed(1);
            }else{
                loadFeed(0);
            }
     });

     $('#teacher-toggle').click(function() {
            $(this).toggleClass('pressedf');
            if ($(this).hasClass("pressedf")){
                var conf = confirm("You are about to view student information, are you sure?!");
                if(conf){
                    window.location.href = "http://"+host_url+"/getDashboard";
                }else{
                    $(this).removeClass("pressedf");
                }

            }else{

            }
     });


    //check localstorage - used for refresh

      if(localStorage.getItem("pageToBeRefreshed")){

        var pageToBeRefreshed = localStorage.getItem("pageToBeRefreshed");

        var gotoPage = pageToBeRefreshed;
        var container = $('#textbook-content');

        // Update current page
        loadPage(
            gotoPage,
            $('.page:not(.previous):not(.next)'),
            function(){
                // Update container class if this is the last or the first page
                var containerClass = ''
                if(gotoPage == 1) containerClass = 'first';
                else if(gotoPage == NUM_PAGES) containerClass = 'last'; // NUM_PAGES is defined in digTtextBook.js
                container.attr('class',containerClass);
                // Change page number
                $("#page-control-number").text('Page ' + gotoPage + '/' + NUM_PAGES);
            });
        // Update previous and next
        loadPage(parseInt(gotoPage)+1, $('.page.next'));
        loadPage(gotoPage-1, $('.page.previous'));

      }else{

      }


});


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

    // Replace page number
    //console.log("current page", currentPageNum)
    current_pagenumber = currentPageNum
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


var bindActivityButtons = function(){

    $('.page a').off().on('touch click', function(){
        // Get button type to open appropriate view
        //console.log('this', this)
        //console.log('$(this)', $(this))

        var activityButton = $(this);

        //type of activity - gallery/brainstorm/video etc
        type = activityButton.attr('class').replace('activity-button','').trim();
        console.log('type::', type)


        //id of each each activity
        var id = activityButton.attr('data-id');
        console.log('activity id::', id)

        //activity_id = id; //passing it to teacherindex.js

        // Disable current card and enable new card
        $('.card.active').removeClass('active');
        $('.card.' + type).addClass('active');

        // based on the activity type, update titles in html
        $('.card.' + type + ' h1').text(type + ' #'+id); //update the title of each page

//        ------------------------------teacher dashboard gallery-----------------------
        $('.teacher-view-toggle').off().on('click', function(){

            var activity_id = activityButton.attr('data-id');

            //$('.card.active').removeClass('active');
            $('.card.teacher').addClass('active');

            initStage(); //defined in teacherindex.js
            //loadtable(activity_id);   ////defined in teacherindex.js
            card_extension();

        })
//        ------------------------------based on different tools-----------------------
        // TODO: make the following if dynamic

//        ------------------------------VIDEO-----------------------
        // if video tab is active get the video url and display in video.html
        //display the video url in a new tab instead of the card
        if(type == 'video'){
            lastOpenedTool = 'video';
            $('.card.active').removeClass('active');
            var video_url = activityButton.attr('data-video-url');
            window.open(video_url, '_blank'); //open paint splash game in a new window
        }
//        ------------------------------TABLE-----------------------
        //if the table tab is active
        if($('.card.table').hasClass('active')){
             lastOpenedTool = 'table';

             $('input[name="table-id"]').attr('value', id)
             $('.card.' + type + ' h1').text(activityButton.attr('data-heading'));

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

//        ---------------------image upload card-----------------------
        if($('.card.upload').hasClass('active')){

             //if the card is already extended, put it back to normal
             card_extension_close();

             //TODO Fix with correct id values
             $('#upload-img input[name="act-id"]').attr('value', 1);
             $("input[name='group-id']").attr('value', 1);

             //https://stackoverflow.com/questions/52430558/dynamic-html-image-loading-using-javascript-and-django-templates
             $('img#default').attr('src', API_URL.picsBase + "/default.png");
             // end of the solution


        }
//        ---------------------individual discussion-----------------------

         if($('.card.individual').hasClass('active')){

             //if the card is already extended, put it back to normal
            card_extension_close();

        }
//       ------------------------------ GALLERY (group discussion) -----------------------
        // if gallery div is active, load the gallery
        if($('.card.gallery').hasClass('active')){

            card_extension();

            lastOpenedTool = 'gallery';

             //todo: need to fix this activity id value passing
             $('#upload-img input[name="act-id"]').attr('value', id);

            //todo: can we make it global? move to utility.js?
            var user_group_id
            $.ajax({
                type:'GET',
                url:'http://'+ host_url +'/getGroupID/'+$('input[name="act-id"]').val(),
                async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
                success: function(e){
                    user_group_id = e;
                    console.log("my group id (from digtextBook.js)::", e)
                }
            });

            //get data heading from the <a> tags
            //console.log(activityButton.attr('data-heading'));

            //update the heading in the card
            $('.card.' + type + ' h1').text(activityButton.attr('data-heading') + ' Group ' + groupArray[user_group_id-1]);

           //get the data description from the <a> tag
           //console.log(activityButton.attr('data-description'));

            //update the description in the card
           if(activityButton.attr('data-description')){
                $('.card.' + type + ' p#gallery-description').text(activityButton.attr('data-description'));
            }
            else{
                $('.card.' + type + ' p#gallery-description').text('Take a picture of your solution using "Open Camera". It will be downloaded to the "Downloads" folder. Upload the picture in your gallery.');
            }

            //update the submission heading
            $('#gallery-group-heading').text('My Submissions')

            //todo: clean up this part later
            //highlight the all submission  button and unhighlight the my submission
            $("#mySubmission").css('background-color', '#006600');
            $("#groupSubmission").css('background-color', '#2DB872');

            //since the card opens to my submission -- show user upload options
            //display upload image from here
             $('#gallery-user-submission').hide();
             $('#add-new-gallery-post').show();


            //gallery 1 card stays open if explicitly not closed and you go to gallery 2.
            //with each click hide the single image view
            $('#gallery-panel').show();
            $('#single-image-view').hide();


            var view = activityButton.attr('data-view');
            console.log('view: ', view)

            //call function from gallery.js
            $("input[name='group-id']").attr('value', user_group_id);
            viewDiv("class", user_group_id);

            //indicate that its not a middleGroupDiscussion -- variable used to extract comments as needed
            //defined in gallery.js (top)
            middleGroupDiscussion = 'no';

            //teacher-view handle
            //TODO: Can transfar ajax request to gallery.js inside populate function
            if(logged_in == 'AW'){
                $(".teacher-view").css("display", "block");
                 $.ajax({
                    type:'GET',
                    url:'http://'+ host_url +'/randomDiscussionList', //fetches number of groups
                    async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
                    success: function(e){

                        console.log(e.list);
                        populateTeacherViewDiv(e.list); //defined in gallery.js
                    }
                });
            }

            //if the card is already extended, put it back to normal -- we don't want to close the expansion for this card.
            //card_extension_close();
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
            $('.card.' + type + ' h1').text(activityButton.attr('data-heading')); //update the title of each page


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
        enterLogIntoDatabase('activity select', type , 'activity-id-'+id, current_pagenumber)


    });
};

var loadActivityIndex = function(){
    //TODO: call the parser here using ajax request, parse the files and build activity index

}

var card_extension = function(){

    var width = $(".card").width() / $('.card').parent().width() * 100
    width = width/2;
    console.log('width ::', width);

    $('.card').css({'width':'100%'});

//    if (width == 50){
//        $('.card').css({'width':'100%'});
//    }else{
//        $('.card').css({'width':'50%'});
//    }

}

var card_extension_close = function(){

    var width = $(".card").width() / $('.card').parent().width() * 100
    width = width/2;

    if (width == 100){
        $('.card').css({'width':'50%'});
    }

}

