import $ from 'jquery'

function singleProductAddToCart(wrapper) {
	var form = wrapper.closest('form')
	var button = form.find('button.button')
	var formUrl = $(form)[0].action
	var formMethod = form.attr('method')

	if (typeof formMethod === 'undefined' || formMethod == '') {
		formMethod = 'POST'
	}

	var formData = new FormData(form[0])
	formData.append(button.attr('name'), button.val())

	const quantity = [...formData.entries()].reduce(
		(total, current) =>
			total +
			(current[0].indexOf('quantity') > -1
				? parseInt(current[1], 10)
				: 0),
		0
	)

	if (quantity === 0) {
		// return
	}

	if (form.closest('.quick-view-modal').length) {
		form.closest('.quick-view-modal')
			.find('.ct-quick-add')
			.removeClass('added')

		form.closest('.quick-view-modal')
			.find('.ct-quick-add')
			.addClass('loading')
	}

	button.removeClass('added')
	button.addClass('loading')

	const data = Object.fromEntries(formData)

	if (data['add-to-cart']) {
		data.product_id =
			form.find('input[name=variation_id]').val() || button.val()

		delete data['add-to-cart']
	}

	// Trigger event.
	$(document.body).trigger('adding_to_cart', [button, data])

	$.ajax({
		type: 'POST',
		url: woocommerce_params.wc_ajax_url
			.toString()
			.replace('%%endpoint%%', 'add_to_cart'),
		data,
		beforeSend: function (response) {},
		complete: function (response) {
			button.removeClass('loading')
		},
		success: function (response) {
			if (response.error && response.product_url) {
				window.location = response.product_url
				return
			}

			if (form.closest('.quick-view-modal').length) {
				form.closest('.quick-view-modal')
					.find('.ct-quick-add')
					.addClass('added')

				form.closest('.quick-view-modal')
					.find('.ct-quick-add')
					.removeClass('loading')
			}

			$(document.body).trigger('added_to_cart', [
				response.fragments,
				response.cart_hash,
				button,
				quantity,
			])
		},
	})
}

export const mount = (el, { event }) => {
	if (!$) {
		return
	}

	ctEvents.trigger('ct:header:update')
	singleProductAddToCart($(el))
}
