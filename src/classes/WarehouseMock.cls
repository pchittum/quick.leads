@isTest
global class WarehouseMock implements HttpCalloutMock {
    // Implement this interface method 
    
    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{ "Items": [ { "Name": "Laptop From Endpoint", "Price": 2999.99, "Quantity": 4 }, { "Name": "Super Duper Laptop", "Price": 3999.99, "Quantity": 4 } ] }');
        res.setStatusCode(200);
        return res;
    }
}