$(".hide").hide();

$(".clickable").on("click", function() {
  $(this).parent().parent().find(".show").hide();
  $(this).parent().parent().find(".hide").show();
})
