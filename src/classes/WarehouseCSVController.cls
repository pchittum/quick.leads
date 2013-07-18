public class WarehouseCSVController{
    
    public transient List<Merchandise__c> merchandise {get;set;}
    
    public WarehouseCSVController(){
    	merchandise = [select name,Quantity__c,Price__c from Merchandise__c limit 10000];    
    }

}