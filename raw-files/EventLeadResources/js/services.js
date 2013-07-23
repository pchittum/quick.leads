//BEGIN services.js
/**
 * ActiveEvent service object for cached event information that will be used across several queries and pages.  
 *
 * EventId: store the selected ID for the event. Drives which child campaigns come to represent an "Offer" in our context
 * EventName: Name for labeling and identity on pages
 * EventBranding: NOT CURRENTLY IMPLEMENTED wish list to apply CSS for specific events so that selecting an event updates certain UI elements
 * EventCampaignMemberIds: NOT IMPLEMENTED wish list item an array of IDs of contacts to pass into an IN clause when querying contacts
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


// BEGIN services.js
/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */

angular.module('Contact', []).factory('Contact', function (AngularForceObjectFactory) {
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
});

angular.module('Lead', []).factory('Lead', function (AngularForceObjectFactory) {
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
});
   
angular.module('Event', []).factory('Event', function (AngularForceObjectFactory) {
               //TODO: Customize what consitutes an "Event" in the 'where' JSON element below. 
               //Default is top level Campaigns only (ParentId = null) and the standard picklist value of 'Seminar / Conference'
    var objDesc = {
        type: 'Campaign',
        fields: ['Id','Name', 'Description', 'StartDate', 'EndDate', 'Status', 'Type', 'NumberOfLeads', 'NumberOfContacts', 'NumberOfResponses', 'EventLead_ImageURL__c'],
        where: 'Type = \'Seminar / Conference\' AND Status = \'In Progress\' AND ParentId = null',
        orderBy: 'Name',
        limit: 20
    }
    var Event = AngularForceObjectFactory(objDesc);
  
    return Event;
});

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
