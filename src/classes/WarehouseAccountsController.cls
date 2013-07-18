public with sharing class WarehouseAccountsController{
    
    public Decimal lat {get;set;}
    public Decimal lng {get;set;}
    
    public List<Account> getAccounts(){
        
        String q = 'select id, name, ShippingStreet, ShippingCity from Account WHERE DISTANCE(Location__c, GEOLOCATION('+String.valueof(lat)+','+String.valueof(lng)+'), \'km\') < 100';
        
        return Database.query(q);
    }
    
}