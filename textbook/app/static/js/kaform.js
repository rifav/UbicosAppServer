$(function(){

    ka_badge_form_Btn();

 });

var load_ka_card = function(ka_act_id) {

    //this method is defined in
    computationalModelMethod(logged_in, 'KA', ka_act_id);

}

var ka_badge_form_Btn = function(){

    $('#ka-copy-button').off().on('click', function(event){

        var $temp = $("<input>");
        $("body").append($temp);
        text = $('.badge-option-textarea textarea').val();
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();

    });
 }

