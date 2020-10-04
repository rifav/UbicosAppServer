var host_url = window.location.host;
var ind_act_id; //digTextbook.js --> loadIndividualFeed --> postIndMessages --> database
var loaded_comments;

$(function(){

    //button color change with real time image navigation
    imageNavigation();

    //adding user input button event action
    individiualMsgBtnAction();

});


//call this function when individual comment is loaded for a particular number of activity
var loadIndividualFeed = function(act_id) {
//    //this method will load images from the current users' group members uploaded photo
//    //the messages associated with each photo is only visible to the current student
        ind_act_id = act_id;
//      steps to be implemented:
//      1. get all the images using the the current users group-mate info -- done in the server side
//      2. make a query to retrieve the images and send back to the client side -- done in the server side with the following ajax
//      3. display the images -- done with the following ajax
//      4. setup commenting and display [only visible to the current user] -- done

        //this ajax completes the 1-4 steps
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getIndividualImages/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){
                data = JSON.parse(data.imageData);
                //console.log(data)
                //console.log(data[0].fields['gallery_id']);

                //loop through the data to access each image and display the images
                $.each(data, function(key, value){
                    image_src = value.fields['image'];
                    image_posted_by = value.fields['posted_by'];
                    var id=key+1;
                    //update the image src
                    $('#slide-'+id+' img').attr('src','/media/'+image_src);
                    //update the img primary key
                    $('#slide-'+id+' img').attr('data-imgID', value.pk);
                    //console.log($('#slide-'+id+' img').attr('data-imgID'));
                    //TODO: display who posted the image

                    //hovering the image
                    $('#slide-'+id+' img').hover(function(){
                        $(this).css({ "-webkit-transform": "scale(1.2)",
                               "transform":"scale(1.2) " ,
                               "transition":"transform 0.25s ease"
                               });
                        }, function(){ //remove hovering effect
                            $(this).css({ "-webkit-transform": "scale(1)",
                                   "transform":"scale(1)" ,
                                   "transition":"transform 0.25s ease"});
                        });

                });//end of the each loop
            }//end of the success for the post ajax

        });//end of the ajax call

        //display the comments of the first image, clear the feed first for previous additions
        $('#ind-feed').empty();

        //initial display fix -- start
        //initially no button is grey, so the variable is true
        var noGrey=true;
        $('.slider a').each(function(id,element){
              //if there is any a tag element that is grey upon loading, means previously selected, so load the comments for that image
              if($(element).css('background-color') == 'rgb(165, 168, 166)') {
                var div = $(element).attr('href');
                imagePk = $(div+" img").attr("data-imgID");
                console.log('line 75 :: ',imagePk);
                retrieveComments(imagePk);
                noGrey=false;
                return false;
              }
        });

        //since no button is grey, means the first time loading, color the first button grey and load the comments for that image
        if(noGrey==true) {
            $('a[href="#slide-1"]').css('background-color',"#a5a8a6");
            var imagePk = $('#slide-1 img').attr("data-imgID");
            retrieveComments(imagePk);
        }
        //initial display fix -- end


} //end of loadIndividualFeed method


var imageNavigation = function(){

    $('.slider a').off().on('click', function(e){

         //with each button click, change the color of the selected button
         var href = $(this).attr('href');

         //change the background of the currently selected number
         $(this).css('background-color',"#a5a8a6");

         //change the background of the other numbers to original white color
         $('.slider a').not('[href="'+href+'"]').each(function(id,element){
              //console.log($(element));
              $(element).css('background-color',"white");
         });

         //with each click of the button empty the ind-feed first
         $('#ind-feed').empty();

         //comments are already retrieved when the page is loaded, so display based on the primary key of the image
         //if data exists, display it in the ind-feed
         var div = $(this).attr('href');
         var imagePk = $(div+" img").attr("data-imgID");
         //console.log("currently clicked image primary key :: " + imagePk);

        retrieveComments(imagePk);

    });
} //end of buttonColorChange method


var individiualMsgBtnAction = function(){
    //adding event listener to the chat button click
    $("#ind-msg-send-btn").off().on('click', function(e){
        e.preventDefault();
        postIndMessage();
        //alert($("input[name='ind-msg-text']").val());
    });
    //adding event lister for 'enter' button
    $('#ind-msg-text').off().on('keypress', function (e) {
        if (e.which == 13) {
         postIndMessage();
         //alert($("input[name='ind-msg-text']").val());
         return false;
        }
      });

} //end of individiualMsgBtnAction method

var postIndMessage = function (){

    //get the currently typed message
    var message = $("input[name='ind-msg-text']").val();

    if(!message){
        //message is empty;
        //entry into user log -- TODO fix the language
        enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, current_pagenumber);
        return;
    }

    //get the user name who posted
    var user_name = $("input[name='username']").val()
    enterLogIntoDatabase('click', 'activity-feed message input' , message, current_pagenumber);

    //check which image is open, extract that image data attribute (image PK) and pass that with the data to the server
    var imagePk;
    $('.slider a').each(function(id,element){
              //console.log($(element));
              if($(element).css('background-color') == 'rgb(165, 168, 166)') {
                var div = $(element).attr('href');
                imagePk = $(div+" img").attr("data-imgID");
                console.log('post message in the server ', imagePk);
              }
    });

//    //triggers the event in views.py
    $.post({
        url:'/saveIndividualCommentMsgs',
        async: false,
        data: {
         'activityID': ind_act_id,
         'message': message,
         'imagePK': imagePk,
        },
        success: function (data) {
            //empty the message pane
            $("input[name='ind-msg-text']").val('');

            //display the message in the feed when posted
            buildFeedwithMsgs(message);

        },
        error: function(){
            //inputEl.prop('disabled', false);
            $("input[name='ind-msg-text']").val('');
            alert("select an image first using the numbered circular buttons.");

            return false;
        }
    });

} // end of postIndMessage method

var buildFeedwithMsgs = function(message){
    var li = $("<li/>").appendTo("#ind-feed");
    li.addClass('message self');
    var div = $("<div/>").appendTo(li);
    div.addClass('user-image');
    var span = $('<span/>', {text: logged_in}).appendTo(div); //logged_in from utility.js
    var p = $('<p/>', {text: message}).appendTo(li);
    var div_msg = $("<div/>").appendTo(li);
    div_msg.addClass('msg-timestamp');
    var span_timestap = $('<span/>', {
              text: "add_timestamp"}).appendTo(div_msg);

    $('#ind-feed').scrollTop($('#ind-feed')[0].scrollHeight);
}// end of buildFeedwithMsgs method

var retrieveComments = function(imagePk){

    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getIndividualCommentMsgs/'+imagePk,
        async: false, //wait for ajax call to finish
        success: function(data){
              //display this data
              loaded_comments = JSON.parse(data.imageCommments); // converts from string type to array format
              //console.log("when the page is loading :: ", loaded_comments);
              //console.log(jQuery.type(data));
              if(loaded_comments==0){//if no comment this data will be empty
                console.log("no comment data");
              }else{
                //show the first image comments with the loading of the images
                //console.log(loaded_comments[0].fields['content']);
                //TODO loop through loaded_comments to display all the messages; [0] only displays the first comment
                buildFeedwithMsgs(loaded_comments[0].fields['content']);
              }

        },
    });

} //end of retrieveComments (imagePk) method

