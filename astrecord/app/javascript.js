$(document).ready(function(){

	$(dpcument).on('submit','#form1', function(event){

		event.preventDefault();

		var dados = $(this).serialize();

		$.ajax({

			url: 'Controller.php',
			type: 'POST',
			dataType: 'html',
			data: dados,
			sucess: function(data){
				$('#resultado').empty();
				$('#resultado').html(data);
				
			}
		})
	})
}