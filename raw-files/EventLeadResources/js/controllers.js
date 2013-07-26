//BEGIN controllers.js

//**
// * Controller for EventLead_Home partial
// */
//angular.module('EventLeadVF').controller('WonderDetailCtrl',
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
	    Event.query(
	        function (data) {
	            $scope.events = data.records;
	            
	//          if ($scope.events.length > 0) {
	//              ActiveEvent.EventName = $scope.events[0].Parent.Name; 
	//          }
	            
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
	        
	    }
	    
	    $scope.logout = function () {
	        AngularForce.logout();
	        $location.path('/login');
	    }
	}
]);

//**
// * Controller for Login page controller. Not used typically for VF app
// */
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

//Not in use. Hold-over from Quick Start app. Leaving this here to have an example for a callback function 
angular.module('EventLeadVF').controller('CallbackCtrl',['$scope', 'AngularForce', '$location',
	function($scope, AngularForce, $location) {
		AngularForce.oauthCallback(document.location.href);
		$location.path('/home');
	}
]);
//**
// * Controller for EventLead_Offer partial. Present a list of child campaigns of our Event campaign. Implements actions for selecting an offer. 
// */

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
		};
	}
]);

//**
// * Controller for EventLead_Contact partial. Present a list of contacts. Implements actions for selecting an offer. 
// * Actual underlying data is Lead.
// */
angular.module('EventLeadVF').controller('ContactListCtrl',['$scope', 'AngularForce', '$location', 'Lead', 'NewLeadService', 'ActiveEvent',
	function($scope, AngularForce, $location, Lead, NewLeadService, ActiveEvent) {
		$scope.authenticated = AngularForce.authenticated();
		if (!$scope.authenticated) {
			return $location.path('/login');
		}

		$scope.searchTerm = '';
		$scope.working = false;
		$scope.contacts = [];
	
		//PJCTODO: must consider moving this to the time of selection instead of here
		Lead.setNewWhere('Id in (SELECT LeadId FROM CampaignMember WHERE CampaignId = \'' + ActiveEvent.EventId + '\')');

		$scope.isWorking = function () {
			return $scope.working;
		};

	//SOSL safe search: must include at least two characters for valid search
		$scope.doSearch = function () {
			if ($scope.searchTerm || $scope.searchTerm > 1) {
				Lead.search($scope.searchTerm, function (data) {
					$scope.contacts = data;
					$scope.$apply();//Required coz sfdc uses jquery.ajax
				}, function (data) {
				});
			} else {
				$scope.contacts = [];
			}
		};

		$scope.doView = function (contact) {
  
			NewLeadService.CompanyName = contact.Company;
			NewLeadService.FirstName = contact.FirstName;
			NewLeadService.LastName = contact.LastName;
			NewLeadService.Email = contact.Email;
			NewLeadService.LeadId = contact.Id;

			console.log('doView');
			$location.path('/view/' + NewLeadService.OfferId);
		};

		$scope.doCreate = function () {
			$location.path('/newContact');
		}
	}
]);

//says "Contact" but really is a lead
//initially I was using contacts for everything
angular.module('EventLeadVF').controller('ContactCreateCtrl',['$scope', 'AngularForce', '$location', 'Lead', 'NewLeadService', 'CampaignMember', 'ActiveEvent',
	function($scope, AngularForce, $location, Lead, NewLeadService, CampaignMember, ActiveEvent) {

		$scope.cmpMember = {
			ContactId : '', 
			LeadId : '', 
			CampaignId : ActiveEvent.EventId, 
			Status : 'Attendee' 
		}

		$scope.save = function () {
	
			console.log('company name: ' + $scope.contact.CompanyName);
			console.log('first name: ' + $scope.contact.FirstName);
		
			//PJCTODO: might dispense with below. by creating lead here holding lead state probably is irrelevant
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
				});
			});
		}
	}
]);

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
	
		//PJCTODO: Clean Up once lead is the single point of truth
		$scope.newLead = {
			FirstName : NewLeadService.FirstName,
			LastName : NewLeadService.LastName, 
			Company : NewLeadService.CompanyName,
			Email : NewLeadService.Email,
			Status : NewLeadService.LeadStatus,
			LeadSource : NewLeadService.LeadSource,
			Id : '' 
		}
		console.log($scope.newLead);
	
		$scope.cmpMember = {
			ContactId : '', //currently not used - Lead campaign members indicate responses for this app
			LeadId : NewLeadService.LeadId, 
			CampaignId : NewLeadService.OfferId,
			Status : '' //to be set when accepted or rejected
		}
		console.log($scope.cmpMember);
	
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

		}
	
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

		}

	}
]);

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
        }
    }
]);
   
//END controllers.js
