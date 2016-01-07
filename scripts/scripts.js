"use strict";angular.module("naturenetWebApp",["ngAnimate","ngCookies","ngMap","ngResource","ngRoute","ngSanitize","ngTouch","naturenetWebApp.filters","angularUtils.directives.dirPagination","bootstrapLightbox"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/home.html",controller:"MainCtrl"}).when("/observations",{templateUrl:"views/map.html",controller:"ObservationsCtrl"}).when("/activities",{templateUrl:"views/activities.html",controller:"ActivityListCtrl"}).when("/designs",{templateUrl:"views/designs.html",controller:"DesignIdeaListCtrl"}).when("/observation/:id",{templateUrl:"views/observation.html",controller:"ObservationCtrl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).otherwise({redirectTo:"/"})}]).config(["LightboxProvider",function(a){a.templateUrl="views/observation-lightbox.html"}]),angular.module("naturenetWebApp.filters",[]).filter("interpolate",["version",function(a){return function(b){return String(b).replace(/\%VERSION\%/gm,a)}}]).filter("thumb",[function(){return function(a){return String(a).replace("upload/","upload/w_100,h_100,c_fill/")}}]).filter("large",[function(){return function(a){return String(a).replace("upload/","upload/h_600,c_fit/")}}]).filter("medium",[function(){return function(a){return String(a).replace("upload/","upload/w_292,h_200,c_fit/")}}]),function(){var a,b="angularUtils.directives.dirPagination";try{a=angular.module(b)}catch(c){a=angular.module(b,[])}a.directive("dirPaginate",["$compile","$parse","$timeout","paginationService",function(a,b,c,d){return{terminal:!0,multiElement:!0,priority:5e3,compile:function(c,e){c[0].hasAttribute("dir-paginate-start")||c[0].hasAttribute("data-dir-paginate-start")?(e.$set("ngRepeatStart",e.dirPaginate),c.eq(c.length-1).attr("ng-repeat-end",!0)):e.$set("ngRepeat",e.dirPaginate);var f=e.dirPaginate,g=f.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),h=/\|\s*itemsPerPage\s*:[^|]*/;if(null===g[2].match(h))throw"pagination directive: the 'itemsPerPage' filter must be set.";var i=g[2].replace(h,""),j=b(i),k=e.paginationId||"__default";return d.registerInstance(k),function(c,e,f){var g,h=a(e,!1,5e3);if(f.currentPage)g=b(f.currentPage);else{var i=k+"__currentPage";c[i]=1,g=b(i)}d.setCurrentPageParser(k,g,c),"undefined"!=typeof f.totalItems?(d.setAsyncModeTrue(k),c.$watch(function(){return b(f.totalItems)(c)},function(a){a>=0&&d.setCollectionLength(k,a)})):c.$watchCollection(function(){return j(c)},function(a){a&&d.setCollectionLength(k,a.length)}),h(c)}}}}]),a.directive("dirPaginationControls",["paginationService","paginationTemplate",function(a,b){function c(a,b,c,e){var f,g=[],h=Math.ceil(b/c),i=Math.ceil(e/2);f=i>=a?"start":a>h-i?"end":"middle";for(var j=h>e,k=1;h>=k&&e>=k;){var l=d(k,a,e,h),m=2===k&&("middle"===f||"end"===f),n=k===e-1&&("middle"===f||"start"===f);j&&(m||n)?g.push("..."):g.push(l),k++}return g}function d(a,b,c,d){var e=Math.ceil(c/2);return a===c?d:1===a?a:d>c?b>d-e?d-c+a:b>e?b-e+a:a:a}var e=/^\d+$/;return{restrict:"AE",templateUrl:function(a,c){return c.templateUrl||b.getPath()},scope:{maxSize:"=?",onPageChange:"&?"},link:function(b,d,f){function g(d){i(d)&&(b.pages=c(d,a.getCollectionLength(j),a.getItemsPerPage(j),l),b.pagination.current=d,b.onPageChange&&b.onPageChange({newPageNumber:d}))}function h(){var d=parseInt(a.getCurrentPage(j))||1;b.pages=c(d,a.getCollectionLength(j),a.getItemsPerPage(j),l),b.pagination.current=d,b.pagination.last=b.pages[b.pages.length-1],b.pagination.last<b.pagination.current&&b.setCurrent(b.pagination.last)}function i(a){return e.test(a)&&a>0&&a<=b.pagination.last}var j;if(j=f.paginationId||"__default",b.maxSize||(b.maxSize=9),b.directionLinks=angular.isDefined(f.directionLinks)?b.$parent.$eval(f.directionLinks):!0,b.boundaryLinks=angular.isDefined(f.boundaryLinks)?b.$parent.$eval(f.boundaryLinks):!1,!a.isRegistered(j)){var k="__default"!==j?" (id: "+j+") ":" ";throw"pagination directive: the pagination controls"+k+"cannot be used without the corresponding pagination directive."}var l=Math.max(b.maxSize,5);b.pages=[],b.pagination={last:1,current:1},b.$watch(function(){return(a.getCollectionLength(j)+1)*a.getItemsPerPage(j)},function(a){a>0&&h()}),b.$watch(function(){return a.getItemsPerPage(j)},function(a,c){a!=c&&g(b.pagination.current)}),b.$watch(function(){return a.getCurrentPage(j)},function(a,b){a!=b&&g(a)}),b.setCurrent=function(b){i(b)&&a.setCurrentPage(j,b)}}}}]),a.filter("itemsPerPage",["paginationService",function(a){return function(b,c,d){if("undefined"==typeof d&&(d="__default"),!a.isRegistered(d))throw"pagination directive: the itemsPerPage id argument (id: "+d+") does not match a registered pagination-id.";var e,f;return b instanceof Array?(c=parseInt(c)||9999999999,f=a.isAsyncMode(d)?0:(a.getCurrentPage(d)-1)*c,e=f+c,a.setItemsPerPage(d,c),b.slice(f,e)):b}}]),a.service("paginationService",function(){var a,b={};this.registerInstance=function(c){"undefined"==typeof b[c]&&(b[c]={asyncMode:!1},a=c)},this.isRegistered=function(a){return"undefined"!=typeof b[a]},this.getLastInstanceId=function(){return a},this.setCurrentPageParser=function(a,c,d){b[a].currentPageParser=c,b[a].context=d},this.setCurrentPage=function(a,c){b[a].currentPageParser.assign(b[a].context,c)},this.getCurrentPage=function(a){var c=b[a].currentPageParser;return c?c(b[a].context):1},this.setItemsPerPage=function(a,c){b[a].itemsPerPage=c},this.getItemsPerPage=function(a){return b[a].itemsPerPage},this.setCollectionLength=function(a,c){b[a].collectionLength=c},this.getCollectionLength=function(a){return b[a].collectionLength},this.setAsyncModeTrue=function(a){b[a].asyncMode=!0},this.isAsyncMode=function(a){return b[a].asyncMode}}),a.provider("paginationTemplate",function(){var a="directives/pagination/dirPagination.tpl.html";this.setPath=function(b){a=b},this.$get=function(){return{getPath:function(){return a}}}})}();var nnWebApp=angular.module("naturenetWebApp");nnWebApp.value("apiRoot","http://naturenet.herokuapp.com/api"),nnWebApp.controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"];var b=a.slides=[];a.addSlide=function(){b.push({image:"images/slide-"+c+".jpg",text:"ACES"})};for(var c=4;9>c;c++)a.addSlide(c)}]).controller("ObservationListCtrl",["$scope","$http","Lightbox","apiRoot",function(a,b,c,d){a.currentYear=2015,a.currentMonth=3;var e=d+"/sync/notes/within/"+a.currentYear+"/"+a.currentMonth+"/at/aces";b.get(e).success(function(a){f(a)});var f=function(b){var c=b.data;a.notes=c.filter(function(a){return"FieldNote"===a.kind&&a.medias&&a.medias.length>0&&"deleted"!==a.status}).reverse(),a.notes.forEach(function(a,b){a.index=b}),a.images=a.notes.map(function(a){return{url:a.medias[0].link,caption:a}})};a.currentPage=1;var g=function(a,b){var c=["Jan.","Feb.","Mar.","Apr.","May","Jun","Jul","Aug","Sep.","Oct.","Nov.","Dec."],d=c[a-1]+" "+b;return d};a.dateTitle=g(a.currentMonth,a.currentYear),a.next=function(){a.currentMonth++,13===a.currentMonth&&(a.currentYear++,a.currentMonth=1),a.dateTitle=g(a.currentMonth,a.currentYear);var c=d+"/sync/notes/within/"+a.currentYear+"/"+a.currentMonth+"/at/aces";b.get(c).success(function(a){f(a)})},a.prev=function(){a.currentMonth--,0===a.currentMonth&&(a.currentYear--,a.currentMonth=12),a.dateTitle=g(a.currentMonth,a.currentYear);var c=d+"/sync/notes/within/"+a.currentYear+"/"+a.currentMonth+"/at/aces";b.get(c).success(function(a){f(a)})}}]).controller("ObservationCtrl",["$scope","$http","$routeParams","UserService","apiRoot",function(a,b,c,d,e){var f=e+"/note/"+c.id;b.get(f).success(function(c){a.observation=c.data;var d=e+"/note/"+c.data.id+"/feedbacks";b.get(d).success(function(b){var c=b.data;a.comments=c.filter(function(a){return"comment"===a.kind})})}),a.account=d.user,a.comment="",a.addComment=function(){if(a.account.isSignedIn){a.loading=!0,a.showAlert=!1;var f=e+"/feedback/new/comment/for/note/"+c.id+"/by/"+d.user.username;b({url:f,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},data:$.param({content:a.comment})}).success(function(b){a.loading=!1,a.comments.push(b.data),a.comment=""}).error(function(a,b){console.log("error!"+b)})}else a.showAlert=!0}}]).controller("ObservationWindowController",["$scope",function(a){}]).controller("ActivityListCtrl",["$scope","$http","apiRoot",function(a,b,c){var d=c+"/context/activities";a.activities=[],b.get(d).success(function(d){d.data.filter(function(a){return"aces"===a.site.name||"elsewhere"===a.site.name}).forEach(function(b){a.activities.push(b)}),a.activities.forEach(function(a){a.extras=a.extras&&angular.fromJson(a.extras);var d=c+"/context/"+a.id+"/notes";b.get(d).success(function(b){a.notes=b.data.filter(function(a){return a.medias&&a.medias.length>0&&"deleted"!==a.status}).reverse()})})})}]).controller("DesignIdeaListCtrl",["$scope","$http","$routeParams","UserService","apiRoot",function(a,b,c,d,e){var f=e+"/designideas/at/aces";b.get(f).success(function(b){a.designIdeas=b.data,a.designIdeas.forEach(function(a){a.likes=a.feedbacks.filter(function(a){return"like"===a.kind}).length}),a.designIdeas=a.designIdeas.reverse()}),a.prompts=[{name:"Wouldn't it be cool if...",context:"aces_design_new",text:"Tell us about new features or activities you would like on this app:"},{name:"It would be better if...",context:"aces_design_existing",text:"Is there something we could do better?"},{name:"Open Suggestion",context:"aces_design_idea",text:"Contribute a design idea to make NatureNet better"}],a.selected_prompt=a.prompts[0],a.account=d.user,a.addIdea=function(){if(a.account.isSignedIn){a.loading=!0,a.showAlert=!1;var c=e+"/note/new/"+d.user.username;b({url:c,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},data:$.param({content:a.designidea,kind:"DesignIdea",context:a.selected_prompt.context})}).success(function(b){a.loading=!1;var c=b.data;c.likes=c.feedbacks.filter(function(a){return"like"===a.kind}).length,a.designIdeas.unshift(b.data),a.designidea=""}).error(function(a,b){console.log("error!"+b)})}else a.showAlert=!0},a.likeIdea=function(a){a.likes+=1;var c=e+"/feedback/new/like/for/Note/"+a.id+"/by/"+d.user.username;b({url:c,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},data:$.param({content:!0,parent_id:0})}).success(function(a){console.log("Updated note: ",a)})}}]).controller("OtherController",["$scope",function(a){a.pageChangeHandler=function(a){console.log("going to page "+a)}}]).controller("SignUpController",["$scope","$http","UserService","apiRoot",function(a,b,c,d){a.account={},a.consent={notice:"You are invited to participate in NatureNet, a research project being conducted by the researchers listed at http://research.nature-net.org/people.html. In order for us to collect and study the way people are using technology like NatureNet, we must have your consent.",upload:"(Required) I agree that any observations (photos) or comments I contribute to NatureNet may be publicly displayed on the web, mobile phone, or tabletop platforms that comprise NatureNet.",share:"(Required) I agree to allow any comments, observations, and profile information that I choose to share with others via the online application to be visible to others who use the application at the same time or after me.",recording:"(Optional) I agree to be videotaped/audiotaped during my participation in this study.",survey:"(Optional) I agree to complete a short questionnaire during or after my participation in this study."},a.affiliations=[{name:"ACES in Colorado",key:"aces_user"},{name:"AWS in Maryland",key:"aws_user"},{name:"Reedy Creek in North Carolina",key:"rcnp_user"},{name:"Other",key:""}],a.submit=function(){if(a.validate()){var c=d+"/account/new/"+a.account.username;b({url:c,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},data:$.param({name:a.account.name,password:a.account.password,email:a.account.email,consent:angular.toJson(a.account.consent),affiliation:a.account.affiliation})}).success(function(b){a.errorMessage=null,a.successMessage="Welcome to NatureNet, "+b.data.username+"!",a.account={},console.log("User successfully created")}).error(function(b,c){a.successMessage=null,a.errorMessage=b&&b.status_txt||"Oops, something went wrong. Please check your information and try again.",console.log("Error creating user")})}},a.validate=function(){return a.account.consent&&a.account.consent.upload&&a.account.consent.share?a.account.name&&a.account.password&&a.account.name&&a.account.email?/^[0-9]{4}$/.test(a.account.password)?(a.errorMessage=null,!0):(a.errorMessage="Please provide a 4-digit PIN.",!1):(a.errorMessage="Please fill in all fields.",!1):(a.errorMessage="You must consent to the required terms to participate.",!1)}}]).controller("SigninController",["$scope","$http","UserService","apiRoot",function(a,b,c,d){a.account={isSignedIn:!1},a.signout=function(){a.account.isSignedIn=!1,a.message=!1,c.user.isSignedIn=!1},a.submit=function(){var e=d+"/account/"+a.account.username;b.get(e).success(function(b){if(200===b.status_code){var d=b.data;d.password===a.account.password?(a.account.isSignedIn=!0,window.sessionStorage.account=a.account,c.user.username=a.account.username,c.user.isSignedIn=a.account.isSignedIn,a.message="Welcome, "+a.account.username+"! If this is not you, "):(a.account.isSignedIn=!1,a.message="We didn't recognize your username and password.",console.log("pass not right."))}}).error(function(b,c){400===b.status_code&&(a.errorName="We didn't recognize your username and password.",console.log("username doesn't exist."))})}}]).controller("ObservationsCtrl",["$scope","$http","NgMap","apiRoot",function(a,b,c,d){a.gmap=this,a.gmap.observations=[],a.fixFormatting=function(a){a&&(a.context.extras=angular.fromJson(a.context.extras),"BirdCounting"===a.kind&&(a.content=angular.fromJson(a.content),a.context.extras.Birds.forEach(function(b){a.content.birds.forEach(function(a){b.name===a.name&&(a.image=b.image)})})))},c.getMap().then(function(c){return a.gmap.map=c,console.log("Loaded map"),b.get(d+"/notes").success(function(b){a.gmap.observations=b.data.filter(function(a){return"deleted"!==a.status}),a.gmap.observations.forEach(function(b){try{a.fixFormatting(b)}catch(c){console.log("Could not format extras: ",b.context.extras)}})}).error(function(a){console.log("Error getting observations: ",a)})}),a.showWindow=function(b,c){var d=new google.maps.InfoWindow({content:angular.toJson(c)});d.open(a.gmap.map,this)},a.selectObservation=function(b,c){a.obs=c,a.gmap.map.showInfoWindow("iw",this),console.log(c)}}]),nnWebApp.factory("UserService",function(){return{user:{username:"",isSignedIn:!1}}}),nnWebApp.factory("observations",["$resource","apiRoot",function(a,b){var c=a(b+"/sync/notes/within/:yyyy/:mm/at/aces",{yyyy:"2015",mm:"03"}),d=c.get({yyyy:"2015",mm:"11"}).data;return d.forEach(function(a){a.context.extras=angular.fromJson(a.context.extras)}),d}]),nnWebApp.directive("obsMarker",function(){return{restrict:"E",scope:{obs:"="},templateUrl:"scripts/directives/obsMarker.html"}}),nnWebApp.directive("obsWindow",["$templateRequest","$compile",function(a,b){return{scope:!0,link:function(c,d,e){a("views/obsWindow.html").then(function(a){d.append(b(a)(c))})}}}]),nnWebApp.directive("registerForm",["$templateRequest","$compile",function(a,b){return{scope:!0,link:function(c,d,e){a("views/register.html").then(function(a){d.append(b(a)(c))})}}}]),angular.module("naturenetWebApp").controller("AboutCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]);