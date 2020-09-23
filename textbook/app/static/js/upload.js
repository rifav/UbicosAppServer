
var host_url = window.location.host

$(function(){

        $("#file-upload").change(function(event){

                enterLogIntoDatabase('upload image', 'gallery image upload attempted' , '', current_pagenumber)

                console.log("file changed");

                //get file information
                var form_data = new FormData($('#upload-img')[0]);
                //console.log('form_data', form_data)

                var img_data //variable to store the image

                //ajax call to post the uploaded image in the database and with successful entry show the image at the beginning of the list
                $.ajax({
                      type:'POST',
                      url:'http://'+ host_url +'/uploadImage/',
                      processData: false,
                      contentType: false,
                      async: false,
                      cache: false,
                      data : form_data,
                      success: function(response){

                        //clear default image - not working here
                        //$('#default').attr('src', "pics/default.png");


                        //alert("successfully uploaded")
                        //TODO: update user with a 'success' message on the screen
                        $('.upload-success-msg').show();

                        //update gallery with newly uploaded image
                        img_data = response.success;
                        var obj = jQuery.parseJSON(img_data);
                        console.log(obj.image_id)


                        var groupID = groupArray[obj.group_id-1];
                        var li = $("<li/>").appendTo("#gallery"); //<ul id=gallery>

                         //adding image delete span
                         var span = $('<span/>')
                            .addClass('object_delete')
                            .appendTo(li);

                        var img = $('<img/>', {
                                src : 'http://'+ host_url + obj.url }).css({opacity:1.0}).appendTo(li);

                         var span_badge = $('<span/>')
                            .addClass('badge')
                            .text(groupID)
                            .appendTo(li);


                        var closeBtn = $('<span class="object_delete"></span>');

                        closeBtn.click(function(e){
                                card_extension_close();
                                e.preventDefault();
                                //get ID of the deleted note
                                var deletedImageID = obj.image_id;
                                console.log('deleted image id :: ', deletedImageID);
                                $(this).parent().remove(); //remove item from html

                              //delete note from database
                                $.ajax({
                                    type:'POST',
                                    url:'/gallery/del/'+deletedImageID,
                                    async: false, //wait for ajax call to finish,
                                    success: function(e){
                                        console.log(e)
                                        //TODO: add user log
                                        enterLogIntoDatabase('delete image', 'image delete right after upload' , 'image-delete-' + obj.image_id, current_pagenumber)

                                    }
                                })


                                return false;
                            });

                        li.append(closeBtn);


                         img.on('click', function(event){
                           enterLogIntoDatabase('gallery image view', 'gallery individual image view' , 'image-select-id-'+obj.image_id , 111)
                           totalPhoto = $(this).parent().siblings().length+1;
                           $('.section input[name="image-index"]').attr('value', $(this).parent().index())
                           openImageView($('#gallery-view'), $(this));

                       });

                        //reverse the image order
                        var list = $('#gallery');
                        var listItems = list.children('li');
                        list.append(listItems.get().reverse());

                        enterLogIntoDatabase('upload image', 'gallery image upload successful' , 'image-upload-' + obj.image_id, current_pagenumber)

                    }, error: function(response){
                           //TODO: log this
                           alert(data);
                           $( ".upload-success-msg-p" ).text( "Something went wrong, try again" );
                    }

                  });

            });


             //update preview image
            $("#file-upload").change(function(){
                readURL(this);
            });

            //event for success message close button
            $(".upload-success-msg-closebtn").on('click', function(){
                var div = this.parentElement;
                div.style.opacity = "0";
                setTimeout(function(){ div.style.display = "none"; }, 600);
            });


 });


    function readURL(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();
                reader.onload = function (e) {
                    $('#default').attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
        }

    }





