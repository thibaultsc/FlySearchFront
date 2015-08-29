flyWkApp.directive("showTravelButtons", function($compile) {
    var replacementMarkup = "<!-- show-travel-button --\>";
    
    return {
        restrict: 'A',
        priority: 2000,
        compile: function(element, attributes) {
            var detailTemplate = $compile(element.find("div.btn-appear").replaceWith(replacementMarkup));
            var elementSelector = element[0].nodeName + '.' + element.attr("class").trim().replace(" ", ".");
            
            $(element).parent().on("mouseenter", elementSelector, function(e) {
                var target = $(this).find("*").contents().filter(function(){
                    return this.nodeType == 8 && this.textContent.trim() === "show-travel-button";
                });
                
                if(target.length) {
                    var scope = target.scope();
                                                
                    detailTemplate(scope,
                        function(detail) {
                            target.replaceWith(detail);
                        });
                }
            });
        }
    }
});

