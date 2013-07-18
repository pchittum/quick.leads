trigger NoteTrigger on Note (after delete, after insert, after undelete, 
after update, before delete, before insert, before update) {
	
	for (Note n: Trigger.new) {
		n.IsPrivate = false;
	}
	
	List<Account> accList = new List<Account> ([select AccountNumber from Account where Name='Acme']); 
	System.debug(accList[0].Name ) ;

}