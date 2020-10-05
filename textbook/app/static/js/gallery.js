$(function(){

    image_hover_func();

 });


var loadGalleryFeed = function(act_id){
    //based on the activity id, load the image, group member names, and set of comment made by the members
    //steps to be implement
    //1. make an ajax call to get the image, group member names, and the comments
    //2. display them
     $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getIndividualImages/'+act_id, //same url as this already gives us the images from all the group members
        async: false, //wait for ajax call to finish
        success: function(data){
            //display an image randomly -- choose the first image as random
            imageInfo = JSON.parse(data.imageData)[0];
            console.log(imageInfo);
            //set the src
            $('.section img').attr('src','/media/'+imageInfo.fields['image']);
            //set the primary key
            $('input[name="image-db-pk"]').val(imageInfo.pk);
        }
     });


} //end of loadGalleryFeed method


var image_hover_func = function(){

     //hovering effect-start
    $('.section div').hover(function(){
    $(this).css({ "-webkit-transform": "scale(1.2)",
           "transform":"scale(1.2) " ,
           "transition":"transform 0.25s ease"
           });
    }, function(){ //remove hovering effect
        $(this).css({ "-webkit-transform": "scale(1)",
               "transform":"scale(1)" ,
               "transition":"transform 0.25s ease"});
    });
    //hovering effect-end

}// end of image_hover_func method


