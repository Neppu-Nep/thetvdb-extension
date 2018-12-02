$(function() {


/*
 * On Load
 */

	$("#search_input").focus();

	var recent = recentGet();
	if (recent !== null && recent.length > 0) {
		recent = recent.reverse();
		for(k in recent) {
			$('.recent_wrap').append('<div class="recent"><label class="query">'+recent[k]+'</label><i data-it="'+k+'" class="recent_delete"><svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></i></div>');
		}
	} else {
		$('.recent_search').hide();
	}
	
/*
 * Functions
 */

	function notif(text) {$("#notif").show(); $("#notif").empty(); $("#notif").html(text); }

	function recentRemove(query) {
		let recent = JSON.parse(localStorage.getItem('recent'));
		var i = recent.indexOf(query);
		if (i != -1) {
			recent.splice(i, 1);
		}

		localStorage.setItem('recent', JSON.stringify(recent));
	}

	function recentRemoveAll() {
		let recent = [];
		localStorage.setItem('recent', JSON.stringify(recent));
	}

	function recentAdd(query) {
		if (typeof localStorage.getItem('recent') !== 'undefined' && localStorage.getItem('recent') !== null) {
			var recent = JSON.parse(localStorage.getItem('recent'));
			if (recent[recent.length-1] != query) {
				if (recent.length >= 5) {recent.pop();} // delete last one
			} else {return;}
		} else { var recent = []; }

		recent.push(query);
		localStorage.setItem('recent', JSON.stringify(recent));
	}

	function recentGet() {
		if (typeof localStorage.getItem('recent') !== 'undefined' && localStorage.getItem('recent') !== null) {
			return JSON.parse(localStorage.getItem('recent'));
		} return [];
	}

	function getToken() {
		return $.ajax({
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: '{"apikey": "api_key_here"}',
			url: 'https://api.thetvdb.com/login'
		});
	}

	function findSeries(token, query) {
		return $.ajax({
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + token); 
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			url: 'https://api.thetvdb.com/search/series?name='+query
		});
	}

	function getSingleSeries(token,id) {
		return $.ajax({
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + token); 
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			url: 'https://api.thetvdb.com/series/'+id
		});
	}

	function getBanner(data,k,token) {
		return $.ajax({
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + token); 
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			url: 'https://api.thetvdb.com/series/'+data.data[k].id+'/images/query?keyType=poster'
		});
	}

	function getRating(data,k,token) {
		return $.ajax({
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + token); 
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			url: 'https://api.thetvdb.com/series/'+data.data[k].id
		});
	}

	function getEpisodeSeason(token,id) {
		return $.ajax({
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + token); 
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			url: 'https://api.thetvdb.com/series/'+id+'/episodes/summary'
		});
	}

	function addData(data,k,img_url,rating) {
		$(".search_results").append('<div class="result"> <img width="100%" src="https://www.thetvdb.com/banners/'+img_url+'" alt="'+data.data[k].seriesName+'"> <div class="info"> <label> <i class="icon"> <svg height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M9 11.3l3.71 2.7-1.42-4.36L15 7h-4.55L9 2.5 7.55 7H3l3.71 2.64L5.29 14z"/><path d="M0 0h18v18H0z" fill="none"/></svg> </i> <span>'+rating+'</span></label> </div> <div class="synopsis"> <span><p>'+data.data[k].seriesName+'<br><br> TVDB ID : '+data.data[k].id+'</p></span></div> <button class="cta_more" data-id="'+data.data[k].id+'"><svg height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg></button> </div>');
	}

	function showResults () {
		$(".search_results").show();
		$("#overlay_loading").hide();
		$(".search_results").addClass('fadeIn');
	}

/*
 * Events
 */

 	// Clear Recent Item
	$(document).on('click', ".recent_delete", function() {
		recentRemove($(this).parent().find(".query").text());
		$(this).parent().addClass('clear');
		$(this).parent().fadeOut().delay(500);
		setTimeout(function(){
			$(this).parent().remove();
		}, 1000);
	});

	// Clear Recent All
	$(document).on('click', "#clear_recent", function() {
		$('.recent_wrap > .recent').each(function(i, item) {
			$(this).addClass('clear');
		});
		recentRemoveAll();
	});

	$(".anime .anime_cta").on('click', function() {
		chrome.tabs.create({
			'url': $(this).attr('data-url')
		});
	});

	// Search Submit
	$("#search_form").on('submit', function(e) {
		e.preventDefault();
		$("#notif").hide();
		var text = $("#search_input").val();

		if (text.length < 1) {
			notif("Search query must at least contain <b>1 letter</b>!");
			return;
		}

		recentAdd(text);
		$("#search_input").val(text);

		$(".search_results").empty();
		$(".search_results").hide();
		$(".recent_search").hide();
		$(".anime").hide();

		$("#overlay_loading").show();
		$("#overlay_loading").css('display', 'grid');
		var query = encodeURI(text);

		getToken().done(function(token_data){
			token = token_data.token;
			findSeries(token,query).done(function(series_data){
				if ('error' in series_data) {

					$("#overlay_loading").hide();
	
					if (series_data.error == "File does not exist") {
						notif("Anime does not exist!");
						return;
					}
						
					notif("Unknown error. Try again later.");
					return;
				}
	
				if (series_data.data === undefined || series_data.data.length == 0) {
					notif("No results for \""+query+"\"");
					return;
				}
				series_length = series_data.data.length;
				
				for(k in series_data.data) {
					(function(k){
						img_url = getBanner(series_data,k,token);
						rating = getRating(series_data,k,token);
						$.when(img_url, rating).done(function(img_ajax, rating_ajax){
							img_url = img_ajax[0].data[0].fileName;
							rating = rating_ajax[0].data.siteRating;
							addData(series_data,k,img_url,rating)
						});
					})(k);
				}

				$(document).ajaxStop(function() {
					showResults();
				});

			}).fail(function(){
				$("#overlay_loading").hide();
				notif("Anime does not exist!");
				return;
			});
		});
	});

	// Select Recent Item
	$(".recent > .query").on('click', function() {
		$(".search_results").empty();
		$(".search_results").hide();
		$(".recent_search").hide();
		$(".anime").hide();
		$("#notif").hide();

		var text = $(this).text();
		recentAdd(text);
		$("#search_input").val(text);

		$("#overlay_loading").show();
		$("#overlay_loading").css('display', 'grid');
		var query = encodeURI(text);

		getToken().done(function(token_data){
			token = token_data.token;
			findSeries(token,query).done(function(series_data){
				if ('error' in series_data) {

					$("#overlay_loading").hide();
	
					if (series_data.error == "File does not exist") {
						notif("Anime does not exist!");
						return;
					}
						
					notif("Unknown error. Try again later.");
					return;
				}
	
				if (series_data.data === undefined || series_data.data.length == 0) {
					notif("No results for \""+query+"\"");
					return;
				}
				
				for(k in series_data.data) {
					(function(k){
						img_url = getBanner(series_data,k,token);
						rating = getRating(series_data,k,token);
						$.when(img_url, rating).done(function(img_ajax, rating_ajax){
							img_url = img_ajax[0].data[0].fileName;
							rating = rating_ajax[0].data.siteRating;
							addData(series_data,k,img_url,rating)
						});
					})(k);
				}

				$(document).ajaxStop(function() {
					showResults();
				});
				
			}).fail(function(){
				$("#overlay_loading").hide();
				notif("Anime does not exist!");
				return;
			});
		});
	});

	// Select Search Item
	$(document).on('click', '.cta_more', function() {
		var id = $(this).attr('data-id');

		$(".search_results").fadeOut();
		$(".search_results").empty();
		$("#overlay_loading").show();
		$("#overlay_loading").css('display', 'grid');

		getToken().done(function(token_data){

			token = token_data.token;
			getSingleSeries(token,id).done(function(single_series_data){

				getEpisodeSeason(token,id).done(function(ep_season_data){

					seasons = ep_season_data.data.airedSeasons;
					seasons = seasons.sort()
					seasons_no = seasons[seasons.length - 1];

					episodes_no = ep_season_data.data.airedEpisodes;

					$("#overlay_loading").hide();
					$(".anime").show();
					$(".anime").css('display', 'grid');
					$(".anime h1").text(single_series_data.data.seriesName);
					$(".anime .id span").text(single_series_data.data.id);
					$(".anime .status span").text(single_series_data.data.status);

					
					if (single_series_data.data.aliases.length != 0) {
						$(".anime .aliases span").text("Aliases: ");
						aliases = single_series_data.data.aliases.join(", ");
							$(".anime .aliases span").append(aliases).text();
					}

					genres = single_series_data.data.genre.join(", ");
					$(".anime .genres span").text(genres);

					$(".anime .seasons span").text(seasons_no);
					$(".anime .episodes span").text(episodes_no);
					$(".anime .img").attr("src", "https://www.thetvdb.com/banners/"+single_series_data.data.banner);
					$(".anime .img").attr("alt", single_series_data.data.seriesName);
					$(".anime p").html(single_series_data.data.overview).text();
					$('.anime .anime_cta').attr('data-url', 'https://www.thetvdb.com/series/'+single_series_data.data.slug);
					$(".anime").addClass('fadeIn');

				});
			});
		});
	});

	// Input Focus Style
	$("#search_input").focus(function(){
		$("#search_form").addClass('focus');
	}).blur(function(){
		$("#search_form").removeClass('focus');
	});

});