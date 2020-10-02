var host_url = window.location.host;
var ind_act_id; //digTextbook.js --> loadIndividualFeed --> postIndMessages --> database

$(function(){

    //button color change with real time click
    buttonColorChange();

    //adding user input button event action
    individiualMsgBtnAction();

});


//call this function when individual comment is loaded for a particular number of activity
var loadIndividualFeed = function(act_id) {
//    //this method will load images from the current users' group members uploaded photo
//    //the messages associated with each photo is only visible to the current student
        ind_act_id = act_id;
//      steps to be implemented
//      1. get the current users group-mate info -- done in the server side
//      2. make a query to retrieve the images and send back to the client side -- done
//      3. display the images -- done
//      4. setup commenting and display [only visible to the current user] --TODO

        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getIndividualImages/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){
                data = JSON.parse(data.imageData);
                console.log(data)
                //console.log(data[0].fields['gallery_id']);

                //loop through the data to access each image
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

                      //  TODO  display the comment for each image part:
                });
            }
        })

} //end of loadIndividualFeed method


var buttonColorChange = function(){
    $('.slider a').off().on('click', function(e){

         var href = $(this).attr('href');
         console.log(href);

         //change the background of the currently selected number
         $(this).css('background-color',"#a5a8a6");

         //change the background of the other numbers to original
         $('.slider a').not('[href="'+href+'"]').each(function(id,element){
              //console.log($(element));
              $(element).css('background-color',"white");
         });

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
                console.log('post message in the server', imagePk);
              }
    });

//    //triggers the event in views.py
    $.post({
        url:'/individualCommentMsgs',
        async: false,
        data: {
         'activityID': ind_act_id,
         'message': message,
         'imagePK': imagePk,
        },
        success: function (data) {
            //empty the message pane
            $("input[name='username']").val('');

            //display the message in the feed when posted
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

        },
        error: function(){
            //inputEl.prop('disabled', false);
            $("input[name='username']").val('');
            alert("select an image first using the numbered circular buttons.");

            return false;
        }
    });

} // end of postIndMessage method


//function loadFeed(type){
//    //alert("calling loadFeed method");
//    //clear existing html so the new ones dont get appended
//    $('#activity-feed').empty();
//
//    $.ajax({
//
//            type:'GET',
//            url:'http://'+ host_url +'/updateFeed/'+type,
//
//            success: function(response){
//
//                var logged_in_user = response.username //passed from views.py - updateFeed
//
//                msg_data = response.success
//                var obj = jQuery.parseJSON(msg_data);
//
//                //console.log(obj)
//
//                $.each(obj, function(key, value){
//
//                    //  add in the thread itself
//                    var li = $("<li/>").appendTo("#activity-feed");
//                    if(value.fields['posted_by'][0] == logged_in_user){
//                        li.addClass('message self');
//                    }else{
//                        li.addClass('message');
//                    }
//
//                    var div = $("<div/>").appendTo(li);
//                    div.addClass('user-image');
//
//                    var span = $('<span/>', {
//                        text: value.fields['posted_by'][0]}).appendTo(div);
//
//                    var p = $('<p/>', {
//                            text: value.fields['content']}).appendTo(li);
//
//
//                    var div_msg = $("<div/>").appendTo(li);
//                    div_msg.addClass('msg-timestamp');
//
//                    var span_timestap = $('<span/>', {
//                            text: "add timestamp"}).appendTo(div_msg);
//
//                });
//
//                // Scroll page to bottom
//                $('#dynamic-content').animate({ scrollTop: $('#activity-feed').height() }, 400);
//            }
//        });
//}

