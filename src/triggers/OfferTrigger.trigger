trigger OfferTrigger on Offer__c (before insert, before update, before delete, after insert, after update, after delete, after undelete) {
    
    if (Trigger.isBefore){
        
        if (Trigger.isInsert){
            
        } else if (Trigger.isUpdate){
            
        } else {
            //this part is delete
        }
        
    } else {
        //this is all my after state processing
        
        if (Trigger.isInsert){
            
        } else if (Trigger.isUpdate){
            
            List<Offer__c> offers = Trigger.new; //this has a max size of 200!
            Map<Id,Job_Application__c> appsForUpdate = new Map<Id,Job_Application__c>();
            
            for (Offer__c o : offers){
                if (o.Status__c == 'Accepted' && o.Job_Application__c != null){//we still need to check for old versus new values
                    appsForUpdate.put(o.Job_Application__c,new Job_Application__c(id=o.Job_Application__c,Status__c='Closed'));
                }
            }
            update appsForUpdate.values();
        } else if (Trigger.isDelete) {
            //this part is delete
        } else {
            
        }
    }

}