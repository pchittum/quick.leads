/**
 * ActiveEvent service object for cached event information that will be used across several queries and pages.  
 *
 * EventId: store the selected ID for the event. Drives which child campaigns come to represent an "Offer" in our context
 * EventName: Name for labeling and identity on pages
 * EventBranding: NOT CURRENTLY IMPLEMENTED wish list to apply CSS for specific events so that selecting an event updates certain UI elements
 * EventCampaignMemberIds: NOT IMPLEMENTED wish list item an array of IDs of contacts to pass into an IN clause when querying contacts
 *
 * Injected into: HomeCtrl, OfferListCtrl, ContactListCtrl, ContactCreateCtrl
 */

app.factory('ActiveEvent', function() {
    return {
        EventId : '',
        EventName : '',
        EventBranding : '',
        EventCampaignMembers : ''
    };
});

/**
 * NewLeadService service object for cached state about the contact, lead and campaign members we record each time a person at our event expresses interest in an offer.  
 *
 * Currently this is hard coded, but at some point I could see using a custom setting or some other Salesforce-driven data
 *
 * OfferId: Campaign ID for the offer that someone has expressed interest in
 * FirstName: Lead first name
 * LastName: Lead last name
 * Email: Lead email
 * CompanyName: Lead Company
 * LeadStatus: Status value to be set on lead - Default "Open"
 * LeadSource: LeadSource field value to be set on Lead - Default "Trade Show"
 * AcceptedMbrStatus: Status on CampaignMember for someone who has indicated they want the offer
 * RejectedMbrStatus: Status on CampaignMember for someone who has indicated interest in the offer
 * ContactId: Cached contact id. Currently not used.
 * LeadId: LeadId. We hold onto this until the contact has walked away from the booth as standard Salesforce campaign behavior is to associate on Lead to many campaigns using Campaign member. This makes the Lead sticky and means we will not require additional lookups of a contact when they are interested in multiple offers.
 *
 * Injected into: OfferListCtrl, ContactListCtrl, ContactCreateCtrl, OfferViewCtrl, ContinueCtrl
 */

app.factory('NewLeadService', function() {
    return {
        OfferId : '', 
        FirstName : '',
        LastName : '', 
        Email : '',
        CompanyName : '',
        LeadStatus : 'Open',
        LeadSource : 'Trade Show',
        AcceptedMbrStatus : 'Responded',
        RejectedMbrStatus : 'Sent',
        ContactId : '',
        LeadId : ''
    };
});


/**
 * Contact Module: Contact sObject
 * Not in use for quick.leads app, but I'm leaving this here. App could be changed to use Contact
 * Campaign Members in future and this module might be needed at that point. 
 * If added back in you will need to include this module as a sub dependency in the main EventLeadVF module in app.js
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */

angular.module('Contact', []).factory('Contact', 
	function (AngularForceObjectFactory) {
		//Describe the contact object
		var objDesc = {
			type: 'Contact',
			fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id', 'Account.Name'],
			where: '',
			orderBy: 'LastName',
			limit: 20
		};
		var Contact = AngularForceObjectFactory(objDesc);

		return Contact;
	}
);


/**
 * Lead Module: Lead sObject
 * Lead is used to represent a person we have presented an offer to, and a person who is registered 
 * for the event and attached to the parent campaign as a campaign member. The UI presents this as a "Contact"
 * 
 * Injected into ContactCreateCtrl, ContactListCtrl, OfferViewCtrl, 
 *  
 */

angular.module('Lead', []).factory('Lead', 
	function (AngularForceObjectFactory) {
		//Describe the Lead object
		var objDesc = {
			type: 'Lead',
			fields: ['FirstName', 'Company', 'LastName', 'Title', 'Phone', 'Email', 'Id'],
			where: '',
			orderBy: 'LastName',
			limit: 20
		};
		var Contact = AngularForceObjectFactory(objDesc);

		return Contact;
	}
);


/**
 * Event Module: Campaign sObject
 * Event represents a top-level campaign in the campaign hierarchy where Type is one of 'Seminar / Conference',  
 * 'Conference' or 'Trade Show' and Status is 'In Progress'. 
 *
 * All Lead campaign members associated with this parent campaign will be included in the 'Contact' search
 * 
 * Injected into: HomeCtrl
 * 
 * Nice to add would be to not hard code this in the controller but add a custom setting that allowed 
 * configuration of this where clause 
 * 
 * Also on wish list would be a basic AngularJS filter on the home page. Would be pretty easy to enable
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
   
angular.module('Event', []).factory('Event', function (AngularForceObjectFactory) {
               //TODO: Customize what consitutes an "Event" in the 'where' JSON element below. 
               //Default is top level Campaigns only (ParentId = null) and the standard picklist value of 'Seminar / Conference'
    var objDesc = {
        type: 'Campaign',
        fields: ['Id','Name', 'Description', 'StartDate', 'EndDate', 'Status', 'Type', 'NumberOfLeads', 'NumberOfContacts', 'NumberOfResponses', 'EventLead_ImageURL__c'],
        where: 'Type IN (\'Seminar / Conference\',\'Conference\',\'Trade Show\') AND Status = \'In Progress\' AND ParentId = null',
        orderBy: 'Name',
        limit: 20
    }
    var Event = AngularForceObjectFactory(objDesc);
  
    return Event;
});

/**
 * Offer Module: Campaign sObject
 * 'Offer' is a campaign that is a child of the 'Event' parent campaign. Where gets set during the
 * app flow to the parent ID of selected 'Event' campaign. 
 *
 * Injected Into: OfferListCtrl, OfferViewCtrl
 */

angular.module('Offer', []).factory('Offer', function (AngularForceObjectFactory) {
    var objDesc = {
        type: 'Campaign',
        fields: ['Id','Name', 'Description', 'Parent.Name', 'Parent.EventLead_ImageURL__c', 'StartDate', 'EndDate', 'Status', 'Type', 'NumberOfLeads', 'NumberOfContacts', 'NumberOfResponses', 'EventLead_ImageURL__c'],
        where: '', //this WHERE gets set at the selection of the event to the event's Campaign ID. for other WHERE filters, add to that where clause. 
        orderBy: 'Name',
        limit: 20
    }
    var Offer = AngularForceObjectFactory(objDesc);
    
    return Offer;
});    

/**
 * CampaignMember Module: CampaignMember sObject
 * Junction object between Campaign and Lead (or Contact). Lead is the only campaign member type in 
 * use currently in this app. When new Leads are added (the 'new contact' flow) or when new offer
 * interest is registered for one of the child campaigns, CampaignMember creates the link between the
 * Lead and whichever Campaign is in play. 
 *
 * Injected into: ContactCreateCtrl, OfferViewCtrl
 */

angular.module('CampaignMember', []).factory('CampaignMember', function (AngularForceObjectFactory) {
    //Describe the contact object
    var objDesc = {
        type: 'CampaignMember',
        fields: ['Status', 'LeadId', 'Id', 'HasResponded', 'FirstRespondedDate', 'ContactId', 'CampaignId'],
        where: '',
        orderBy: '',
        limit: 20
    };
    var CampaignMember = AngularForceObjectFactory(objDesc);

    return CampaignMember;
});
