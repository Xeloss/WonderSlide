(function ($) {
	var _WGdefaultOptions = {
	    transitionEffect: "noEffect",
    	lodingImage: "",
    	height: 0,
	    width: 0,
    	nextButton: "",
    	previousButton: "",
    	milliseconds: 3000,
    	footerClass: ""
	};
	
    $.fn.extend({
        wonderSlide: function (params) {
            var list = this;
            var options = $.extend({}, _WGdefaultOptions, params);

            var transitions = new Transitions();
            var effect = new transitions[options.transitionEffect]();

            var frame = buildFrame(options);
            list.hide();
            list.parent().append(frame);
            frame.append(list);
            
            var footer = buildFooter(options);
			frame.append(footer);

            var previousBtn = $(options.previousButton).click(function () {
                showPrevious(frame, effect);
            });
            var nextBtn = $(options.nextButton).click(function () {
                showNext(frame, effect);
            });

            effect.prepareCanvas(frame);
            var timeOutId = setTimeout(function () { showNext(frame, effect); }, options.milliseconds);
            frame.attr("timeOutID", timeOutId)
                 .attr("ms", options.milliseconds);
                 
            var markerBar = buildMarkers(frame, effect, options);
            frame.append(markerBar);
            
            return list;
        }
    });
    
    function buildFrame(options){
    	return $("<div>").attr("current", -1)
  	                     .attr("style", "padding:0;background:url(" + options.lodingImage + ") no-repeat center")
    	                 .height(options.height)
        	             .width(options.width);
    }
    
    function buildFooter(options){
    	var footer = $("<div>").addClass("_WSF_")
							   .css("position", "absolute")
							   .css("z-index", 1000)
							   .css("top", options.height * 0.8)
							   .width(options.width)
							   .height(options.height * 0.2)
							   .hide();
		if (options.footerClass)
			footer.addClass(options.footerClass);
		else
			footer.css("background-color","#000")
				  .css("opacity", 0.7)
				  .css("color", "#FFF")
				  .css("padding", "5px");
		return footer;
    }
    
    function buildMarkers(container, effect, options){
    	var markerBar = $("<div>").addClass("_WSMB_")
    							  .css("position", "absolute")
    							  .css("z-index", 999)
    							  .css("font-size", 20)
    							  .css("top", 0)
    							  .css("left", 0)
    							  .width(options.width);
		
		var bulletQuantity = container.find("img").length;
		
		for(var i = 0; i < bulletQuantity; i++)
		{
			(function(i) { 
				var bullet = $("<span>").html("●")
									.css("margin", "4px")
									.css("cursor", "pointer")
									.attr("goTo", i)
									.click(function(){
										show(container, effect, i);
									});
				markerBar.append(bullet);
			})(i);
		}
		
		return markerBar;
    }
    
    function show(container, effect, index) {
    	var $image = $(container.find("img")[index]);
	    var imageUrl = $image.attr("src");
	    container.attr("current", index);
	
	    var currentTimeOut = container.attr("timeOutID");
	    clearTimeout(currentTimeOut);
	
	    var ms = container.attr("ms");
	    
	    var footer = container.find("._WSF_");
	    footer.fadeOut(500, function() { 
	    	if($image.attr("alt"))
			    footer.html($image.attr("alt"));
	    });
	    
	    effect.animateNext(container, imageUrl, function () {
	    	if ($image.attr("alt"))
	    		footer.fadeIn(500);
	        var newTimeOut = setTimeout(function () {
	            showNext(container, effect);
	        }, ms);
	        container.attr("timeOutID", newTimeOut);
	    });
	    
	    selectBullet(index);
	}
	
	function showNext(container, effect) {
	    var nextIndex = getNextIndex(container);
	    show(container, effect, nextIndex);
	}
	
	function showPrevious(container, effect) {
	    var previousIndex = getPreviousIndex(container);
	    show(container, effect, previousIndex);
	}
	
	function getNextIndex(container) {
	    var images = container.find("img");
	    
	    var current = parseInt(container.attr("current"));
	    if (++current < images.length)
	        return current;
	    else
	        return 0;
	}
	
	function getPreviousIndex(container) {
	    var images = container.find("img");
	    var current = parseInt(container.attr("current"));
	    
	    if (--current >= 0)
	        return current;
	    else
	        return images.length - 1;
	}
	
	function selectBullet(index){
		$("._WSMB_ span").css("color", "#000");
		$('._WSMB_ span[goTo=' + index + ']').css("color", "#FFF");
	}
	
	
	function Transitions() {
		//Fade transition
	    this.fade = function () {
	        this.animateNext = function (container, imageUrl, callback) {
	            var animationFrame = $(".animationFrame");
	            animationFrame.stop().hide();
	            animationFrame.css('background', 'url(' + imageUrl + ')')
	                      .fadeIn(500, function () {
	                          container.css('background', 'url("' + imageUrl + '")');
	                          callback();
	                      });
	        };
	        this.prepareCanvas = function (container) {
	            var animationFrame = $("<div>").attr("class", "animationFrame")
	                                   .attr("style", "float:left;z-index:10000;")
	                                   .width(container.width())
	                                   .height(container.height())
	                                   .hide();
	            container.append(animationFrame);
	        };
	    };
		
		//Dropping Curtain Transition
	    this.dropingCurtain = function() {
	        this.animateNext = function (container, imageUrl, callback){
	            var columns = container.find(".WGTC");
	            var columnHeight = container.height();
	
	            for(var i = 0; i < columns.length; i++)
	            {
	                (function(i){
	                    var column = $(columns[i]);
	                    
	                    if (column.attr("tout"))
	                    	clearTimeout(column.attr("tout"));
	                    
	                    column.stop()
	                    	  .css('background', 'url(' + imageUrl + ') no-repeat '+ -i * 30 +'px 0')
	                          .css('opacity', 0)
	                          .height(0);
	
	                    var columnTout = setTimeout(function() {
	                        if(i == columns.length - 1)
	                            column.animate({ opacity: 1, height: columnHeight }, 500, function(){
	                                container.css('background', 'url("' + imageUrl + '")');
	                                callback();
	                            });
	                        else
	                            column.animate({ opacity: 1, height: columnHeight }, 500);
	                    }, 10 + i * 60);
	                    
	                    column.attr("tout", columnTout);
	                    
	                })(i);
	            }
	        };
	
	        this.prepareCanvas = function (container) { 
	            container.css("position", "relative")
	                     .css("overflow", "hidden");
	            var columnNumbers = parseInt(container.width() / 30) + 1;
	            for(var i = 0; i < columnNumbers; i++)
	            {
	                var column = $("<div>").addClass("WGTC")
	                                       .attr("style", "position:absolute;top:0;left:"+ i * 30 + "px;z-index:100")
	                                       .width(30)
	                                       .height(0);
	                container.append(column);
	            }
	        };
	    };
		
		//Fade in Curtain Transition
	    this.fadeInCurtain = function() {
	        this.animateNext = function (container, imageUrl, callback){
	            var columns = container.find(".WGTC");
	
	            for(var i = 0; i < columns.length; i++)
	            {
	                (function(i){
	                    var column = $(columns[i]);
	                    
	                    if(column.attr("tout"))
	                    	clearTimeout(column.attr("tout"));
	                    
	                    column.stop()
	                    	  .css('background', 'url(' + imageUrl + ') no-repeat '+ -i * 30 +'px 0')
	                          .css('opacity', 0);
	
	                    var columnTout = setTimeout(function() {
	                        if(i == columns.length - 1)
	                            column.animate({ opacity: 1 }, 500, function(){
	                                container.css('background', 'url("' + imageUrl + '")');
	                                callback();
	                            });
	                        else
	                            column.animate({ opacity: 1 }, 500);
	                    }, 10 + i * 60);
	                    
	                    column.attr("tout", columnTout);
	                    
	                })(i);
	            }
	        };
	
	        this.prepareCanvas = function (container) { 
	            container.css("position", "relative")
	                     .css("overflow", "hidden");
	            var columnNumbers = parseInt(container.width() / 30) + 1;
	            var columnHeight = container.height();
	            for(var i = 0; i < columnNumbers; i++)
	            {
	                var column = $("<div>").addClass("WGTC")
	                                       .attr("style", "position:absolute;top:0;left:"+ i * 30 + "px;z-index:100")
	                                       .width(30)
	                                       .height(columnHeight);
	                container.append(column);
	            }
	        };
	    };
	
		//Slide Transition
	    this.slide = function () {
	        this.animateNext = function (container, imageUrl, callback) {
	
	            var frame = container.find(".WGF");
	
	            frame.stop()
	            	 .css("left", container.width())
	                 .css('background', 'url(' + imageUrl + ') no-repeat 0 0')
	                 .css('opacity', 0)
	                 .animate({ left: 0, opacity: 1 }, 500, function () {
	                     container.css('background', 'url("' + imageUrl + '")');
	                     callback();
	                 });
	        };
	        this.prepareCanvas = function (container) {
	            container.css("position", "relative")
	                     .css("overflow", "hidden");
	            var nextFrame = $("<div>").addClass("WGF")
	                                      .attr("style", "position:absolute;top:0;z-index:100")
	                                      .width(container.width())
	                                      .height(container.height());
	            container.append(nextFrame);
	        };
	    };
	
		//No effect
	    this.noEffect = function () {
	        this.animateNext = function (container, imageUrl, callback) {
	            container.css('background', 'url("' + imageUrl + '")');
	            callback();
	        };
	        this.prepareCanvas = function (container) { };
	    };
	}
})(jQuery);