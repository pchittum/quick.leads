/**
 * Controller for EventLead_Home partial
 */
angular.module('EventLeadVF').controller('HomeCtrl', ['$scope', 'AngularForce', '$location', '$route', 'Event', 'ActiveEvent',
	function($scope, AngularForce, $location, $route, Event, ActiveEvent) {
	
	    $scope.authenticated = AngularForce.authenticated();
	    if (!$scope.authenticated) {
	        if (AngularForce.inVisualforce) {
	            AngularForce.login();
	        } else {    
	            return $location.path('/login');
	        }
	    } else if (ActiveEvent.EventId) {
	        console.log('Event Id is: ' +ActiveEvent.EventId);
	        return $location.path('/offers');
	    }
		
		//TODO: not implemented currently
		//at some point this will likely come up for larger organizations where there might be many active event-type campaigns
		//an alternative I will explore is to actually use the built-in filter features of AngularJS so that
		//we retrieve and cache a number of parent campaigns on app load and then filter our model on the client side
		//in this case the filter will be imlemented on EventLead_Home.page
	    Event.query(
	        function (data) {
	            $scope.events = data.records;
	            $scope.$apply();//Required coz sfdc uses jquery.ajax
	        }, 
	        function (data) {
	            alert('Query Error');
	        }
	    );
	    
	    $scope.setCampaign = function(SelectedId) {
	        console.log("HomeCtrl set event campaign");
	        ActiveEvent.EventId = SelectedId; 
	        console.log(SelectedId); 
	        
	        //TODO: retrieve campaign name and branding: cache in ActiveEvent service
	        
	        $location.path('/offers');  
	        
	    } //$scope.setCampaign
	    
	    //another relic from the hosted and cordova versions of the app
	    $scope.logout = function () {
	        AngularForce.logout();
	        $location.path('/login');
	    }
	}
]);

/**
 * Controller for Login page controller. Not used typically for VF app
 */
angular.module('EventLeadVF').controller('LoginCtrl',['$scope', 'AngularForce', '$location',
	function($scope, AngularForce, $location) {
		$scope.login = function () {
			AngularForce.login();
		}

		if (AngularForce.inVisualforce) {
			AngularForce.login();
			console.log("LoginCtrl just authenticated go to /");
			$location.path('/');
		}
	}
]);

//Relic from Quick Start app. Callback function for successful login. Never tested with this disabled, so leaving it.
angular.module('EventLeadVF').controller('CallbackCtrl',['$scope', 'AngularForce', '$location',
	function($scope, AngularForce, $location) {
		AngularForce.oauthCallback(document.location.href);
		$location.path('/home');
	}
]);

/**
 * Controller for EventLead_Offer partial. Present a list of child campaigns of our Event campaign. Implements actions for selecting an offer. 
 */

angular.module('EventLeadVF').controller('OfferListCtrl', ['$scope', 'AngularForce', '$location', 'Offer', 'ActiveEvent', 'NewLeadService',
	function($scope, AngularForce, $location, Offer, ActiveEvent, NewLeadService) {
		$scope.authenticated = AngularForce.authenticated();
		if (!$scope.authenticated) {
			return $location.path('/login');
		}
		console.log('in OfferListCtrl');
		
		Offer.setNewWhere('ParentId = \'' + ActiveEvent.EventId + '\' AND Status = \'In Progress\'');
	
		Offer.query(function (data) {
			$scope.offers = data.records;
			$scope.$apply();//Required coz sfdc uses jquery.ajax
		}, function (data) {
			alert('Query Error');
		});

		$scope.isWorking = function () {
			return $scope.working;
		};

		$scope.selectOffer = function (campaignId) {
			console.log('NewLeadService offer: ' + NewLeadService.OfferId);
			NewLeadService.OfferId = campaignId;
			if (NewLeadService.LeadId) {
				$location.path('/view/' + NewLeadService.OfferId);
			} else {
				$location.path('/contacts');
			}
		}; //$scope.selectOffer
	}
]);

/**
 * Controller for EventLead_Contact partial. Present a list of contacts. Implements actions for selecting an offer. 
 * Actual underlying data is Lead sObject.
 */
angular.module('EventLeadVF').controller('ContactListCtrl',['$scope', 'AngularForce', '$location', 'Lead', 'NewLeadService', 'ActiveEvent',
	function($scope, AngularForce, $location, Lead, NewLeadService, ActiveEvent) {
		$scope.authenticated = AngularForce.authenticated();
		if (!$scope.authenticated) {
			return $location.path('/login');
		}

		$scope.searchTerm = '';
		$scope.working = false;
		$scope.contacts = [];
	
		//TODO: considering moving this to the time of selection instead of here
		Lead.setNewWhere('Id in (SELECT LeadId FROM CampaignMember WHERE CampaignId = \'' + ActiveEvent.EventId + '\')');

		$scope.isWorking = function () {
			return $scope.working;
		};

	//SOSL safe search: must include at least two characters for valid search
		$scope.doSearch = function () {
			if ($scope.searchTerm && $scope.searchTerm.length > 1) { //search invokes SOSL, so we do not want to invoke this unless we have at least 2 characters (SOSL search rules)
				Lead.search($scope.searchTerm, function (data) {
					$scope.contacts = data;
					$scope.$apply();//Required coz sfdc uses jquery.ajax
				}, function (data) {
				});
			} else {
				$scope.contacts = [];
			}
		}; //$scope.doSearch

		$scope.doView = function (contact) {
  
			NewLeadService.CompanyName = contact.Company;
			NewLeadService.FirstName = contact.FirstName;
			NewLeadService.LastName = contact.LastName;
			NewLeadService.Email = contact.Email;
			NewLeadService.LeadId = contact.Id;

			console.log('doView');
			$location.path('/view/' + NewLeadService.OfferId);
		}; //$scope.doView

		$scope.doCreate = function () {
			$location.path('/newContact');
		}
	}
]);

/**
 * Controller for EventLead_ContactCreate partial. Create new Lead record and attach to parent Campaign (Event). 
 * Actual underlying data is Lead.
 */
angular.module('EventLeadVF').controller('ContactCreateCtrl',['$scope', 'AngularForce', '$location', 'Lead', 'NewLeadService', 'CampaignMember', 'ActiveEvent',
	function($scope, AngularForce, $location, Lead, NewLeadService, CampaignMember, ActiveEvent) {

		$scope.cmpMember = {
			ContactId : '', 
			LeadId : '', 
			CampaignId : ActiveEvent.EventId, 
			Status : 'Attendee' 
		} //@scope.cmpMember

		$scope.save = function () {
	
			console.log('company name: ' + $scope.contact.CompanyName);
			console.log('first name: ' + $scope.contact.FirstName);
		
			//TODO: might dispense with below. by creating lead here holding lead state probably is irrelevant
			//kept for initial app launch. originally I was working with both contact and lead for the sake of
			//simplicity and to not have to resolve new contacts to Accounts, I've made is so that this app
			//only deals with leads. Since we are always creating a lead now in advance of the actual offer
			//presentation, we no longer need to cache a lead state except for an ID in the save callback function
			//below. 
			NewLeadService.CompanyName = $scope.contact.Company;
			NewLeadService.FirstName = $scope.contact.FirstName;
			NewLeadService.LastName = $scope.contact.LastName;
			NewLeadService.Email = $scope.contact.Email;
			NewLeadService.Phone = $scope.contact.Phone;
			NewLeadService.Title = $scope.contact.Title;

			Lead.save($scope.contact, function (contact) {
				console.log('callback on new lead save.');
				NewLeadService.LeadId = contact.Id;
				$scope.cmpMember.LeadId = contact.Id;
			
				console.log('cmp member: ');
				console.log($scope.cmpMember);
			
				CampaignMember.save($scope.cmpMember, function (cmpMember){     
					console.log('saved campaign member as: ' + cmpMember);      
					$scope.$apply(function () {            
						$location.path('/view/' + NewLeadService.OfferId);
					});
				}); //CampaignMember.save(...)
			}); //$Lead.save(...)
		} //$scope.save
		
		$scope.doCancel = function () {
			$location.path('/offers');
		}
	}
]);

/**
 * Controller for EventLead_Contact partial. Present a list of contacts. Implements actions for selecting an offer. 
 * Actual underlying data is Lead.
 */

angular.module('EventLeadVF').controller('OfferViewCtrl',['$scope', 'AngularForce', '$location', '$routeParams', 'Offer', 'NewLeadService', 'CampaignMember', 'Lead',
	function($scope, AngularForce, $location, $routeParams, Offer, NewLeadService, CampaignMember, Lead) {
		$scope.authenticated = AngularForce.authenticated();
		if (!$scope.authenticated) {
			return $location.path('/login');
		}
		console.log('in OfferViewCtrl');

		AngularForce.login(function () {
			Offer.get({id: $routeParams.offerId}, function (offer) {
				self.original = offer;
				$scope.offer = new Offer(self.original);
				$scope.$apply();//Required coz sfdc uses jquery.ajax
			});
		});
	
		//TODO: Again a RELIC from the contact version of things. I am keeping this for now, but could
		//easily be removed unless you want to keep the lead as the only campaign member.
		$scope.newLead = {
			FirstName : NewLeadService.FirstName,
			LastName : NewLeadService.LastName, 
			Company : NewLeadService.CompanyName,
			Email : NewLeadService.Email,
			Status : NewLeadService.LeadStatus,
			LeadSource : NewLeadService.LeadSource,
			Id : '' 
		} //$scope.newLead object
	
		$scope.cmpMember = {
			ContactId : '', //currently not used - Lead campaign members indicate responses for this app
			LeadId : NewLeadService.LeadId, 
			CampaignId : NewLeadService.OfferId,
			Status : '' //to be set when accepted or rejected
		} //$scope.cmpMember object
	
		$scope.acceptOffer = function() {
	
			$scope.cmpMember.Status = NewLeadService.AcceptedMbrStatus;
		
			CampaignMember.save($scope.cmpMember, function (cmpMember) {
				console.log('saved campaign member as: ' + cmpMember);
				$scope.$apply(function () {
					$location.path('/continue');
				});
			}, function(err){
				console.log('error on save' + err)
				$scope.$apply(function () {
					$location.path('/continue');
				});
			});
	
			console.log(NewLeadService);

		} //$scope.acceptOffer
	
		$scope.rejectOffer = function() {
	
			$scope.cmpMember.Status = NewLeadService.RejectedMbrStatus;
		
			CampaignMember.save($scope.cmpMember, function (cmpMember) {
				console.log('saved campaign member as: ' + cmpMember);
				$scope.$apply(function () {
					$location.path('/continue');
				});
			}, function(err){
				console.log('error on save' + err)
				$scope.$apply(function () {
					$location.path('/continue');
				});
			});
	
			console.log(NewLeadService);

		} //$scope.rejectOffer

	}
]);

/**
 * Controller for EventLead_Continue partial. Choice to hold onto current Lead in context or clear and 
 * allowing selection of a new contact next time through 
 * 
 */

angular.module('EventLeadVF').controller('ContinueCtrl', ['$scope','$location','AngularForce','NewLeadService',
    function($scope, $location, AngularForce, NewLeadService){
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }
        
        $scope.keepLead = function(){
            $location.path('/home');
        }  
        
        $scope.clearLead = function(){
            NewLeadService.LeadId = '';
            NewLeadService.Company = '';
            NewLeadService.FirstName = '';
            NewLeadService.LastName = '';
            NewLeadService.Email = '';
            NewLeadService.Phone = '';
            NewLeadService.Title = '';
            $location.path('/home');
        } //$scope.clearLead
    }
]);
