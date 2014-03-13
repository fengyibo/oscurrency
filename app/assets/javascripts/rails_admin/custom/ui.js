//= require_tree .

$(document).live('rails_admin.dom_ready',function(){
	// Submit called first time - check if exchange needs forcing by admin and 
	// if admin wants to force.
	var submitForm = false;
	$("#new_exchange").submit(function(e){
		// Already called submit once. It's ok, or admin wants to force it.
		// Either way, create this exchange.
		if(submitForm) return true;
		else {
			e.preventDefault();
			// Take data from rails_admin
			var worker = $("#exchange_worker_id").find("option[selected='selected']").text();
			var customer = $("#exchange_customer_id").find("option[selected='selected']").text();
			var amount = $("#exchange_amount").val();
			var group = $("#exchange_group_id").find("option[selected='selected']").val();
			// Check if all attributes are ok, if not prevent submitting
			if(worker == "" || customer == "" || amount == "0.0" || group == ""){
				alert("Please fill or required fields.");
				return false;
			}
			// prepare params for request
			var exchange = {}
			exchange["customer"] = customer;
			exchange["group"] = group;
			exchange["amount"] = amount;
			// ask server if admin has to force it, because customer does not have
			// enough money and can't take credit big enough.
			$.ajax({
	            type: 'get',
	            url: "/exchanges/exchange_require_force",
	            data: exchange,
	            beforeSend: function (xhr, settings) {
	                xhr.setRequestHeader("Accept", "application/json");
	            },
	            success: function (response) {
	                // Admin has to force it, customer can't pay.
	                if(response) {
	                	// Ask admin for confirmation.
	                	confirmation = "You are going to create an exchange that customer can't pay." + 
	                				   " Do you wish to force it?"
	                	if(confirm(confirmation)){ 
	                		// If admin wants to force it then force it.
	                		submitForm = true;
	                		$('#new_exchange').submit();
	                	} else {
	                		// Admin don't want to force it.
	                		return false;
	                	}
	                }
	            },
	            error: function (response) {
	            	console.log("error");
	            	console.log(response);
	            	return false;
	            }
	 		});
	 	}
	});
});
